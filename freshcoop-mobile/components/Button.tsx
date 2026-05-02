import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Palette, Radius } from '@/constants/theme';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  loading?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  leading,
  trailing,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const bg =
    variant === 'primary' ? Palette.green700 : variant === 'secondary' ? Palette.surface : 'transparent';
  const fg =
    variant === 'primary' ? '#ffffff' : variant === 'secondary' ? Palette.ink : Palette.green850;
  const border = variant === 'secondary' ? Palette.lineStrong : 'transparent';

  return (
    <Pressable
      onPress={(event) => {
        if (isDisabled) return;
        Haptics.selectionAsync().catch(() => {});
        onPress?.(event);
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'secondary' ? 1 : 0,
          paddingVertical: size === 'lg' ? 16 : 13,
          paddingHorizontal: size === 'lg' ? 22 : 18,
          opacity: isDisabled ? 0.6 : pressed ? 0.9 : 1,
        },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {leading}
          <Text style={[styles.label, { color: fg, fontSize: size === 'lg' ? 17 : 15 }]}>
            {label}
          </Text>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontWeight: '800', letterSpacing: 0.2 },
});
