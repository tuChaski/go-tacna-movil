import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import { TextField } from '@/components/TextField';
import { Checkbox } from '@/components/Checkbox';
import { AlertBox } from '@/components/AlertBox';
import { Button } from '@/components/Button';
import { colors, radius } from '@/theme';

type Errors = { email?: string; pass?: string };

export default function Login() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [failed, setFailed] = useState(false);

    const onSubmit = () => {
        const e: Errors = {};
        if (!email.trim()) e.email = 'Ingresa tu correo electrónico.';
        if (!pass) e.pass = 'Ingresa tu contraseña.';
        setErrors(e);

        if (Object.keys(e).length > 0) {
            setFailed(false);
            return;
        }
        // TODO: aquí irá la llamada al backend. Por ahora simulamos credenciales incorrectas.
        setFailed(true);
    };

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView
                contentContainerStyle={s.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {/* Barra superior: flecha de retroceso */}
                <BackButton />

                {/* Encabezado */}
                <View style={s.header}>
                    <View style={[s.iconBox, failed && s.iconBoxError]}>
                        <Ionicons
                            name={failed ? 'mail-unread-outline' : 'person-outline'}
                            size={24}
                            color={failed ? colors.error : colors.primary}
                        />
                    </View>

                    <Text style={s.title}>
                        {failed ? 'No pudimos iniciar sesión' : 'Iniciar sesión'}
                    </Text>
                    <Text style={s.subtitle}>
                        {failed
                            ? 'El correo o la contraseña no son correctos. Revisa tus datos e inténtalo de nuevo.'
                            : 'Accede a tu cuenta de Go Tacna.'}
                    </Text>
                </View>

                {/* Alerta de error (solo en estado fallido) */}
                {failed && (
                    <AlertBox
                        variant="error"
                        title="Credenciales incorrectas"
                        message="Por seguridad, no podemos confirmar si el correo existe. Verifica que los datos sean los que usaste al registrarte."
                    />
                )}

                {/* Formulario */}
                <View style={s.form}>
                    <TextField
                        label="Correo electrónico"
                        placeholder="nombre@correo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        hint="Ingresa el correo de tu cuenta."
                        error={errors.email ?? (failed ? 'Verifica tu correo electrónico.' : undefined)}
                    />

                    <TextField
                        label="Contraseña"
                        placeholder="Ingresa tu contraseña"
                        secure
                        value={pass}
                        onChangeText={setPass}
                        hint="Tu contraseña permanece oculta."
                        error={errors.pass ?? (failed ? 'Verifica tu contraseña.' : undefined)}
                    />

                    <Checkbox
                        checked={remember}
                        onChange={setRemember}
                        label="Recordarme"
                        style={s.remember}
                    />
                </View>

                {/* Acciones */}
                <View style={s.actions}>
                    <Button title={failed ? 'Reintentar' : 'Ingresar'} onPress={onSubmit} />

                    <View style={s.divider}>
                        <View style={s.line} />
                        <Text style={s.or}>o</Text>
                        <View style={s.line} />
                    </View>

                    <Button
                        title="Crear una cuenta de pasajero"
                        variant="outline"
                        onPress={() => router.push('/register')}
                    />
                </View>

                {/* Espaciador: empuja la nota al pie de la pantalla */}
                <View style={s.spacer} />

                {/* Nota discreta de acceso según perfil */}
                <View style={s.note}>
                    <Ionicons name="lock-closed-outline" size={14} color="#94A3B8" style={s.noteIcon} />
                    <Text style={s.noteText}>
                        El registro público es exclusivo para pasajeros. Conductores y administradores usan
                        cuentas autorizadas.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 24,
    },

    header: { marginTop: 16, marginBottom: 32 },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: radius.lg,
        backgroundColor: colors.infoBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    iconBoxError: { backgroundColor: colors.errorBg },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
    },
    subtitle: { fontSize: 15, color: colors.muted, lineHeight: 22 },

    form: { marginBottom: 8 },
    remember: { marginTop: -4, marginBottom: 8 },

    actions: { marginTop: 8 },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 20,
    },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    or: { color: '#94A3B8', fontSize: 12 },

    spacer: { flex: 1, minHeight: 24 },

    note: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: radius.md,
        padding: 12,
    },
    noteIcon: { marginTop: 2 },
    noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: '#64748B' },
});