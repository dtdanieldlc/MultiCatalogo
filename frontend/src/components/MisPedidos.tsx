// src/components/MisPedidos.tsx — historial del cliente
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import { Alert, EmptyState, PageHeader, PageLoading, StatusBadge, money } from "./ui";

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

const MisPedidos = () => {
  const { user } = useAuth();
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
      <PageHeader eyebrow="Historial" title="Mis pedidos" />
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <PageLoading label="Cargando pedidos…" />
      ) : lista.length === 0 && !error ? (
        <EmptyState
          icon="clipboard"
          title="Aún no has realizado pedidos"
          text="Cuando compres algo, aparecerá aquí."
          action={<Link to="/catalogo" className="btn btn-primary">Ir al catálogo</Link>}
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((p) => (
            <li key={p.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm font-semibold text-ink-900">{p.numero}</p>
                <p className="mt-0.5 text-sm text-ink-500">{new Date(p.fecha).toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <StatusBadge estado={p.estado} />
                <p className="font-display text-2xl font-semibold text-ink-900">{money(p.total)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisPedidos;
