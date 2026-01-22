import { useState, useEffect } from "react";
import { View, Text } from "@tamagui/core";
import { Button, Input, YStack, XStack, Card, Spinner, Separator } from "tamagui";
import { Link } from "expo-router";
import { supabase } from "../../../lib/supabase";

export default function OnboardingScreen() {
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<string>("Не проверено");
  const [tables, setTables] = useState<any[]>([]);

  // Проверка текущей сессии
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user || null);
  };

  // Тест подключения к базе данных
  const testDatabase = async () => {
    setLoading(true);
    try {
      // Проверяем таблицу profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (profilesError) throw profilesError;

      // Получаем список таблиц (через запрос к системным таблицам)
      const { data: tablesData, error: tablesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (tablesError && tablesError.code !== 'PGRST116') {
        throw tablesError;
      }

      setDbStatus("✅ Подключение успешно");
      setTables(tablesData || []);
      
      setMessage(`База данных доступна. Таблица profiles: ${profiles ? 'OK' : 'Нет данных'}`);
    } catch (error: any) {
      setDbStatus("❌ Ошибка подключения");
      setMessage(`Ошибка БД: ${error.message}`);
      console.error("Database test error:", error);
    }
    setLoading(false);
  };

  // Тест аутентификации
  const testAuth = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (error) {
        setMessage(`❌ Ошибка: ${error.message}`);
      } else {
        setMessage("✅ Вход успешен!");
        setSession(data.session);
        setUser(data.user);
      }
    } catch (error: any) {
      setMessage(`❌ Исключение: ${error.message}`);
    }
    setLoading(false);
  };

  // Тест регистрации
  const testSignUp = async () => {
    setLoading(true);
    setMessage("");
    const randomEmail = `test${Date.now()}@example.com`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: randomEmail,
        password: "password123",
      });
      
      if (error) {
        setMessage(`❌ Регистрация: ${error.message}`);
      } else {
        setMessage(`✅ Регистрация успешна! Email: ${randomEmail}`);
        if (data.session) {
          setSession(data.session);
          setUser(data.user);
        }
      }
    } catch (error: any) {
      setMessage(`❌ Исключение: ${error.message}`);
    }
    setLoading(false);
  };

  // Выход
  const testSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setMessage("✅ Вы вышли из системы");
  };

  return (
    <YStack flex={1} padding="$4" gap="$4">
      <Text fontSize="$8" fontWeight="bold" textAlign="center">
        🔗 Тест Supabase
      </Text>

      {/* Статус подключения */}
      <Card elevate bordered>
        <Card.Header>
          <Text fontSize="$5" fontWeight="bold">Статус подключения</Text>
        </Card.Header>
        <Card.Footer padded>
          <YStack gap="$2" flex={1}>
            <XStack justifyContent="space-between">
              <Text color="$gray10">База данных:</Text>
              <Text fontWeight="bold" color={dbStatus.includes("✅") ? "$green10" : "$red10"}>
                {dbStatus}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text color="$gray10">Пользователь:</Text>
              <Text fontWeight="bold">
                {user ? user.email : "Не авторизован"}
              </Text>
            </XStack>
            
            <XStack justifyContent="space-between">
              <Text color="$gray10">User ID:</Text>
              <Text fontSize="$2" color="$gray10">
                {user?.id ? `${user.id.slice(0, 8)}...` : "—"}
              </Text>
            </XStack>
            
            {session && (
              <XStack justifyContent="space-between">
                <Text color="$gray10">Сессия создана:</Text>
                <Text fontSize="$2">
                  {new Date(session.created_at).toLocaleTimeString()}
                </Text>
              </XStack>
            )}
          </YStack>
        </Card.Footer>
      </Card>

      {/* Сообщения */}
      {message && (
        <Card backgroundColor={message.includes("✅") ? "$green2" : "$red2"} bordered>
          <Card.Header padding="$3">
            <Text color={message.includes("✅") ? "$green10" : "$red10"}>
              {message}
            </Text>
          </Card.Header>
        </Card>
      )}

      {/* Тестовые поля */}
      <YStack gap="$3">
        <Input
          placeholder="Email для теста"
          value={testEmail}
          onChangeText={setTestEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Input
          placeholder="Пароль для теста"
          value={testPassword}
          onChangeText={setTestPassword}
          secureTextEntry
        />
      </YStack>

      {/* Кнопки тестов */}
      <YStack gap="$2">
        <Button onPress={testDatabase} disabled={loading}>
          {loading ? <Spinner /> : "Тест подключения к БД"}
        </Button>
        
        <Button onPress={testAuth} disabled={loading} backgroundColor="$blue10">
          {loading ? <Spinner /> : "Тест входа"}
        </Button>
        
        <Button onPress={testSignUp} disabled={loading} variant="outlined">
          {loading ? <Spinner /> : "Тест регистрации"}
        </Button>
        
        {user && (
          <Button onPress={testSignOut} backgroundColor="$red10" color="white">
            Выйти
          </Button>
        )}
      </YStack>

      {/* Данные из БД (если есть) */}
      {tables.length > 0 && (
        <Card elevate bordered>
          <Card.Header>
            <Text fontSize="$5" fontWeight="bold">Данные из profiles:</Text>
          </Card.Header>
          <Card.Footer padded>
            <YStack gap="$2" flex={1}>
              {tables.slice(0, 3).map((item, index) => (
                <YStack key={index} gap="$1">
                  <Text fontSize="$2" color="$gray10">Запись #{index + 1}</Text>
                  <Text fontSize="$3">
                    {item.username || item.email || "Без имени"}
                  </Text>
                  <Separator />
                </YStack>
              ))}
              {tables.length > 3 && (
                <Text fontSize="$2" color="$gray10">
                  и ещё {tables.length - 3} записей
                </Text>
              )}
            </YStack>
          </Card.Footer>
        </Card>
      )}

      {/* Навигация */}
      <Separator marginVertical="$2" />
      
      <Link href="/pages/home/home" asChild>
        <Button>← На главную</Button>
      </Link>

      {/* Информация о Supabase */}
      <Card backgroundColor="$blue2" bordered>
        <Card.Header padding="$3">
          <Text fontSize="$2" color="$blue10">
            Supabase URL: xjitwqdszairtfchtlgm.supabase.co
          </Text>
        </Card.Header>
      </Card>
    </YStack>
  );
}