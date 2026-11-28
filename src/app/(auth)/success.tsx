import { router } from 'expo-router';
import { ScreenLayout } from '@/components/ScreenLayout';
import { Button } from '@/components/Button';

/** Finaliza la validación local del formulario y da acceso al mapa público. */
export default function RegistrationPreviewComplete() {
    return (
        <ScreenLayout title="Demostración completada" subtitle="El formulario pasó la validación local. La creación de cuentas estará disponible más adelante." onBack={() => router.replace('/')}>
            <Button title="Explorar rutas como invitado" onPress={() => router.replace('/passenger')} />
        </ScreenLayout>
    );
}
