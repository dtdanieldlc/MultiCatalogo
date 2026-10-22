// Banner global: sin conexión / de vuelta en línea (HITO G · P4)
import { useEffect, useState } from "react";

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
      className={`fixed top-0 inset-x-0 z-[100] px-3 py-2 text-center text-sm font-medium shadow-md ${
        online
          ? "bg-green-600 text-white"
          : "bg-amber-500 text-amber-950"
      }`}
    >
      {online
        ? "Conexión restablecida"
        : "Sin conexión — el catálogo puede verse en caché; login y compras requieren red"}
    </div>
  );
};

export default OfflineBanner;
