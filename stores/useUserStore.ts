import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

// Types - ОБНОВЛЕННЫЕ
interface UserCommonType {
  username: string;
  email: string;
  password: string;
  icon: number;
}

// ИЗМЕНЕНО: единоразовый платеж вместо подписки
interface UserPurchaseType {
  type: "free" | "lifetime"; // 'lifetime' вместо 'active'
  purchasedAt?: Date;
  transactionId?: string;
  features: string[]; // Какие фичи доступны
}

interface BodyMeasurementsType {
  age: number;
  height: number;
  activity: number;
  weight?: number;
  bf?: number;
}

interface BodyGoalType {
  weight: number;
  bf: number;
}

interface UserBodyType {
  gender: "male" | "female";
  current: BodyMeasurementsType;
  goal: BodyGoalType;
}

interface MacrosType {
  kcal: number;
  proteins: number;
  carbs: number;
  fats: number;
}

interface UserType {
  common: UserCommonType;
  purchase: UserPurchaseType; // ИЗМЕНЕНО: subscription → purchase
  body: UserBodyType;
  macros: MacrosType;
}

interface UserStore extends UserType {
  // Auth state
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  isProcessingPayment: boolean; // Новое поле для платежей

  // Getters
  hasPremium: () => boolean; // ИЗМЕНЕНО: вместо isSubscribed
  bmi: () => number;
  isAuthenticated: () => boolean;
  getPremiumFeatures: () => string[];

  // Auth Actions
  initializeAuth: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Payment Actions
  purchaseLifetime: (
    transactionId: string,
    amount: number,
    provider: string,
  ) => Promise<{ success: boolean; error?: string }>;
  checkPurchaseStatus: () => Promise<void>;
  restorePurchases: () => Promise<{ success: boolean; restored: boolean }>;

  // Sync with Supabase
  syncProfile: () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;

  // Existing actions (оставляем твои)
  updateCommon: (data: Partial<UserCommonType>) => void;
  updateBodyCurrent: (data: Partial<BodyMeasurementsType>) => void;
  updateBodyGoal: (data: Partial<BodyGoalType>) => void;
  updateMacros: (data: Partial<MacrosType>) => void;
  calculateMacros: () => void;
}

// Premium фичи для lifetime доступа
const PREMIUM_FEATURES = [
  "basic_tracking",
  "advanced_analytics",
  "meal_plans",
  "custom_recipes",
  "export_data",
  "premium_support",
  "unlimited_history",
  "food_database",
  "barcode_scanner",
  "macro_calculator",
];

// Базовые фичи для free
const FREE_FEATURES = ["basic_tracking"];

