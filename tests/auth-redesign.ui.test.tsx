import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import Welcome from "../src/app/(auth)";
import Login from "../src/app/(auth)/login";
import Register from "../src/app/(auth)/register";
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), canGoBack: () => false },
}));
/** Comprueba los puntos de entrada públicos y la validación local sin credenciales reales. */
test("la bienvenida abre el mapa sin exponer herramientas internas", async () => {
  await render(<Welcome />);
  expect(screen.queryByText(/conductor|revisión interna/i)).toBeNull();
  await fireEvent.press(screen.getByRole("button", { name: "Explorar rutas" }));
  expect(router.push).toHaveBeenCalledWith("/passenger");
});
test("el inicio de sesión exige correo y contraseña y señala la simulación", async () => {
  await render(<Login />);
  await fireEvent.press(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByText("Ingresa tu correo electrónico.")).toBeTruthy();
  await fireEvent.changeText(
    screen.getByLabelText("Correo electrónico"),
    "prueba@example.test",
  );
  await fireEvent.changeText(screen.getByLabelText("Contraseña"), "Ejemplo");
  await fireEvent.press(
    screen.getByRole("button", { name: "Mostrar contraseña" }),
  );
  await fireEvent.press(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByText("Acceso de demostración")).toBeTruthy();
});
test("el registro conserva sus validaciones y termina en la confirmación de demostración", async () => {
  await render(<Register />);
  await fireEvent.press(screen.getByRole("button", { name: "Crear cuenta" }));
  expect(screen.getByText("Ingresa tu nombre.")).toBeTruthy();
  for (const [label, value] of [
    ["Nombre", "Ana"],
    ["Correo electrónico", "ana@example.test"],
    ["Contraseña", "Ejemplo123"],
    ["Confirmar contraseña", "Ejemplo123"],
  ])
    await fireEvent.changeText(screen.getByLabelText(label), value);
  await fireEvent.press(screen.getByRole("checkbox"));
  await fireEvent.press(screen.getByRole("button", { name: "Crear cuenta" }));
  expect(router.replace).toHaveBeenCalledWith("/success");
});
