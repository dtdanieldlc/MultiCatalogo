// /mis-pedidos — historial + timeline de estado
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../services/http";
import {
  Alert,
  EmptyState,
  PageHeader,
  PageLoading,
  StatusBadge,
  money,
} from "./ui";

interface PedidoLista {
  id: number;
  numero: string;
  total: number;
  estado: string;
  fecha: string;
}

interface Pagina {
  data: PedidoLista[];
  total: number;
}

const PASOS = ["pendiente", "confirmado", "enviado", "entregado"];

function Timeline({ estado }: { estado: string }) {
  const e = estado.toLowerCase();
  if (e.includes("cancel")) {
    return (
      <p className="text-xs font-medium text-red-600">Pedido cancelado</p>
    );
  }
  let idx = PASOS.findIndex((p) => e.includes(p));
  if (idx < 0) idx = 0;
  return (
    <ol className="mt-3 flex gap-1">
      {PASOS.map((p, i) => (
        <li key={p} className="flex-1">
          <div
            className={`h-1.5 rounded-full ${
              i <= idx ? "bg-brand-600" : "bg-ink-100"
            }`}
          />
          <p
            className={`mt-1 text-[10px] capitalize ${
              i <= idx ? "font-semibold text-brand-700" : "text-ink-400"
            }`}
          >
            {p}
          </p>
        </li>
      ))}
    </ol>
  );
}

const MisPedidos = () => {
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch<Pagina | PedidoLista[]>(
          "/api/pedidos/mios?page=1&limit=30"
        );
        if (cancel) return;
        if (Array.isArray(data)) {
          setPagina({ data, total: data.length });
        } else {
          setPagina(data);
        }
      } catch (e) {
        if (!cancel)
          setError(e instanceof ApiError ? e.message : "Error al cargar pedidos");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const lista = pagina?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Historial"
        title="Mis pedidos"
        subtitle="Seguimiento y detalle de tus compras"
      />
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <PageLoading label="Cargando pedidos…" />
      ) : lista.length === 0 && !error ? (
        <EmptyState
          icon="clipboard"
          title="Aún no has realizado pedidos"
          text="Cuando compres algo, aparecerá aquí."
          action={
            <Link to="/catalogo" className="btn btn-primary">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((p) => {
            const open = abierto === p.id;
            return (
              <li key={p.id} className="card p-5">
                <button
                  type="button"
                  className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => setAbierto(open ? null : p.id)}
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-ink-900">
                      {p.numero}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-500">
                      {new Date(p.fecha).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <StatusBadge estado={p.estado} />
                    <p className="font-display text-2xl font-semibold text-ink-900">
                      {money(p.total)}
                    </p>
                  </div>
                </button>
                {open && (
                  <div className="mt-4 border-t border-ink-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Seguimiento
                    </p>
                    <Timeline estado={p.estado} />
                    <Link
                      to={`/confirmacion?pedido=${p.id}`}
                      className="btn btn-sm btn-outline mt-4"
                    >
                      Ver comprobante
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MisPedidos;
