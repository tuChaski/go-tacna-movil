import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { PassengerLiveScreen } from "../src/features/passenger/screens/PassengerLiveScreen";
import { passengerCatalogService } from "../src/features/passenger/services/catalogService";
import { socketClient } from "../src/services/websocket/socketClient";
import type { ActiveUnits } from "../src/types/telemetry";

jest.mock("../src/features/passenger/components/PassengerMapView", () => ({
  PassengerMapView: () => null,
}));
jest.mock("../src/features/passenger/services/catalogService", () => ({
  passengerCatalogService: { load: jest.fn() },
}));
jest.mock("expo-location", () => ({}));
jest.mock("../src/services/websocket/socketClient", () => ({
  socketClient: {
    state: "connected",
    connect: jest.fn(() => ({ ok: true })),
    subscribe: jest.fn(),
    on: jest.fn(),
    onState: () => () => {},
    onError: () => () => {},
  },
}));

/** Recorre la entrada productiva con un catálogo y una sala aislados. Comprueba
 * selección, ficha, ausencia de trazado y nueva instantánea al recuperar el foco. */
test("la línea sigue siendo consultable sin geometría, paraderos ni GPS", async () => {
  const release = jest.fn();
  let snapshot: ((data: ActiveUnits) => void) | undefined;
  jest
    .mocked(socketClient.subscribe)
    .mockReturnValue({ ok: true, data: release });
  jest.mocked(socketClient.on).mockImplementation((event, listener) => {
    if (event === "route:joined")
      snapshot = listener as (data: ActiveUnits) => void;
    return () => {};
  });
  jest
    .mocked(passengerCatalogService.load)
    .mockResolvedValue({
      ok: true,
      data: {
        source: "network",
        stale: false,
        fetchedAt: 1,
        routes: [
          {
            id: 2,
            nombre_ruta: "Línea Sur",
            activo: true,
            empresa_id: 1,
            trazado_ruta: null,
          },
        ],
      },
    });
  const onBack = jest.fn();
  const view = await render(<PassengerLiveScreen active onBack={onBack} />);
  await fireEvent.press(await screen.findByLabelText("Seleccionar Línea Sur"));
  expect(screen.getByText(/no tiene un trazado/)).toBeTruthy();
  expect(screen.getByText(/Esperando la lista/)).toBeTruthy();
  await act(() =>
    snapshot?.({
      rutaId: 2,
      micros: [
        {
          microId: 7,
          rutaId: 2,
          lat: -18,
          lng: -70,
          status: "moviendo",
          speed: 5,
          lastSeen: Date.now(),
        },
      ],
    }),
  );
  await fireEvent.press(
    screen.getByRole("button", { name: "Micro 7 · moviendo" }),
  );
  expect(screen.getByText("Llegada aproximada · No disponible")).toBeTruthy();
  await fireEvent.press(
    screen.getByRole("button", { name: "Ver ubicación del micro" }),
  );
  await view.rerender(<PassengerLiveScreen active={false} onBack={onBack} />);
  expect(release).toHaveBeenCalledTimes(1);
  await view.rerender(<PassengerLiveScreen active onBack={onBack} />);
  expect(screen.getByText(/Esperando la lista/)).toBeTruthy();
  expect(screen.queryByText("Micro 7 · moviendo")).toBeNull();
});
