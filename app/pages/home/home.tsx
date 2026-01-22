import { View, Text } from "@tamagui/core";
import { Button, Card, XStack, YStack, Separator } from "tamagui";
import { Link } from "expo-router";
import { useUserStore } from "../../../stores/useUserStore";

export default function HomePage() {
  const { 
    common, 
    user, 
    purchase, 
    body, 
    macros, 
    bmi, 
    hasPremium, 
    getPremiumFeatures,
    signOut,
    calculateMacros,
    isAuthenticated 
  } = useUserStore();

  // Если пользователь не авторизован, показываем кнопку входа
  if (!isAuthenticated()) {
    return (
      <View flex={1} padding="$4" justifyContent="center" alignItems="center" gap="$4">
        <Text fontSize="$8" fontWeight="bold">🍎 Nutrition App</Text>
        <Text fontSize="$4" color="$gray10" textAlign="center">
          Приложение для отслеживания питания
        </Text>
        
        <Link href="/pages/auth/login" asChild>
          <Button backgroundColor="$blue10" width={200}>
            Войти
          </Button>
        </Link>
        
        <Link href="/pages/auth/register" asChild>
          <Button variant="outlined" width={200}>
            Регистрация
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <YStack flex={1} padding="$4" gap="$4">
      {/* Шапка профиля */}
      <Card elevate bordered>
        <Card.Header>
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <Text fontSize="$7" fontWeight="bold">
                👋 Привет, {common.username || user?.email?.split('@')[0]}!
              </Text>
              <Text fontSize="$3" color="$gray10">
                {user?.email}
              </Text>
            </YStack>
            
            <View padding="$2" backgroundColor="$blue3" borderRadius="$3">
              <Text fontSize="$2" fontWeight="bold" color="$blue10">
                {hasPremium() ? "🌟 PREMIUM" : "FREE"}
              </Text>
            </View>
          </XStack>
        </Card.Header>
      </Card>

      {/* Карточка статуса покупки */}
      <Card elevate bordered>
        <Card.Header>
          <Text fontSize="$5" fontWeight="bold">Статус доступа</Text>
        </Card.Header>
        <Card.Footer padded>
          <YStack gap="$2" flex={1}>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Тип:</Text>
              <Text fontWeight="bold">
                {purchase.type === "lifetime" ? "Пожизненный доступ" : "Бесплатный"}
              </Text>
            </XStack>
            
            {purchase.purchasedAt && (
              <XStack justifyContent="space-between">
                <Text color="$gray10">Куплен:</Text>
                <Text>{new Date(purchase.purchasedAt).toLocaleDateString()}</Text>
              </XStack>
            )}
            
            {purchase.transactionId && (
              <XStack justifyContent="space-between">
                <Text color="$gray10">ID транзакции:</Text>
                <Text fontSize="$2">{purchase.transactionId.slice(0, 8)}...</Text>
              </XStack>
            )}
            
            <Separator marginVertical="$2" />
            
            <Text fontSize="$3" fontWeight="bold">Доступные функции:</Text>
            <YStack gap="$1">
              {getPremiumFeatures().slice(0, 3).map((feature, index) => (
                <Text key={index} fontSize="$2">• {feature}</Text>
              ))}
              {getPremiumFeatures().length > 3 && (
                <Text fontSize="$2" color="$gray10">
                  и ещё {getPremiumFeatures().length - 3} функций
                </Text>
              )}
            </YStack>
          </YStack>
        </Card.Footer>
      </Card>

      {/* Карточка здоровья */}
      <Card elevate bordered>
        <Card.Header>
          <Text fontSize="$5" fontWeight="bold">📊 Ваше здоровье</Text>
        </Card.Header>
        <Card.Footer padded>
          <YStack gap="$2" flex={1}>
            <XStack gap="$4">
              <YStack flex={1}>
                <Text fontSize="$2" color="$gray10">Возраст</Text>
                <Text fontSize="$4" fontWeight="bold">{body.current.age} лет</Text>
              </YStack>
              
              <YStack flex={1}>
                <Text fontSize="$2" color="$gray10">Рост</Text>
                <Text fontSize="$4" fontWeight="bold">{body.current.height} см</Text>
              </YStack>
              
              <YStack flex={1}>
                <Text fontSize="$2" color="$gray10">Вес</Text>
                <Text fontSize="$4" fontWeight="bold">{body.current.weight || 0} кг</Text>
              </YStack>
            </XStack>
            
            <XStack gap="$4" marginTop="$2">
              <YStack flex={1}>
                <Text fontSize="$2" color="$gray10">ИМТ</Text>
                <Text fontSize="$4" fontWeight="bold">{bmi().toFixed(1)}</Text>
              </YStack>
              
              <YStack flex={1}>
                <Text fontSize="$2" color="$gray10">Активность</Text>
                <Text fontSize="$4" fontWeight="bold">{body.current.activity}</Text>
              </YStack>
              
              <YStack flex={1}>
                <Text fontSize="$2" color="$gray10">Жир</Text>
                <Text fontSize="$4" fontWeight="bold">{body.current.bf || 0}%</Text>
              </YStack>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>

      {/* Карточка макросов */}
      <Card elevate bordered>
        <Card.Header>
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$5" fontWeight="bold">🍽️ Дневные макросы</Text>
            <Button size="$2" onPress={calculateMacros}>
              Пересчитать
            </Button>
          </XStack>
        </Card.Header>
        <Card.Footer padded>
          <YStack gap="$3" flex={1}>
            <XStack justifyContent="space-between">
              <Text color="$gray10">Калории</Text>
              <Text fontSize="$5" fontWeight="bold" color="$orange10">
                {macros.kcal}
                <Text fontSize="$3"> ккал</Text>
              </Text>
            </XStack>
            
            <XStack gap="$4">
              <View flex={1} alignItems="center" backgroundColor="$blue2" padding="$2" borderRadius="$2">
                <Text fontSize="$2" color="$blue10">Белки</Text>
                <Text fontSize="$4" fontWeight="bold">{macros.proteins}г</Text>
              </View>
              
              <View flex={1} alignItems="center" backgroundColor="$green2" padding="$2" borderRadius="$2">
                <Text fontSize="$2" color="$green10">Углеводы</Text>
                <Text fontSize="$4" fontWeight="bold">{macros.carbs}г</Text>
              </View>
              
              <View flex={1} alignItems="center" backgroundColor="$yellow2" padding="$2" borderRadius="$2">
                <Text fontSize="$2" color="$yellow10">Жиры</Text>
                <Text fontSize="$4" fontWeight="bold">{macros.fats}г</Text>
              </View>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>

      {/* Кнопки действий */}
      <YStack gap="$2">
        <Link href="/pages/onboarding/onboarding" asChild>
          <Button>Go to onboarding</Button>
        </Link>
        
        {!hasPremium() && (
          <Link href="/pages/purchase" asChild>
            <Button backgroundColor="$green10" color="white">
              🚀 Купить Premium за $29.99
            </Button>
          </Link>
        )}
        
        <Button onPress={signOut} backgroundColor="$red10" color="white">
          Выйти
        </Button>
      </YStack>
    </YStack>
  );
}