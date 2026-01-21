import { Stack } from "expo-router";
import { TamaguiProvider, Theme } from "@tamagui/core";
import { useColorScheme } from "react-native";
import config from "../tamagui.config";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === "dark" ? "dark" : "light"}>
        <Stack>
          <Stack.Screen name="index" />
          <Stack.Screen name="test-store" />
        </Stack>
      </Theme>
    </TamaguiProvider>
  );
}