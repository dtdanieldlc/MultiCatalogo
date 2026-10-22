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
    <div className="fixed bottom-4 inset-x-4 z-[100] mx-auto max-w-md rounded-xl bg-indigo-900 text-white shadow-xl border border-indigo-700 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <p className="text-sm flex-1">Hay una nueva versión de MultiCatálogo.</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 sm:flex-none min-h-[44px] px-4 rounded-lg bg-white text-indigo-900 font-semibold text-sm"
          onClick={() => void updateServiceWorker(true)}
        >
          Actualizar
        </button>
        <button
          type="button"
          className="flex-1 sm:flex-none min-h-[44px] px-4 rounded-lg border border-white/30 text-sm"
          onClick={() => setShow(false)}
        >
          Luego
        </button>
      </div>
    </div>
  );
};

export default PwaUpdateToast;
