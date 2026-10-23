// Aviso de nueva versión del Service Worker (registerType: 'prompt')
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PwaUpdateToast = () => {
  const [show, setShow] = useState(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Revisa actualizaciones periódicamente (1 h)
      if (registration) {
        window.setInterval(() => {
          void registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(err) {
      console.warn("[PWA] registro SW falló", err);
    },
  });

  useEffect(() => {
    if (needRefresh) setShow(true);
  }, [needRefresh]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-md flex-col gap-3 rounded-2xl bg-ink-900 p-4 text-white shadow-lift animate-rise sm:flex-row sm:items-center">
      <p className="flex-1 text-sm">Hay una nueva versión de MultiCatálogo.</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-sm flex-1 bg-white text-ink-900 hover:bg-brand-100 sm:flex-none"
          onClick={() => void updateServiceWorker(true)}
        >
          Actualizar
        </button>
        <button
          type="button"
          className="btn btn-sm flex-1 border border-white/25 text-white hover:bg-white/10 sm:flex-none"
          onClick={() => setShow(false)}
        >
          Luego
        </button>
      </div>
    </div>
  );
};

export default PwaUpdateToast;
