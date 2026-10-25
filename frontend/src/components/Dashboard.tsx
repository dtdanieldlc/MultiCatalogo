// Dashboard admin — KPIs + accesos rápidos + alertas
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../services/http";
import { getConfig } from "../services/adminConfigService";
import { Alert, Icon, PageHeader, Skeleton, money } from "./ui";

interface Resumen {
  totalVendido: number;
  numPedidos: number;
  ticketPromedio: number;
  comisionesDevengadas: number;
}

interface TopProducto {
  productoId: number;
  nombre: string;
  cantidad: number;
  total: number;
}

interface TopReferido {
  referidoId: number;
  nombre: string;
  ventas: number;
  saldo: number;
}

interface ProductoAdmin {
  id: number;
  stock: number;
  activo: boolean;
}

const Dashboard = () => {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [topProd, setTopProd] = useState<TopProducto[]>([]);
  const [topRef, setTopRef] = useState<TopReferido[]>([]);
  const [stockBajo, setStockBajo] = useState(0);
  const [agotados, setAgotados] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const umbral = getConfig().stockBajo;

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [r, p, ref, prods] = await Promise.all([
          apiFetch<Resumen>("/api/reportes/resumen"),
          apiFetch<TopProducto[]>("/api/reportes/top-productos?limit=5"),
          apiFetch<TopReferido[]>("/api/reportes/top-referidos?limit=5"),
          apiFetch<{ data: ProductoAdmin[] }>(
            "/api/admin/productos?page=1&limit=100"
          ).catch(() => ({ data: [] as ProductoAdmin[] })),
        ]);
        if (cancel) return;
        setResumen(r);
        setTopProd(p ?? []);
        setTopRef(ref ?? []);
        const list = prods?.data ?? [];
        setAgotados(list.filter((x) => x.stock <= 0).length);
        setStockBajo(
          list.filter((x) => x.stock > 0 && x.stock <= umbral).length
        );
      } catch (e) {
        if (!cancel) {
          setError(
            e instanceof ApiError
              ? e.message
              : "No se pudieron cargar los reportes"
          );
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [umbral]);

  const kpis = resumen
    ? [
        {
          etiqueta: "Total vendido",
          valor: money(resumen.totalVendido),
          icon: "coin" as const,
          tono: "bg-brand-50 text-brand-600",
        },
        {
          etiqueta: "Nº pedidos",
          valor: String(resumen.numPedidos),
          icon: "clipboard" as const,
          tono: "bg-sand text-ink-700",
        },
        {
          etiqueta: "Ticket promedio",
          valor: money(resumen.ticketPromedio),
          icon: "bag" as const,
          tono: "bg-gold-50 text-gold-700",
        },
        {
          etiqueta: "Comisiones devengadas",
          valor: money(resumen.comisionesDevengadas),
          icon: "users" as const,
          tono: "bg-leaf-50 text-leaf-600",
        },
      ]
    : [];

  const accesos = [
    { to: "/admin/usuarios", label: "Usuarios", icon: "users" as const },
    { to: "/admin/productos", label: "Productos", icon: "box" as const },
    { to: "/admin/pedidos", label: "Pedidos", icon: "doc" as const },
    { to: "/admin/inventario", label: "Inventario", icon: "box" as const },
    { to: "/admin/reportes", label: "Reportes CSV", icon: "clipboard" as const },
    { to: "/admin/cupones", label: "Cupones", icon: "coin" as const },
    { to: "/admin/campanas", label: "Campañas", icon: "bag" as const },
    { to: "/admin/config", label: "Configuración", icon: "home" as const },
    {
      to: "/admin/liquidaciones",
      label: "Liquidaciones",
      icon: "coin" as const,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Resumen general"
        subtitle="Ventas, inventario y accesos del panel"
      />

      {error && <Alert>{error}</Alert>}

      {/* Alertas stock */}
      {(stockBajo > 0 || agotados > 0) && !loading && (
        <div className="mb-6 flex flex-wrap gap-3">
          {agotados > 0 && (
            <Link
              to="/admin/inventario"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {agotados} producto(s) agotado(s) — ver inventario
            </Link>
          )}
          {stockBajo > 0 && (
            <Link
              to="/admin/inventario"
              className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm font-medium text-gold-800"
            >
              {stockBajo} con stock bajo (≤ {umbral}) — reponer
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.etiqueta} className="card p-5">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tono}`}
                >
                  <Icon name={kpi.icon} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-500">
                  {kpi.etiqueta}
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                  {kpi.valor}
                </p>
              </div>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Accesos rápidos
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {accesos.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="card flex items-center gap-3 p-4 transition hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon name={a.icon} className="h-4 w-4" />
                  </span>
                  <span className="font-medium text-ink-800">{a.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card p-6">
              <h2 className="mb-5 font-display text-xl font-semibold">
                Top productos
              </h2>
              {topProd.length === 0 ? (
                <p className="text-sm text-ink-500">
                  Aún no hay ventas de productos
                </p>
              ) : (
                <ol className="divide-y divide-ink-100">
                  {topProd.map((p, i) => (
                    <li
                      key={p.productoId}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-700">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-ink-900">{p.nombre}</p>
                          <p className="text-xs text-ink-500">
                            {p.cantidad} uds.
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">{money(p.total)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="card p-6">
              <h2 className="mb-5 font-display text-xl font-semibold">
                Top referidos
              </h2>
              {topRef.length === 0 ? (
                <p className="text-sm text-ink-500">Sin datos de red aún</p>
              ) : (
                <ol className="divide-y divide-ink-100">
                  {topRef.map((r, i) => (
                    <li
                      key={r.referidoId}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-50 font-display text-sm font-semibold text-leaf-700">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-ink-900">{r.nombre}</p>
                          <p className="text-xs text-ink-500">
                            Ventas {money(r.ventas)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-leaf-700">
                        {money(r.saldo)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
