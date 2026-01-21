import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
interface UserCommonType {
  username: string;
  email: string;
  password: string;
  icon: number;
}

interface UserSubscriptionType {
  tier: "free" | "active";
  start?: Date;
  end?: Date;
  freeTrial?: boolean;
}

interface BodyMeasurementsType {
  age: number;
  height: number; // см
  activity: number; // 1.2, 1.375, 1.55, 1.725, 1.9
  weight?: number; // кг
  bf?: number; // процент жира
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
  subscription: UserSubscriptionType;
  body: UserBodyType;
  macros: MacrosType;
}

interface UserStore extends UserType {
  // Getters (вычисляемые свойства)
  isInTrial: () => boolean;
  isSubscribed: () => boolean;
  bmi: () => number;
  daysUntilSubscriptionEnds: () => number;

  // Actions
  updateCommon: (data: Partial<UserCommonType>) => void;
  updateSubscription: (data: Partial<UserSubscriptionType>) => void;
  updateBodyCurrent: (data: Partial<BodyMeasurementsType>) => void;
  updateBodyGoal: (data: Partial<BodyGoalType>) => void;
  updateMacros: (data: Partial<MacrosType>) => void;
  calculateMacros: () => void;
  switchToPaid: () => void;
  resetToFree: () => void;
  login: (userData: Partial<UserType>) => void;
  logout: () => void;
}

const defaultUser: UserType = {
  common: {
    username: "",
    email: "",
    password: "",
    icon: 0,
  },
  subscription: {
    tier: "free",
    start: undefined,
    end: undefined,
    freeTrial: undefined,
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

      // Getters
      isInTrial: () => get().subscription.freeTrial === true,

      isSubscribed: () => get().subscription.tier === "active",

      bmi: () => {
        const weight = get().body.current.weight;
        const height = get().body.current.height / 100;
        return weight && height ? weight / (height * height) : 0;
      },

      daysUntilSubscriptionEnds: () => {
        const end = get().subscription.end;
        if (!end) return 0;
        const diff = end.getTime() - Date.now();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
      },

      // Actions
      updateCommon: (data) =>
        set((state) => ({
          common: { ...state.common, ...data },
        })),

      updateSubscription: (data) =>
        set((state) => ({
          subscription: { ...state.subscription, ...data },
        })),

      updateBodyCurrent: (data) =>
        set((state) => ({
          body: {
            ...state.body,
            current: { ...state.body.current, ...data },
          },
        })),

      updateBodyGoal: (data) =>
        set((state) => ({
          body: {
            ...state.body,
            goal: { ...state.body.goal, ...data },
          },
        })),

      updateMacros: (data) =>
        set((state) => ({
          macros: { ...state.macros, ...data },
        })),

      calculateMacros: () => {
        // Здесь можно добавить реальную формулу расчета
        const weight = get().body.current.weight || 70;
        const height = get().body.current.height;
        const age = get().body.current.age;
        const activity = get().body.current.activity;

        // Формула Миффлина-Сан Жеора (пример)
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
            proteins: Math.round(weight * 2), // 2г белка на кг веса
            carbs: Math.round((tdee * 0.5) / 4), // 50% калорий из углеводов
            fats: Math.round((tdee * 0.3) / 9), // 30% калорий из жиров
          },
        });
      },

      switchToPaid: () => {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);

        set({
          subscription: {
            tier: "active",
            start,
            end,
            freeTrial: false,
          },
        });
      },

      resetToFree: () =>
        set({
          subscription: {
            tier: "free",
            start: undefined,
            end: undefined,
            freeTrial: undefined,
          },
        }),

      login: (userData) =>
        set((state) => ({
          ...state,
          ...userData,
        })),

      logout: () => set({ ...defaultUser }),
    }),
    {
      name: "user-storage", // имя для AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        common: state.common,
        subscription: state.subscription,
        body: state.body,
        macros: state.macros,
      }),
    },
  ),
);
