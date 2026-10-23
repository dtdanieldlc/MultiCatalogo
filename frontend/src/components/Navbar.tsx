// src/components/Navbar.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import InstallPwaButton from "./InstallPwaButton";
import { Icon } from "./ui";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { totalItems } = useCart();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú de usuario al hacer clic fuera (funciona también en táctil)
  useEffect(() => {
    if (!menuAbierto) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAbierto(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [menuAbierto]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-ink-100 bg-cream/85 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Alternar menú"
        >
          <Icon name="menu" className="h-6 w-6" />
        </button>
        <p className="hidden text-sm font-medium text-ink-500 sm:block">
          {user?.rol === "admin" ? "Panel de administración" : "Tienda MultiCatálogo"}
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <InstallPwaButton className="btn btn-outline btn-sm hidden sm:inline-flex" />

        <Link
          to="/carrito"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-700 transition hover:bg-ink-100"
          aria-label={`Carrito (${totalItems})`}
        >
          <Icon name="bag" className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </Link>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuAbierto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
            className="flex h-11 items-center gap-2 rounded-full pl-1 pr-2 transition hover:bg-ink-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
              {(user?.email?.[0] ?? "U").toUpperCase()}
            </span>
            <Icon name="chevron" className="hidden h-4 w-4 text-ink-400 sm:block" />
          </button>

          {menuAbierto && (
            <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 animate-rise rounded-2xl border border-ink-100 bg-white p-2 shadow-lift">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-ink-900">{user?.email}</p>
                <span
                  className={`badge mt-1 ${user?.rol === "admin" ? "bg-gold-100 text-gold-700" : "bg-brand-100 text-brand-700"}`}
                >
                  {user?.rol}
                </span>
              </div>
              <div className="my-1 border-t border-ink-100" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                <Icon name="logout" className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
