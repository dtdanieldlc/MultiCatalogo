// Mis pedidos + timeline de seguimiento
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
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
  page: number;
  limit: number;
  total: number;
}

const FLUJO = ["pendiente", "preparando", "enviado", "entregado"] as const;

function idxEstado(estado: string): number {
  if (estado === "cancelado") return -1;
  const i = FLUJO.indexOf(estado as (typeof FLUJO)[number]);
  return i >= 0 ? i : 0;
}

const Timeline = ({ estado }: { estado: string }) => {
  if (estado === "cancelado") {
    return (
      <p className="mt-3 text-sm font-medium text-red-600">Pedido cancelado</p>
    );
  }
  const actual = idxEstado(estado);
  return (
    <ol className="mt-4 flex items-center gap-0">
      {FLUJO.map((paso, i) => {
        const done = i <= actual;
        return (
          <li key={paso} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                  done
                    ? "bg-leaf-600 text-white"
                    : "bg-ink-100 text-ink-400"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`mt-1 text-[10px] capitalize ${
                  done ? "font-semibold text-ink-800" : "text-ink-400"
                }`}
              >
                {paso}
              </span>
            </div>
            {i < FLUJO.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${
                  i < actual ? "bg-leaf-500" : "bg-ink-100"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

const MisPedidos = () => {
  const { user } = useAuth();
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.token) return;
    setLoading(true);
    fetch(`${API_URL}/api/pedidos/mios?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) throw new Error(data?.message ?? `HTTP ${r.status}`);
        return data as Pagina;
      })
      .then(setPagina)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.token]);

  const lista = pagina?.data ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Historial"
        title="Mis pedidos"
        subtitle="Seguimiento de cada compra"
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
                  <div className="flex items-center gap-4">
                    <StatusBadge estado={p.estado} />
                    <p className="font-display text-2xl font-semibold text-ink-900">
                      {money(p.total)}
                    </p>
                  </div>
                </button>
                {open && (
                  <div className="mt-2 border-t border-ink-50 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Seguimiento
                    </p>
                    <Timeline estado={p.estado} />
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
