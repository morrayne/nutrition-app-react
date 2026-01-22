import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

// Адаптер для хранения токенов
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Твой Supabase URL и ключ
const supabaseUrl = "https://xjitwqdszairtfchtlgm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqaXR3cWRzemFpcnRmY2h0bGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMjI0MzAsImV4cCI6MjA4NDU5ODQzMH0.pzB166Cy96241tiXBoEXY7CaTOqKSqQJpvWkf42OA_E";

// Создаем клиент
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
