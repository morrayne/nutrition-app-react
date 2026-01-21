import { View, Text } from "@tamagui/core";
import { Button } from "tamagui";

export default function TestTamagui() {
  return (
    <View flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Text fontSize="$8" color="$color" marginBottom="$4">
        Tamagui работает!
      </Text>
      <Button
        backgroundColor="$blue10"
        color="$white"
        padding="$4"
        borderRadius="$4"
        hoverStyle={{
          backgroundColor: "$blue8",
        }}
      >
        Кнопка Tamagui
      </Button>
    </View>
  );
}
