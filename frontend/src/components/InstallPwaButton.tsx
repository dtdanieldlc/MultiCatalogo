// Botón "Instalar app" (beforeinstallprompt). En iOS muestra instrucciones manuales.
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

const InstallPwaButton = ({
  className = "",
  variant = "default",
}: {
  className?: string;
  /** "login" = botón grande en la pantalla de acceso */
  variant?: "default" | "login";
}) => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const baseLogin =
    "btn btn-outline w-full border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100";
  const baseDefault =
    "btn btn-outline btn-sm";

  // Chrome/Edge/Android: prompt nativo
  if (deferred) {
    return (
      <button
        type="button"
        className={className || (variant === "login" ? baseLogin : baseDefault)}
        onClick={async () => {
          await deferred.prompt();
          const { outcome } = await deferred.userChoice;
          if (outcome === "accepted") setDeferred(null);
        }}
      >
        <span aria-hidden>⬇</span>
        Instalar aplicación
      </button>
    );
  }

  // iOS o navegador sin beforeinstallprompt: mostrar ayuda
  if (variant === "login") {
    return (
      <div className="space-y-2">
        <button
          type="button"
          className={className || baseLogin}
          onClick={() => setShowIosHelp((v) => !v)}
        >
          <span aria-hidden>⬇</span>
          Instalar en este dispositivo
        </button>
        {showIosHelp && (
          <div className="text-left text-xs text-ink-600 bg-sand rounded-xl p-3 space-y-1">
            {isIos() ? (
              <>
                <p className="font-semibold text-ink-900">En iPhone / iPad (Safari):</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Toca el botón <strong>Compartir</strong> (cuadrado con flecha).</li>
                  <li>Elige <strong>Añadir a pantalla de inicio</strong>.</li>
                  <li>Confirma con <strong>Añadir</strong>.</li>
                </ol>
              </>
            ) : (
              <>
                <p className="font-semibold text-ink-900">Cómo instalar:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>Chrome / Edge:</strong> menú ⋮ → <em>Instalar MultiCatálogo</em> o el icono ⊕ en la barra de direcciones.
                  </li>
                  <li>
                    <strong>Android:</strong> menú → <em>Instalar app</em> / <em>Añadir a la pantalla de inicio</em>.
                  </li>
                  <li>
                    Si no aparece la opción, abre la app por <strong>HTTPS</strong> (no solo IP local) y vuelve a intentar.
                  </li>
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default InstallPwaButton;
