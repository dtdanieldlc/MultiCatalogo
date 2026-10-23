// /admin/pedidos — listado + cambio de estado
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../services/http';
import { Alert, EmptyState, Icon, PageHeader, PageLoading, StatusBadge, money } from './ui';

interface PedidoLista {
  id: number;
  numero: string;
  total: number;
  estado: string;
  fecha: string;
  cliente?: string;
  email?: string;
}

interface Pagina {
  data: PedidoLista[];
  page: number;
  limit: number;
  total: number;
}

const ESTADOS = ['', 'pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'];

const transiciones: Record<string, string[]> = {
  pendiente: ['preparando', 'cancelado'],
  preparando: ['enviado', 'cancelado'],
  enviado: ['entregado', 'cancelado'],
  entregado: [],
  cancelado: [],
};

const AdminPedidos = () => {
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [filtro, setFiltro] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const cargar = useCallback(async (estado = filtro) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (estado) params.set('estado', estado);
      const data = await apiFetch<Pagina>(`/api/pedidos?${params}`);
      setPagina(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const cambiarEstado = async (id: number, estado: string) => {
    if (estado === 'cancelado') {
      const ok = window.confirm(
        '¿Cancelar el pedido? Se restaurará el stock y se revertirán comisiones pendientes.'
      );
      if (!ok) return;
    }
    setBusyId(id);
    setError('');
    try {
      await apiFetch(`/api/pedidos/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado');
    } finally {
      setBusyId(null);
    }
  };

  const lista = pagina?.data ?? [];

  return (
    <div>
      <PageHeader eyebrow="Administración" title="Pedidos" subtitle="Sigue cada pedido y avanza su estado." />

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {ESTADOS.map((e) => (
          <button
            key={e || 'todos'}
            type="button"
            onClick={() => setFiltro(e)}
            className={`chip capitalize ${filtro === e ? 'chip-active' : ''}`}
          >
            {e || 'Todos'}
          </button>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <PageLoading />
      ) : lista.length === 0 ? (
        <EmptyState icon="doc" title="No hay pedidos" text="No hay pedidos con ese filtro." />
      ) : (
        <ul className="space-y-3">
          {lista.map((p) => {
            const siguientes = transiciones[p.estado] ?? [];
            return (
              <li key={p.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-mono text-sm font-bold text-ink-900">{p.numero}</p>
                    <StatusBadge estado={p.estado} />
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {p.cliente || p.email || '—'} · {new Date(p.fecha).toLocaleString()}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{money(p.total)}</p>
                </div>
                {siguientes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {siguientes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => void cambiarEstado(p.id, s)}
                        className={`btn btn-sm capitalize ${s === 'cancelado' ? 'btn-danger' : 'btn-dark'}`}
                      >
                        {s !== 'cancelado' && <Icon name="arrow-right" className="h-3.5 w-3.5" />}
                        {s}
                      </button>
                    ))}
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

export default AdminPedidos;
