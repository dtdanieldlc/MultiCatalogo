// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Icon, Logo, type IconName } from "./ui";

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
}

interface NavItem {
  to: string;
  label: string;
  title: string;
  icon: IconName;
  soloAdmin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", title: "Dashboard", icon: "home", soloAdmin: true },
  { to: "/tienda", label: "Tienda", title: "Tienda", icon: "bag" },
  { to: "/catalogo", label: "Catálogo", title: "Catálogo", icon: "grid" },
  { to: "/mi-red", label: "Mi Red", title: "Mi Red", icon: "users" },
  { to: "/mis-pedidos", label: "Mis pedidos", title: "Mis pedidos", icon: "clipboard" },
  { to: "/admin/productos", label: "Productos", title: "Admin productos", icon: "box", soloAdmin: true },
  { to: "/admin/pedidos", label: "Pedidos", title: "Admin pedidos", icon: "doc", soloAdmin: true },
  { to: "/admin/liquidaciones", label: "Liquidaciones", title: "Liquidaciones", icon: "coin", soloAdmin: true },
];

const Sidebar = ({ isCollapsed, isMobileOpen, closeMobileMenu }: SidebarProps) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const esAdmin = user?.rol === "admin";
  const items = NAV_ITEMS.filter((item) => !item.soloAdmin || esAdmin);
  const generales = items.filter((i) => !i.soloAdmin);
  const admin = items.filter((i) => i.soloAdmin);

  const renderItem = (item: NavItem) => {
    const esActivo =
      item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(item.to + "/");
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={closeMobileMenu}
        title={item.title}
        aria-current={esActivo ? "page" : undefined}
        className={`group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition
          ${isCollapsed ? "md:justify-center md:px-0" : ""}
          ${esActivo ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"}`}
      >
        <Icon
          name={item.icon}
          className={`h-5 w-5 shrink-0 ${esActivo ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600"}`}
        />
        <span className={`whitespace-nowrap ${isCollapsed ? "md:hidden" : ""}`}>{item.label}</span>
        {esActivo && !isCollapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-600" />}
      </Link>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-ink-100 bg-white
        transition-all duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0 shadow-lift" : "-translate-x-full"}
        md:relative md:translate-x-0 md:shadow-none
        ${isCollapsed ? "md:w-[76px]" : "md:w-64"}`}
    >
      <div className={`flex h-16 items-center border-b border-ink-100 px-5 ${isCollapsed ? "md:justify-center md:px-0" : ""}`}>
        {isCollapsed ? (
          <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-display text-[11px] font-bold tracking-tight text-white md:flex">
            DTLC
          </span>
        ) : null}
        <span className={isCollapsed ? "md:hidden" : ""}>
          <Logo />
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3 pt-5">
        <div className="space-y-1">{generales.map(renderItem)}</div>
        {admin.length > 0 && (
          <div>
            <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400 ${isCollapsed ? "md:hidden" : ""}`}>
              Administración
            </p>
            <div className="space-y-1">{admin.map(renderItem)}</div>
          </div>
        )}
      </nav>

      <div className={`m-3 rounded-2xl bg-sand p-3 ${isCollapsed ? "md:p-2" : ""}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? "md:justify-center" : ""}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
            {(user?.email?.[0] ?? "U").toUpperCase()}
          </span>
          <div className={`min-w-0 ${isCollapsed ? "md:hidden" : ""}`}>
            <p className="truncate text-xs font-medium text-ink-800">{user?.email}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">{user?.rol}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
