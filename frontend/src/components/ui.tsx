// Piezas de interfaz compartidas del sistema de diseño MultiCatálogo.
import type { ReactNode } from "react";

/* ------------------------------ Iconos ------------------------------ */
const PATHS = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  bag: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  grid: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  users: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  coin: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M6 18L18 6M6 6l12 12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  "arrow-left": "M10 19l-7-7m0 0l7-7m-7 7h18",
  "arrow-right": "M14 5l7 7m0 0l-7 7m7-7H3",
  plus: "M12 4v16m8-8H4",
  minus: "M20 12H4",
  trash: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  check: "M5 13l4 4L19 7",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  copy: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
  sparkles: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  chevron: "M19 9l-7 7-7-7",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  wifi: "M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0",
} as const;

export type IconName = keyof typeof PATHS;

export const Icon = ({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d={PATHS[name]} />
  </svg>
);

/* --------------------------- Utilidades --------------------------- */
export const money = (n: number): string =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ------------------------- Encabezado de página ------------------------- */
export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-xl text-ink-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ------------------------------ Alertas ------------------------------ */
export const Alert = ({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) => {
  const tones = {
    error: "border-brand-200 bg-brand-50 text-brand-800",
    success: "border-leaf-100 bg-leaf-50 text-leaf-700",
    info: "border-ink-200 bg-ink-50 text-ink-700",
  };
  return (
    <div role="alert" className={`mb-5 rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
};

/* ---------------------------- Estado vacío ---------------------------- */
export const EmptyState = ({
  icon = "bag",
  title,
  text,
  action,
}: {
  icon?: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
}) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-brand-600">
      <Icon name={icon} className="h-6 w-6" />
    </span>
    <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
    {text && <p className="mt-1 max-w-sm text-sm text-ink-500">{text}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/* ------------------------------ Loading ------------------------------ */
export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
);

export const ProductGridSkeleton = ({ n = 8 }: { n?: number }) => (
  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i}>
        <Skeleton className="aspect-[4/5] w-full" />
        <Skeleton className="mt-3 h-3 w-1/3" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
    ))}
  </div>
);

export const PageLoading = ({ label = "Cargando…" }: { label?: string }) => (
  <div className="flex items-center gap-3 py-16 text-ink-500" role="status">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
    {label}
  </div>
);

/* --------------------------- Badge de estado --------------------------- */
const ESTADO_STYLES: Record<string, string> = {
  pendiente: "bg-gold-100 text-gold-700",
  preparando: "bg-sand text-ink-700",
  enviado: "bg-brand-100 text-brand-700",
  entregado: "bg-leaf-100 text-leaf-700",
  cancelado: "bg-ink-100 text-ink-500 line-through",
  pagado: "bg-leaf-100 text-leaf-700",
  pagada: "bg-leaf-100 text-leaf-700",
};

export const StatusBadge = ({ estado }: { estado: string }) => (
  <span className={`badge ${ESTADO_STYLES[estado] ?? "bg-ink-100 text-ink-600"}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {estado}
  </span>
);

/* ------------------------------ Marca ------------------------------ */
export const Logo = ({ light = false }: { light?: boolean }) => (
  <span className="inline-flex items-center gap-2.5">
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-base font-semibold ${
        light ? "bg-white text-brand-700" : "bg-brand-600 text-white"
      }`}
    >
      M
    </span>
    <span className={`font-display text-xl font-semibold tracking-tight ${light ? "text-white" : "text-ink-900"}`}>
      MultiCatálogo
    </span>
  </span>
);
