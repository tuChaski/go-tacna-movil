import { useCallback, useEffect, useState } from "react";

/**
 * Gestiona la simulación temporal del recorrido y su diálogo de confirmación.
 * Al iniciar guarda la hora local; intentar finalizar solo abre el diálogo.
 * La pantalla debe llamar a `finish` tras confirmar o a `cancel` para continuar.
 *
 * Este estado desaparece al desmontar la pantalla. No crea una sesión en el
 * backend, solicita GPS, guarda recorridos ni ejecuta seguimiento en segundo plano.
 */
export function useDriverTrip() {
  // Undefined indica inactividad; una marca de tiempo numérica, incluso cero,
  // indica que existe un recorrido activo.
  const [startedAt, setStartedAt] = useState<number>();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (startedAt === undefined) return;
    // Calcula el tiempo desde la hora de inicio en lugar de contar ejecuciones,
    // que pueden retrasarse. Actualiza la vista; no es un servicio en segundo plano.
    const timer = setInterval(
      () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000,
    );
    // React libera el intervalo al finalizar el recorrido o desmontar la pantalla.
    return () => clearInterval(timer);
  }, [startedAt]);
  // Mantiene estable la función entre actualizaciones del contador para renovar
  // la suscripción al botón Atrás de Android solo cuando cambia el recorrido activo.
  const toggle = useCallback(() => {
    if (startedAt !== undefined) setConfirming(true);
    else {
      setElapsedSeconds(0);
      setStartedAt(Date.now());
    }
  }, [startedAt]);
  /** Limpia la simulación después de que el usuario confirma explícitamente el fin. */
  function finish() {
    setStartedAt(undefined);
    setElapsedSeconds(0);
    setConfirming(false);
  }
  return {
    active: startedAt !== undefined,
    elapsedSeconds,
    confirming,
    toggle,
    finish,
    // Cerrar la confirmación conserva el recorrido activo y su hora de inicio.
    cancel: () => setConfirming(false),
  };
}
