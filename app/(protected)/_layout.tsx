import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../lib/authContext";

export default function ProtectedLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // или spinner
  }

  if (!session) {
    // Редирект на логин если нет сессии
    return <Redirect href="/pages/onboarding/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
      {/* другие защищённые экраны */}
    </Stack>
  );
}