const defaultUser: UserType = {
  common: {
    username: "",
    email: "",
    password: "",
    icon: 0,
  },
  // ИЗМЕНЕНО: теперь purchase вместо subscription
  purchase: {
    type: "free",
    purchasedAt: undefined,
    transactionId: undefined,
    features: FREE_FEATURES,
  },
  body: {
    gender: "male",
    current: {
      age: 21,
      height: 180,
      activity: 1.55,
      weight: 72,
      bf: 10,
    },
    goal: {
      weight: 82,
      bf: 8,
    },
  },
  macros: {
    kcal: 0,
    proteins: 0,
    carbs: 0,
    fats: 0,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...defaultUser,

      // Auth state
      session: null,
      user: null,
      isLoading: false,
      authError: null,
      isProcessingPayment: false,

      // Getters
      hasPremium: () => get().purchase.type === "lifetime",

      bmi: () => {
        const weight = get().body.current.weight;
        const height = get().body.current.height / 100;
        return weight && height ? weight / (height * height) : 0;
      },

      isAuthenticated: () => !!get().session,

      getPremiumFeatures: () => {
        return get().purchase.type === "lifetime"
          ? PREMIUM_FEATURES
          : FREE_FEATURES;
      },

      // Auth Actions
      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            set({
              session,
              user: session.user,
              isLoading: false,
            });
            // Загружаем профиль из БД
            await get().loadProfile(session.user.id);
            // Проверяем статус покупки
            await get().checkPurchaseStatus();
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, authError: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.session) {
            set({
              session: data.session,
              user: data.user,
              isLoading: false,
            });

            // Обновляем email в common
            set((state) => ({
              common: { ...state.common, email },
            }));

            // Загружаем профиль
            await get().loadProfile(data.user.id);
            // Проверяем покупки
            await get().checkPurchaseStatus();

            return { success: true };
          }

          return { success: false, error: "No session returned" };
        } catch (error: any) {
          set({
            isLoading: false,
            authError: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      signUp: async (email: string, password: string, username: string) => {
        set({ isLoading: true, authError: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          });

          if (error) throw error;

          if (data.user) {
            // Создаем профиль в БД
            await supabase.from("profiles").insert({
              id: data.user.id,
              username,
              email,
              purchase: defaultUser.purchase, // Сохраняем данные о покупке
              created_at: new Date().toISOString(),
            });

            // Обновляем локальный store
            set({
              common: {
                username,
                email,
                password: "",
                icon: 0,
              },
              isLoading: false,
            });

            // Если сразу подтвержден email, логиним
            if (data.session) {
              set({
                session: data.session,
                user: data.user,
              });
            }

            return { success: true };
          }

          return { success: false, error: "No user returned" };
        } catch (error: any) {
          set({
            isLoading: false,
            authError: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({
            ...defaultUser,
            session: null,
            user: null,
            isLoading: false,
          });
        } catch (error) {
          console.error("Sign out error:", error);
          set({ isLoading: false });
        }
      },

      // Payment Actions
      purchaseLifetime: async (
        transactionId: string,
        amount: number,
        provider: string,
      ) => {
        set({ isProcessingPayment: true });
        try {
          const { user } = get();
          if (!user) throw new Error("User not authenticated");

          // 1. Сохраняем платеж в Supabase
          const { error: paymentError } = await supabase
            .from("payments")
            .insert({
              user_id: user.id,
              transaction_id: transactionId,
              amount,
              currency: "USD",
              status: "completed",
              product_type: "lifetime",
              provider,
              created_at: new Date().toISOString(),
            });

          if (paymentError) throw paymentError;

          // 2. Обновляем локальный store
          set({
            purchase: {
              type: "lifetime",
              purchasedAt: new Date(),
              transactionId,
              features: PREMIUM_FEATURES,
            },
            isProcessingPayment: false,
          });

          // 3. Синхронизируем с профилем
          await get().syncProfile();

          return { success: true };
        } catch (error: any) {
          console.error("Purchase error:", error);
          set({ isProcessingPayment: false });
          return { success: false, error: error.message };
        }
      },

      checkPurchaseStatus: async () => {
        try {
          const { user } = get();
          if (!user) return;

          // Проверяем в БД наличие lifetime покупки
          const { data, error } = await supabase
            .from("payments")
            .select("transaction_id, created_at")
            .eq("user_id", user.id)
            .eq("product_type", "lifetime")
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1);

          if (error) throw error;

          // Если есть активная покупка, обновляем локальные данные
          if (data && data.length > 0) {
            const latestPurchase = data[0];
            set({
              purchase: {
                type: "lifetime",
                purchasedAt: new Date(latestPurchase.created_at),
                transactionId: latestPurchase.transaction_id,
                features: PREMIUM_FEATURES,
              },
            });
          }
        } catch (error) {
          console.error("Check purchase status error:", error);
        }
      },

      restorePurchases: async () => {
        try {
          const { user } = get();
          if (!user) return { success: false, restored: false };

          set({ isLoading: true });

          // Проверяем все покупки пользователя
          const { data, error } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("created_at", { ascending: false });

          if (error) throw error;

          let restored = false;

          // Ищем lifetime покупку
          const lifetimePurchase = data?.find(
            (p) => p.product_type === "lifetime",
          );
          if (lifetimePurchase) {
            set({
              purchase: {
                type: "lifetime",
                purchasedAt: new Date(lifetimePurchase.created_at),
                transactionId: lifetimePurchase.transaction_id,
                features: PREMIUM_FEATURES,
              },
            });
            restored = true;
          }

          set({ isLoading: false });
          return { success: true, restored };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, restored: false, error: error.message };
        }
      },

      // Sync with Supabase Database
      syncProfile: async () => {
        const { user, common, body, purchase } = get();
        if (!user) return;

        try {
          await supabase.from("profiles").upsert({
            id: user.id,
            username: common.username,
            email: common.email,
            body_data: body,
            purchase: purchase, // Теперь purchase вместо subscription
            updated_at: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Sync profile error:", error);
        }
      },

      loadProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            // Если профиля нет, создаем его
            if (error.code === "PGRST116") {
              const { user } = get();
              if (user) {
                await supabase.from("profiles").insert({
                  id: userId,
                  username: get().common.username,
                  email: user.email,
                  purchase: defaultUser.purchase,
                  created_at: new Date().toISOString(),
                });
              }
              return;
            }
            throw error;
          }

          if (data) {
            set((state) => ({
              common: {
                ...state.common,
                username: data.username || state.common.username,
                email: data.email || state.common.email,
                icon: data.avatar_id || state.common.icon,
              },
              body: data.body_data || state.body,
              purchase: data.purchase || state.purchase, // Теперь purchase
            }));
          }
        } catch (error) {
          console.error("Load profile error:", error);
        }
      },

      // Existing actions
      updateCommon: (data) => {
        set((state) => ({
          common: { ...state.common, ...data },
        }));
        get().syncProfile();
      },

      updateBodyCurrent: (data) => {
        set((state) => ({
          body: {
            ...state.body,
            current: { ...state.body.current, ...data },
          },
        }));
        get().syncProfile();
      },

      updateBodyGoal: (data) => {
        set((state) => ({
          body: {
            ...state.body,
            goal: { ...state.body.goal, ...data },
          },
        }));
        get().syncProfile();
      },

      updateMacros: (data) => {
        set((state) => ({
          macros: { ...state.macros, ...data },
        }));
      },

      calculateMacros: () => {
        const weight = get().body.current.weight || 70;
        const height = get().body.current.height;
        const age = get().body.current.age;
        const activity = get().body.current.activity;

        let bmr;
        if (get().body.gender === "male") {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        const tdee = bmr * activity;

        set({
          macros: {
            kcal: Math.round(tdee),
            proteins: Math.round(weight * 2),
            carbs: Math.round((tdee * 0.5) / 4),
            fats: Math.round((tdee * 0.3) / 9),
          },
        });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Сохраняем только локальные данные
        common: state.common,
        purchase: state.purchase, // Теперь purchase
        body: state.body,
        macros: state.macros,
      }),
      onRehydrateStorage: () => (state) => {
        // При восстановлении из storage инициализируем auth
        if (state) {
          state.initializeAuth();
        }
      },
    },
  ),
);
