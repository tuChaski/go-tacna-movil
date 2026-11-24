import { Pressable, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({ checked, onChange, label, style }: Props) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={[s.row, style]}>
      <View style={[s.box, checked && s.boxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 14, color: colors.text, lineHeight: 20 },
});