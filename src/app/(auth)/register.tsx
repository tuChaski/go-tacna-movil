import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import { TextField } from '@/components/TextField';
import { Checkbox } from '@/components/Checkbox';
import { AlertBox } from '@/components/AlertBox';
import { Button } from '@/components/Button';
import { colors } from '@/theme';

type Errors = {
    name?: string;
    email?: string;
    pass?: string;
    confirm?: string;
    terms?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [terms, setTerms] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const hasErrors = Object.keys(errors).length > 0;

    const onSubmit = () => {
        const e: Errors = {};
        if (!name.trim()) e.name = 'Ingresa tu nombre.';
        if (!EMAIL_REGEX.test(email.trim()))
            e.email = 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
        if (pass.length < 8) e.pass = 'Usa al menos 8 caracteres.';
        if (confirm !== pass || !confirm) e.confirm = 'Las contraseñas no coinciden.';
        if (!terms) e.terms = 'Debes aceptar los términos y condiciones.';

        setErrors(e);
        if (Object.keys(e).length > 0) return;

        // TODO: aquí irá la llamada al backend para crear la cuenta.
        router.replace('/success');
    };

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
                <BackButton />

                <Text style={s.title}>Crea tu cuenta</Text>
                <Text style={s.subtitle}>
                    {hasErrors
                        ? 'Tu ciudad, a un recorrido de distancia.'
                        : 'Demo de registro. Usa datos ficticios para probar el formulario.'}
                </Text>

                {hasErrors && <AlertBox variant="error" title="Revisa tus datos" />}

                <TextField
                    label="Nombre"
                    placeholder="Tu nombre"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    error={errors.name}
                />

                <TextField
                    label="Correo electrónico"
                    placeholder="nombre@correo.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.email}
                />

                <TextField
                    label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    secure
                    value={pass}
                    onChangeText={setPass}
                    error={errors.pass}
                />

                <TextField
                    label="Confirmar contraseña"
                    placeholder="Repite tu contraseña"
                    secure
                    value={confirm}
                    onChangeText={setConfirm}
                    error={errors.confirm}
                />

                <Checkbox checked={terms} onChange={setTerms} label="Acepto términos y condiciones" />
                {errors.terms ? <Text style={s.termsError}>{errors.terms}</Text> : null}

                <Button title={hasErrors ? 'Corregir datos' : 'Registrarme'} onPress={onSubmit} />

                <View style={s.footer}>
                    <Text style={s.footerText}>¿Ya tienes cuenta? </Text>
                    <Pressable onPress={() => router.replace('/login')}>
                        <Text style={s.link}>Inicia sesión</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 32 },
    title: { fontSize: 26, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 6 },
    subtitle: { fontSize: 14, color: colors.muted, marginBottom: 20 },
    termsError: { color: colors.error, fontSize: 12, marginTop: -10, marginBottom: 14 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { fontSize: 13, color: colors.muted },
    link: { fontSize: 13, color: colors.primary, fontWeight: '700' },
});
