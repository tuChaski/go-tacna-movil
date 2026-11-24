// src/components/Button.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export function Button({ title, onPress, variant = 'primary' }:
    { title: string; onPress?: () => void; variant?: 'primary' | 'outline' }) {
    const outline = variant === 'outline';
    return (
        <Pressable
            onPress={onPress}
            style={[s.btn, outline ? s.outline : { backgroundColor: colors.primary }]}>
            <Text style={{ color: outline ? colors.primary : '#fff', fontWeight: '600' }}>
                {title}
            </Text>
        </Pressable>
    );
}

const s = StyleSheet.create({
    btn: { height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    outline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: '#fff' },
});