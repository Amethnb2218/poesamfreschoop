import { Platform } from 'react-native';

// Palette Frescoop extraite depuis styles.css du site
export const Palette = {
  ink: '#071b14',
  ink2: '#21372f',
  muted: '#52645a',
  paper: '#f7fbf8',
  wash: '#edf6f1',
  surface: '#ffffff',
  line: '#d7e5dc',
  lineStrong: '#adc8ba',
  green950: '#062f27',
  green850: '#0a4b3e',
  green700: '#1f835d',
  green100: '#e4f7ef',
  blue700: '#247f9a',
  blue100: '#e2f2f6',
  gold600: '#d99912',
  gold100: '#fff1c9',
  coral600: '#e54d35',
  coral100: '#ffe9e3',
};

export const Colors = {
  light: {
    text: Palette.ink,
    textMuted: Palette.muted,
    background: Palette.paper,
    surface: Palette.surface,
    wash: Palette.wash,
    tint: Palette.green700,
    primary: Palette.green700,
    primaryDark: Palette.green850,
    accent: Palette.gold600,
    danger: Palette.coral600,
    icon: Palette.muted,
    border: Palette.line,
    tabIconDefault: Palette.muted,
    tabIconSelected: Palette.green700,
  },
  dark: {
    text: '#ECEDEE',
    textMuted: '#9BA1A6',
    background: Palette.green950,
    surface: '#0b3228',
    wash: '#0a2b22',
    tint: Palette.green100,
    primary: Palette.green100,
    primaryDark: Palette.green850,
    accent: Palette.gold600,
    danger: Palette.coral600,
    icon: '#9BA1A6',
    border: '#16443a',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Palette.green100,
  },
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Shadows = {
  sm: {
    shadowColor: '#071b14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  lg: {
    shadowColor: '#071b14',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
