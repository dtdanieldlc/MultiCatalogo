// src/components/MisPedidos.tsx — historial del cliente
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

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

  if (loading) return <p className="text-slate-500 p-6">Cargando pedidos…</p>;
  if (error)
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg m-4 border border-red-200">{error}</div>
    );

  const lista = pagina?.data ?? [];

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Mis pedidos</h1>
      {lista.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 mb-4">Aún no has realizado pedidos.</p>
          <Link to="/catalogo" className="text-indigo-600 font-semibold hover:underline">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((p) => (
            <li
              key={p.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-slate-900">{p.numero}</p>
                <p className="text-sm text-slate-500">
                  {new Date(p.fecha).toLocaleString()} · {p.estado}
                </p>
              </div>
              <p className="text-lg font-bold text-indigo-600">${p.total.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisPedidos;
