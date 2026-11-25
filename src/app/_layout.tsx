import { Stack } from "expo-router";
import { ConfigurationNotice } from "../components/ConfigurationNotice";

export default function RootLayout() {
  return (
    <>
      <ConfigurationNotice />
      <Stack />
    </>
  );
}
