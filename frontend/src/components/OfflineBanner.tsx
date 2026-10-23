// Banner global: sin conexión / de vuelta en línea (HITO G · P4)
import { useEffect, useState } from "react";
import { Icon } from "./ui";

const OfflineBanner = () => {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const on = () => {
      setOnline(true);
      setShowBack(true);
      window.setTimeout(() => setShowBack(false), 2500);
    };
    const off = () => {
      setOnline(false);
      setShowBack(false);
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online && !showBack) return null;

  return (
    <div
      role="status"
      className={`fixed inset-x-3 top-3 z-[100] mx-auto flex max-w-xl items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium shadow-lift animate-rise ${
        online ? "bg-leaf-600 text-white" : "bg-ink-900 text-white"
      }`}
    >
      <Icon name="wifi" className="h-4 w-4 shrink-0" />
      <span>
        {online
          ? "Conexión restablecida"
          : "Sin conexión — el catálogo puede verse en caché; login y compras requieren red"}
      </span>
    </div>
  );
};

export default OfflineBanner;
