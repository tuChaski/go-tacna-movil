/**
 * Prueba controles y flujos renderizados de Fase 2 con servicios nativos simulados.
 * Espera el renderizado y los eventos para comprobar la interfaz ya actualizada.
 * Valida comportamiento local, no gestos en dispositivo, GPS, telemetría en vivo,
 * foco del lector de pantalla ni usabilidad con participantes.
 */
import { fireEvent, render, screen, act } from "@testing-library/react-native";
import { ActionButton } from "../src/components/ActionButton";
import { ScreenStateView } from "../src/components/ScreenStateView";
import { PassengerHomeScreen } from "../src/features/passenger/screens/PassengerHomeScreen";
import { DriverConsoleScreen } from "../src/features/driver/screens/DriverConsoleScreen";
import { screenStatuses, screenStateContent } from "../src/types/ui";
import { colors } from "../src/theme";

describe("componentes y matriz de estados", () => {
  test.each(screenStatuses.filter((status) => status !== "ready"))(
    "estado %s en español con recuperación controlada",
    async (status) => {
      const action = jest.fn();
      await render(<ScreenStateView status={status} onAction={action} />);
      expect(screen.getByText(screenStateContent[status].title)).toBeTruthy();
      if (status !== "loading") {
        await fireEvent.press(screen.getByRole("button"));
        expect(action).toHaveBeenCalledTimes(1);
      } else expect(screen.queryByRole("button")).toBeNull();
    },
  );
  test("botón respeta 48dp y bloquea pulsaciones deshabilitadas o en carga", async () => {
    const action = jest.fn();
    const { rerender } = await render(
      <ActionButton title="Continuar" disabled onPress={action} />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ minHeight: 56, minWidth: 48 });
    await fireEvent.press(button);
    expect(action).not.toHaveBeenCalled();
    await rerender(<ActionButton title="Continuar" loading onPress={action} />);
    expect(screen.getByRole("button")).toBeDisabled();
    await rerender(<ActionButton title="Continuar" onPress={action} />);
    await fireEvent.press(screen.getByRole("button"));
    expect(action).toHaveBeenCalledTimes(1);
  });
  test.each(screenStatuses.filter((status) => status !== "ready"))(
    "los dos flujos contemplan %s y el conductor conserva indicadores",
    async (status) => {
      const { unmount } = await render(
        <PassengerHomeScreen status={status} onRecover={jest.fn()} />,
      );
      expect(screen.getByText(screenStateContent[status].title)).toBeTruthy();
      await unmount();
      await render(
        <DriverConsoleScreen status={status} onRecover={jest.fn()} />,
      );
      expect(screen.getByText(screenStateContent[status].title)).toBeTruthy();
      expect(screen.getByText(/GPS:/)).toBeTruthy();
      expect(screen.getByText(/Red:/)).toBeTruthy();
      expect(screen.getByRole("switch")).toBeDisabled();
    },
  );
});

describe("flujo de pasajero", () => {
  test("ruta → unidad → ubicación: 3 toques, detalle y estimación señalados como ejemplo", async () => {
    await render(<PassengerHomeScreen />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Seleccionar Línea 10" }),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Ver Micro 01" }));
    expect(screen.getByText("Micro 01")).toBeTruthy();
    expect(screen.getByText("6 min")).toBeTruthy();
    expect(screen.getByText(/Datos de demostración/)).toBeTruthy();
    await fireEvent.press(
      screen.getByRole("button", { name: "Ver ubicación" }),
    );
    expect(screen.getByText("Micro 01 seleccionado")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cerrar ficha" })).toBeNull();
  });
  test("punto de espera independiente y señal antigua sin ETA engañosa", async () => {
    await render(<PassengerHomeScreen />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Seleccionar Línea 10" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Ver Plaza de Armas" }),
    );
    expect(screen.getByText("Plaza de Armas")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Cerrar ficha" }));
    await fireEvent.press(screen.getByRole("button", { name: "Ver Micro 02" }));
    expect(screen.getByText("No disponible")).toBeTruthy();
    expect(screen.queryByText("9 min")).toBeNull();
  });
  test("cambiar de ruta limpia la selección anterior", async () => {
    await render(<PassengerHomeScreen />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Seleccionar Línea 10" }),
    );
    await fireEvent.press(screen.getByRole("button", { name: "Ver Micro 01" }));
    await fireEvent.press(
      screen.getByRole("button", { name: "Ver ubicación" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Seleccionar Línea 04" }),
    );
    expect(screen.queryByText("Micro 01 seleccionado")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Seleccionar Línea 04" }),
    ).toBeSelected();
  });
});

