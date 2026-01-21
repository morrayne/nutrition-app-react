import { createTamagui } from "@tamagui/core";
import { createInterFont } from "@tamagui/font-inter";
import { shorthands } from "@tamagui/shorthands";
import { themes, tokens } from "@tamagui/themes";
import { createMedia } from "@tamagui/react-native-media-driver";

const headingFont = createInterFont({
  size: {
    1: 10,
    2: 12,
    3: 14,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 28,
    9: 32,
    10: 40,
    11: 48,
    12: 56,
  },
  weight: {
    4: "300",
    5: "400",
    6: "500",
    7: "600",
    8: "700",
    9: "800",
  },
});

const bodyFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
    5: 20,
    6: 22,
    7: 26,
    8: 30,
    9: 36,
    10: 44,
    11: 52,
    12: 60,
  },
  weight: {
    4: "300",
    5: "400",
    6: "500",
    7: "600",
    8: "700",
    9: "800",
  },
});

const config = createTamagui({
  defaultFont: "body",
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: {
    ...themes,
    light: {
      ...themes.light,
      background: "#ffffff",
      color: "#000000",
    },
    dark: {
      ...themes.dark,
      background: "#000000",
      color: "#ffffff",
    },
  },
  tokens,
  shorthands,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
  }),
});

export type AppConfig = typeof config;

declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
