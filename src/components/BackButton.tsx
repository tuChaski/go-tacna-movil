import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/theme';

export function BackButton() {
    const goBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
    };

    return (
        <Pressable onPress={goBack} hitSlop={12} style={{ alignSelf: 'flex-start', paddingVertical: 8 }}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
    );
}