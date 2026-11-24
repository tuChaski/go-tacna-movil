import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/theme';

type Props = TextInputProps & {
    label: string;
    error?: string;
    hint?: string;
    secure?: boolean;
};

export function TextField({ label, error, hint, secure, ...rest }: Props) {
    const [hidden, setHidden] = useState(!!secure);
    const [focused, setFocused] = useState(false);

    return (
        <View style={s.wrapper}>
            <Text style={s.label}>{label}</Text>
            <View
                style={[
                    s.box,
                    focused && s.boxFocused,
                    error ? s.boxError : null,
                ]}>
                <TextInput
                    style={s.input}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={hidden}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...rest}
                />
                {secure && (
                    <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
                        <Ionicons
                            name={hidden ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#94A3B8"
                        />
                    </Pressable>
                )}
            </View>

            {error ? (
                <Text style={s.error}>{error}</Text>
            ) : hint ? (
                <Text style={s.hint}>{hint}</Text>
            ) : null}
        </View>
    );
}

const s = StyleSheet.create({
    wrapper: { marginBottom: 20 },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: 14,
        height: 50,
    },
    boxFocused: { borderColor: colors.primary },
    boxError: { borderColor: colors.error },
    input: { flex: 1, color: colors.text, fontSize: 15 },
    hint: { fontSize: 11.5, color: '#94A3B8', marginTop: 6, marginLeft: 2 },
    error: { fontSize: 12, color: colors.error, marginTop: 6, marginLeft: 2 },
});