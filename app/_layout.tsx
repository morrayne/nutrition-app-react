import { Stack } from "expo-router";
import { TamaguiProvider, Theme } from "@tamagui/core";
import { useColorScheme } from "react-native";
import { AuthProvider } from "../lib/authContext";
import config from "../tamagui.config";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === "dark" ? "dark" : "light"}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="pages/onboarding/onboarding" />
            <Stack.Screen name="pages/home/home" />
            <Stack.Screen name="pages/auth/login" />
            <Stack.Screen name="pages/auth/register" />
          </Stack>
        </AuthProvider>
      </Theme>
    </TamaguiProvider>
  );
}