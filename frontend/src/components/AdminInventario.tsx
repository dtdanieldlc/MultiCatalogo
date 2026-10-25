// /admin/inventario — alertas de stock y reposición rápida
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../services/http";
import { getConfig } from "../services/adminConfigService";
import { Alert, EmptyState, PageHeader, PageLoading, money } from "./ui";

interface ProductoAdmin {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  activo: boolean;
  img: string;
}

interface Pagina {
  data: ProductoAdmin[];
  total: number;
}

type Filtro = "todos" | "bajo" | "agotado" | "ok";

const AdminInventario = () => {
  const cfg = getConfig();
  const umbral = cfg.stockBajo;
  const [lista, setLista] = useState<ProductoAdmin[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("bajo");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<Record<number, number>>({});

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<Pagina>("/api/admin/productos?page=1&limit=100");
      setLista(data.data ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    return lista.filter((p) => {
      if (filtro === "agotado") return p.stock <= 0;
      if (filtro === "bajo") return p.stock > 0 && p.stock <= umbral;
      if (filtro === "ok") return p.stock > umbral;
      return true;
    });
  }, [lista, filtro, umbral]);

  const stats = useMemo(() => {
    const agotado = lista.filter((p) => p.stock <= 0).length;
    const bajo = lista.filter((p) => p.stock > 0 && p.stock <= umbral).length;
    const ok = lista.filter((p) => p.stock > umbral).length;
    return { agotado, bajo, ok, total: lista.length };
  }, [lista, umbral]);

  const guardarStock = async (p: ProductoAdmin) => {
    const nuevo = editStock[p.id] ?? p.stock;
    setBusyId(p.id);
    setError("");
    try {
      await apiFetch(`/api/productos/${p.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: p.nombre,
          descripcion: "",
          precio: p.precio,
          categoria: p.categoria,
          img: p.img,
          galeria: [],
          stock: Number(nuevo),
        }),
      });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo actualizar stock");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Inventario"
        subtitle={`Umbral de stock bajo: ${umbral} uds. (configurable en Configuración)`}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "todos" as Filtro, label: "Todos", n: stats.total, tono: "" },
          { k: "bajo" as Filtro, label: "Stock bajo", n: stats.bajo, tono: "text-gold-700" },
          { k: "agotado" as Filtro, label: "Agotados", n: stats.agotado, tono: "text-red-600" },
          { k: "ok" as Filtro, label: "OK", n: stats.ok, tono: "text-leaf-700" },
        ].map((s) => (
          <button
            key={s.k}
            type="button"
            onClick={() => setFiltro(s.k)}
            className={`card p-4 text-left transition ${
              filtro === s.k ? "ring-2 ring-brand-500" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              {s.label}
            </p>
            <p className={`mt-1 font-display text-2xl font-semibold ${s.tono}`}>
              {s.n}
            </p>
          </button>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <PageLoading />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon="box"
          title="Sin productos en este filtro"
          text="Prueba otro filtro o revisa el catálogo."
          action={
            <Link to="/admin/productos" className="btn btn-dark">
              Ir a productos
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-sand/60 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Ajustar</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const nivel =
                  p.stock <= 0 ? "agotado" : p.stock <= umbral ? "bajo" : "ok";
                return (
                  <tr
                    key={p.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-sand/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.img}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="font-medium text-ink-900">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600">{p.categoria}</td>
                    <td className="px-4 py-3">{money(p.precio)}</td>
                    <td className="px-4 py-3 font-semibold">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          nivel === "agotado"
                            ? "bg-red-100 text-red-700"
                            : nivel === "bajo"
                              ? "bg-gold-100 text-gold-700"
                              : "bg-leaf-100 text-leaf-700"
                        }`}
                      >
                        {nivel === "agotado"
                          ? "Agotado"
                          : nivel === "bajo"
                            ? "Bajo"
                            : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min={0}
                          className="input w-20 py-1.5 text-sm"
                          value={editStock[p.id] ?? p.stock}
                          onChange={(e) =>
                            setEditStock((s) => ({
                              ...s,
                              [p.id]: Number(e.target.value),
                            }))
                          }
                        />
                        <button
                          type="button"
                          disabled={busyId === p.id}
                          onClick={() => void guardarStock(p)}
                          className="btn btn-sm btn-dark"
                        >
                          {busyId === p.id ? "…" : "Guardar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInventario;
