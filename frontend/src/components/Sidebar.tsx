// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
}

interface NavItem {
  to: string;
  label: string;
  title: string;
  icon: string;
  soloAdmin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    title: "Dashboard",
    soloAdmin: true,
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    to: "/tienda",
    label: "Tienda",
    title: "Tienda",
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
  {
    to: "/catalogo",
    label: "Catálogo",
    title: "Catálogo",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  {
    to: "/mi-red",
    label: "Mi Red",
    title: "Mi Red",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    to: "/mis-pedidos",
    label: "Mis pedidos",
    title: "Mis pedidos",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    to: "/admin/productos",
    label: "Productos",
    title: "Admin productos",
    soloAdmin: true,
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    to: "/admin/pedidos",
    label: "Pedidos",
    title: "Admin pedidos",
    soloAdmin: true,
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    to: "/admin/liquidaciones",
    label: "Liquidaciones",
    title: "Liquidaciones",
    soloAdmin: true,
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

const Sidebar = ({ isCollapsed, isMobileOpen, closeMobileMenu }: SidebarProps) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const items = NAV_ITEMS.filter((item) => !item.soloAdmin || user?.rol === "admin");

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-gradient-to-b from-indigo-700 via-indigo-800 to-violet-900
        text-white shadow-xl
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        w-64
        md:relative md:translate-x-0
        ${isCollapsed ? "md:w-20" : "md:w-64"}
      `}
    >
      {/* Brand */}
      <div
        className={`
          px-4 py-5 border-b border-white/10
          flex items-center gap-3
          ${isCollapsed ? "md:justify-center md:px-2" : ""}
        `}
      >
        <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner flex-shrink-0">
          <span className="text-sm font-black tracking-tight">MC</span>
        </div>
        <div className={`${isCollapsed ? "md:hidden" : ""}`}>
          <p className="font-bold text-base leading-tight">MultiCatálogo</p>
          <p className="text-[10px] uppercase tracking-widest text-indigo-200/80">Cosmética MLM</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const esActivo =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              title={item.title}
              className={`
                group relative flex items-center gap-3
                min-h-[44px] px-3 py-2.5 rounded-xl
                text-sm font-medium
                transition-all duration-200 ease-out
                ${isCollapsed ? "md:justify-center md:px-2" : ""}
                ${
                  esActivo
                    ? "bg-white text-indigo-800 shadow-md shadow-indigo-950/30"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {/* Indicador activo (barra lateral) */}
              {esActivo && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-violet-400 md:hidden" />
              )}
              <span
                className={`
                  flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0
                  transition-colors duration-200
                  ${
                    esActivo
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-white/10 text-indigo-100 group-hover:bg-white/15"
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </span>
              <span className={`whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer rol */}
      <div
        className={`
          m-3 p-3 rounded-xl
          bg-white/10 backdrop-blur border border-white/10
          ${isCollapsed ? "md:p-2" : ""}
        `}
      >
        {isCollapsed ? (
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-indigo-100">
            {user?.rol}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-xs font-bold shadow">
              {(user?.email?.[0] ?? "U").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-indigo-100/80 truncate">{user?.email}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-200">
                {user?.rol}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
