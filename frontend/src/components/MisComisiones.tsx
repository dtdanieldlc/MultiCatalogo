// /mis-comisiones — ledger completo del distribuidor
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../services/http";
import {
  Alert,
  EmptyState,
  Icon,
  PageHeader,
  PageLoading,
  StatusBadge,
  money,
} from "./ui";

interface ComisionFila {
  id: number;
  pedidoId: number;
  pedidoNumero?: string;
  nivel: number;
  porcentaje: number;
  monto: number;
  estado: string;
  creadoEn: string;
}

interface ComisionesResumen {
  items: ComisionFila[];
  pendiente: number;
  pagado: number;
  total: number;
}

type Filtro = "todas" | "pendiente" | "pagada" | "pagado";

const MisComisiones = () => {
  const [coms, setComs] = useState<ComisionesResumen | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<ComisionesResumen>("/api/comisiones/mias");
        if (!cancel) setComs(data);
      } catch (e) {
        if (!cancel)
          setError(e instanceof ApiError ? e.message : "Error al cargar comisiones");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const items = useMemo(() => {
    const list = coms?.items ?? [];
    if (filtro === "todas") return list;
    return list.filter((c) =>
      c.estado.toLowerCase().includes(filtro === "pagada" ? "pagad" : filtro)
    );
  }, [coms, filtro]);

  if (loading) return <PageLoading label="Cargando comisiones…" />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Tu negocio"
        title="Mis comisiones"
        subtitle="Historial de ganancias por nivel y pedido"
        action={
          <Link to="/mis-liquidaciones" className="btn btn-dark">
            <Icon name="coin" className="h-4 w-4" /> Liquidaciones
          </Link>
        }
      />

      {error && <Alert>{error}</Alert>}

      {coms && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { k: "Pendiente", v: coms.pendiente, c: "bg-gold-50 text-gold-700" },
            { k: "Pagado", v: coms.pagado, c: "bg-leaf-50 text-leaf-700" },
            { k: "Total", v: coms.total, c: "bg-sand text-ink-800" },
          ].map((x) => (
            <div key={x.k} className={`card p-4 ${x.c}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                {x.k}
              </p>
              <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">
                {money(x.v)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["todas", "Todas"],
            ["pendiente", "Pendientes"],
            ["pagada", "Pagadas"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFiltro(k)}
            className={`btn btn-sm ${filtro === k ? "btn-dark" : "btn-outline"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {!coms?.items?.length ? (
        <EmptyState
          icon="coin"
          title="Sin comisiones aún"
          text="Cuando tu red genere ventas, aparecerán aquí."
          action={
            <Link to="/mi-red" className="btn btn-primary">
              Ver mi red
            </Link>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="search"
          title="Sin resultados"
          text="No hay comisiones con ese filtro."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-sand/60 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">%</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3 text-ink-600">
                    {new Date(c.creadoEn).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {c.pedidoNumero ?? `#${c.pedidoId}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-sand">N{c.nivel}</span>
                  </td>
                  <td className="px-4 py-3">{(c.porcentaje * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 font-semibold text-leaf-700">
                    {money(c.monto)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge estado={c.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisComisiones;
