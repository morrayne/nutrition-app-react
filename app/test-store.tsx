import { View, Text, Button } from "tamagui";
import { useUserStore } from "../stores/useUserStore";

export default function TestStoreScreen() {
  const {
    common,
    subscription,
    body,
    macros,
    isSubscribed,
    bmi,
    updateBodyCurrent,
    calculateMacros,
    switchToPaid,
    logout,
  } = useUserStore();

  return (
    <View flex={1} padding="$4" gap="$4">
      <Text fontSize="$8" fontWeight="bold">
        User Store Test
      </Text>

      <View style={styles.card}>
        <Text fontSize="$6">
          Пользователь: {common.username || "Не авторизован"}
        </Text>
        <Text>Email: {common.email || "Не указан"}</Text>
        <Text>Подписка: {subscription.tier}</Text>
        <Text>Подписан: {isSubscribed() ? "Да" : "Нет"}</Text>
        <Text>ИМТ: {bmi().toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text fontSize="$6">Данные тела</Text>
        <Text>Пол: {body.gender === "male" ? "Мужской" : "Женский"}</Text>
        <Text>Возраст: {body.current.age} лет</Text>
        <Text>Рост: {body.current.height} см</Text>
        <Text>Вес: {body.current.weight || 0} кг</Text>
        <Text>Жир: {body.current.bf || 0}%</Text>
        <Text>Цель вес: {body.goal.weight} кг</Text>
        <Text>Цель жир: {body.goal.bf}%</Text>
      </View>

      <View style={styles.card}>
        <Text fontSize="$6">Макросы</Text>
        <Text>Калории: {macros.kcal} ккал</Text>
        <Text>Белки: {macros.proteins}г</Text>
        <Text>Углеводы: {macros.carbs}г</Text>
        <Text>Жиры: {macros.fats}г</Text>
      </View>

      <Button onPress={() => updateBodyCurrent({ weight: 75 })}>
        Увеличить вес до 75кг
      </Button>

      <Button onPress={() => updateBodyCurrent({ weight: 70 })}>
        Уменьшить вес до 70кг
      </Button>

      <Button onPress={calculateMacros}>Рассчитать макронутриенты</Button>

      <Button onPress={switchToPaid} backgroundColor="$blue8">
        Активировать подписку
      </Button>

      <Button onPress={logout} backgroundColor="$red8">
        Выйти
      </Button>
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: "$gray2",
    padding: "$4",
    borderRadius: "$4",
    gap: "$2",
  },
};
