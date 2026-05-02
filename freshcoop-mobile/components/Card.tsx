import { StyleSheet, View, ViewProps } from 'react-native';
import { Palette, Radius, Shadows } from '@/constants/theme';

type CardProps = ViewProps & {
  variant?: 'surface' | 'wash' | 'dark';
  padded?: boolean;
};

export function Card({ style, variant = 'surface', padded = true, ...rest }: CardProps) {
  const backgroundColor =
    variant === 'wash' ? Palette.wash : variant === 'dark' ? Palette.green950 : Palette.surface;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor, padding: padded ? 18 : 0 },
        variant === 'dark' && { borderColor: 'transparent' },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.line,
    ...Shadows.sm,
  },
});
