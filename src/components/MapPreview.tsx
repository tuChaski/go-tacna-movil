import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/theme';

// Calles (coordenadas en un lienzo de 340 x 190)
const AVENUES_V = [50, 110, 170, 230, 290];
const AVENUES_H = [40, 85, 130, 175];
const MINOR_V = [20, 80, 140, 200, 260, 320];
const MINOR_H = [18, 62, 108, 153];

const ROUTE = 'M170 40 V85 H110 V130 H230';

function BusMarker({ x, y }: { x: number; y: number }) {
    return (
        <G transform={`translate(${x - 12}, ${y - 12})`}>
            <Rect width={24} height={24} rx={7} fill="#fff" stroke="#16A34A" strokeWidth={2} />
            <Rect x={6} y={5} width={12} height={13} rx={3} fill="none" stroke="#16A34A" strokeWidth={1.6} />
            <Line x1={6} y1={11} x2={18} y2={11} stroke="#16A34A" strokeWidth={1.6} />
            <Circle cx={9.5} cy={15} r={1} fill="#16A34A" />
            <Circle cx={14.5} cy={15} r={1} fill="#16A34A" />
        </G>
    );
}

function LocationPin({ x, y }: { x: number; y: number }) {
    return (
        <G transform={`translate(${x}, ${y})`}>
            <Circle cx={0} cy={11} r={5} fill={colors.primary} opacity={0.15} />
            <Path
                d="M0 10 C-8 2 -9 -2 -9 -6 A9 9 0 0 1 9 -6 C9 -2 8 2 0 10 Z"
                fill={colors.primary}
                stroke="#fff"
                strokeWidth={1.5}
            />
            <Circle cx={0} cy={-6} r={3.5} fill="#fff" />
        </G>
    );
}

export function MapPreview() {
    return (
        <View style={s.map}>
            <Svg width="100%" height="100%" viewBox="0 0 340 190" preserveAspectRatio="xMidYMid slice">
                {/* Fondo */}
                <Rect width={340} height={190} fill="#EDF1F5" />

                {/* Zona verde / parque */}
                <Rect x={236} y={90} width={48} height={34} rx={4} fill="#E3F0E8" />

                {/* Calles secundarias */}
                {MINOR_V.map((x) => (
                    <Line key={`mv${x}`} x1={x} y1={0} x2={x} y2={190} stroke="#fff" strokeWidth={3} opacity={0.75} />
                ))}
                {MINOR_H.map((y) => (
                    <Line key={`mh${y}`} x1={0} y1={y} x2={340} y2={y} stroke="#fff" strokeWidth={3} opacity={0.75} />
                ))}

                {/* Avenidas */}
                {AVENUES_V.map((x) => (
                    <Line key={`av${x}`} x1={x} y1={0} x2={x} y2={190} stroke="#fff" strokeWidth={8} />
                ))}
                {AVENUES_H.map((y) => (
                    <Line key={`ah${y}`} x1={0} y1={y} x2={340} y2={y} stroke="#fff" strokeWidth={8} />
                ))}

                {/* Nombres de zonas y calles */}
                <SvgText x={52} y={30} fontSize={7} fontWeight="600" fill="#94A3B8" letterSpacing={0.8}>
                    CIUDAD NUEVA
                </SvgText>
                <SvgText x={236} y={34} fontSize={7} fontWeight="600" fill="#94A3B8" letterSpacing={0.8}>
                    POCOLLAY
                </SvgText>
                <SvgText x={236} y={82} fontSize={6.5} fill="#A0AEC0">
                    Av. Pinto
                </SvgText>
                <SvgText x={14} y={82} fontSize={6.5} fill="#A0AEC0">
                    Av. Bolognesi
                </SvgText>

                {/* Ruta: halo + línea principal */}
                <Path d={ROUTE} stroke="#BFDBFE" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <Path d={ROUTE} stroke={colors.primary} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />

                {/* Micros sobre la ruta */}
                <BusMarker x={170} y={62} />
                <BusMarker x={110} y={108} />

                {/* Pin superior */}
                <LocationPin x={170} y={30} />
            </Svg>

            {/* Tarjeta flotante */}
            <View style={s.etaCard}>
                <View style={s.etaIcon}>
                    <Ionicons name="bus-outline" size={18} color={colors.primary} />
                </View>
                <View>
                    <Text style={s.etaLabel}>Tu micro está cerca</Text>
                    <Text style={s.etaValue}>4 min aprox.</Text>
                </View>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    map: {
        height: 200,
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: '#EDF1F5',
    },
    etaCard: {
        position: 'absolute',
        left: 12,
        bottom: 12,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#0F172A',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    etaIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: colors.infoBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    etaLabel: { fontSize: 11, color: colors.muted },
    etaValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
});