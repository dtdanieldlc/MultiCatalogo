// /admin/liquidaciones — deudas pendientes + historial
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../services/http';
import { Alert, EmptyState, PageHeader, PageLoading, money } from './ui';

interface Deuda {
  referidoId: number;
  nombre: string;
  codigo: string;
  pendiente: number;
}

interface Liquidacion {
  id: number;
  referidoId: number;
  nombre?: string;
  total: number;
  estado: string;
  creadoEn: string;
  pagadaEn?: string;
}

const AdminLiquidaciones = () => {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [historial, setHistorial] = useState<Liquidacion[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [d, h] = await Promise.all([
        apiFetch<Deuda[]>('/api/reportes/comisiones-pendientes'),
        apiFetch<Liquidacion[]>('/api/liquidaciones'),
      ]);
      setDeudas(d ?? []);
      setHistorial(h ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cargar liquidaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const liquidar = async (referidoId: number, nombre: string) => {
    const ok = window.confirm(`¿Liquidar comisiones pendientes de ${nombre}?`);
    if (!ok) return;
    setBusy(referidoId);
    setError('');
    try {
      await apiFetch('/api/liquidaciones', {
        method: 'POST',
        body: JSON.stringify({ referido_id: referidoId }),
      });
      await cargar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo liquidar');
    } finally {
      setBusy(null);
    }
  };

  const totalDeuda = deudas.reduce((acc, d) => acc + d.pendiente, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Administración"
        title="Liquidaciones"
        subtitle="Paga las comisiones acumuladas de tu red."
        action={
          deudas.length > 0 ? (
            <div className="rounded-2xl bg-gold-50 px-5 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">Deuda total</p>
              <p className="font-display text-2xl font-semibold text-gold-700">{money(totalDeuda)}</p>
            </div>
          ) : undefined
        }
      />

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <PageLoading />
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Deuda pendiente</h2>
            {deudas.length === 0 ? (
              <EmptyState icon="coin" title="Todo al día" text="No hay comisiones pendientes de liquidar." />
            ) : (
              <ul className="space-y-3">
                {deudas.map((d) => (
                  <li key={d.referidoId} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 font-semibold text-white">
                        {d.nombre.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-ink-900">{d.nombre}</p>
                        <p className="text-sm text-ink-500">Código: {d.codigo || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="font-display text-2xl font-semibold text-gold-700">{money(d.pendiente)}</span>
                      <button
                        type="button"
                        disabled={busy === d.referidoId}
                        onClick={() => void liquidar(d.referidoId, d.nombre)}
                        className="btn btn-primary"
                      >
                        {busy === d.referidoId ? 'Liquidando…' : 'Liquidar'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">Historial de pagos</h2>
            {historial.length === 0 ? (
              <p className="text-sm text-ink-500">Aún no hay liquidaciones registradas</p>
            ) : (
              <ul className="card divide-y divide-ink-100">
                {historial.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
                    <span className="text-ink-700">
                      <span className="font-mono text-xs text-ink-400">#{l.id}</span>{' '}
                      <span className="font-medium text-ink-900">{l.nombre || `Referido ${l.referidoId}`}</span>
                      <span className="block text-xs text-ink-500 sm:ml-2 sm:inline">{new Date(l.creadoEn).toLocaleDateString()}</span>
                    </span>
                    <span className="font-semibold text-leaf-700">{money(l.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminLiquidaciones;
