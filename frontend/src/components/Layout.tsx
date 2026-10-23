// src/components/Layout.tsx
// Estructura base: Sidebar + Navbar + contenido (Outlet).
// - Escritorio: el botón del Navbar alterna el Sidebar entre ancho completo (w-64) e iconos (w-20).
// - Móvil: el botón abre/cierra el Sidebar como drawer sobre un overlay.
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const MOBILE_BREAKPOINT = 768; // coincide con 'md' de Tailwind

const isMobile = (): boolean => window.innerWidth < MOBILE_BREAKPOINT;

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const { pathname } = useLocation();

  const toggleSidebar = () => {
    if (isMobile()) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  useEffect(() => {
    const onResize = () => {
      if (!isMobile()) setIsMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileOpen]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-cream">
      <Sidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} closeMobileMenu={closeMobileMenu} />

      {isMobileOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {/* key = animación suave al cambiar de página */}
          <div key={pathname} className="mx-auto w-full max-w-6xl animate-rise">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