describe("consola del conductor", () => {
  test("inicia, cancela finalización y exige confirmación explícita sin perder el recorrido", async () => {
    jest.useFakeTimers();
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    const intervalSpy = jest.spyOn(global, "setInterval");
    const { unmount } = await render(<DriverConsoleScreen />);
    const control = screen.getByRole("switch");
    expect(control).toHaveStyle({ minHeight: 80, minWidth: 48 });
    await fireEvent.press(control);
    // Identifica el intervalo del recorrido; React Native puede programar otras tareas.
    // La limpieza debe liberar ese recurso, no todos los temporizadores del entorno.
    const timerId = intervalSpy.mock.results.at(-1)?.value;
    expect(screen.getByRole("switch")).toBeChecked();
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText("00:03")).toBeTruthy();
    await fireEvent.press(screen.getByRole("switch"));
    expect(screen.getByText("¿Finalizar el recorrido?")).toBeTruthy();
    await fireEvent.press(
      screen.getByRole("button", { name: "Continuar recorrido" }),
    );
    expect(screen.getByRole("switch")).toBeChecked();
    await fireEvent.press(screen.getByRole("switch"));
    await fireEvent.press(
      screen.getByRole("button", { name: "Finalizar recorrido" }),
    );
    expect(screen.getByRole("switch")).not.toBeChecked();
    expect(screen.getByText("00:00")).toBeTruthy();
    await unmount();
    expect(clearIntervalSpy).toHaveBeenCalledWith(timerId);
    clearIntervalSpy.mockRestore();
    intervalSpy.mockRestore();
    jest.clearAllTimers();
    jest.useRealTimers();
  });
  test("sin red no detiene automáticamente un recorrido; permite finalizarlo con confirmación", async () => {
    const { rerender } = await render(<DriverConsoleScreen />);
    await fireEvent.press(screen.getByRole("switch"));
    await rerender(<DriverConsoleScreen status="offline" />);
    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.getByRole("switch")).toBeEnabled();
    expect(screen.getByText(/Red: Sin conexión/)).toBeTruthy();
    await fireEvent.press(screen.getByRole("switch"));
    await fireEvent.press(
      screen.getByRole("button", { name: "Finalizar recorrido" }),
    );
    expect(screen.getByRole("switch")).toBeDisabled();
  });
  test("volver desde un recorrido activo también exige confirmar; cancelar conserva la pantalla", async () => {
    const back = jest.fn();
    await render(<DriverConsoleScreen onBack={back} />);
    await fireEvent.press(screen.getByRole("switch"));
    await fireEvent.press(screen.getByRole("button", { name: "Volver" }));
    expect(back).not.toHaveBeenCalled();
    await fireEvent.press(
      screen.getByRole("button", { name: "Continuar recorrido" }),
    );
    expect(screen.getByRole("switch")).toBeChecked();
    await fireEvent.press(screen.getByRole("button", { name: "Volver" }));
    await fireEvent.press(
      screen.getByRole("button", { name: "Finalizar recorrido" }),
    );
    expect(back).toHaveBeenCalledTimes(1);
  });
});

test("contraste de texto principal y estados ≥ 4.5:1 en superficies previstas", async () => {
  /**
   * Convierte un color opaco #RRGGBB en luminancia relativa: normaliza sRGB,
   * linealiza cada canal y aplica su peso perceptual. La comprobación inferior
   * valida numéricamente los pares de colores, no su visibilidad real bajo el sol.
   */
  function luminance(hex: string) {
    const rgb = [1, 3, 5]
      .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      );
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  for (const [foreground, background] of [
    [colors.text, colors.bg],
    [colors.muted, colors.surface],
    [colors.surface, colors.primary],
    [colors.successInk, colors.successBg],
    [colors.warningInk, colors.warningBg],
    [colors.errorInk, colors.errorBg],
    [colors.primaryInk, colors.infoBg],
  ]) {
    const values = [luminance(foreground), luminance(background)].sort(
      (a, b) => b - a,
    );
    expect((values[0] + 0.05) / (values[1] + 0.05)).toBeGreaterThanOrEqual(4.5);
  }
});
