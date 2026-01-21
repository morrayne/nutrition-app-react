import { View, Text } from '@tamagui/core';
import { Button } from 'tamagui';

export default function HomeScreen() {
  return (
    <View flex={1} justifyContent="center" alignItems="center" gap="$4">
      <Text fontSize="$10" fontWeight="bold">
        🍎 Nutrition App
      </Text>
      <Text fontSize="$6" color="$gray10">
        Приложение для отслеживания питания
      </Text>
      <Button
        backgroundColor="$green8"
        color="$white"
        padding="$4"
        borderRadius="$8"
      >
        Начать использование
      </Button>
    </View>
  );
}