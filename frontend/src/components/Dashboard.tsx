// Dashboard admin — KPIs reales desde /api/reportes/*
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../services/http';
import { Alert, Icon, PageHeader, Skeleton, money } from './ui';

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

const Dashboard = () => {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [topProd, setTopProd] = useState<TopProducto[]>([]);
  const [topRef, setTopRef] = useState<TopReferido[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [r, p, ref] = await Promise.all([
          apiFetch<Resumen>('/api/reportes/resumen'),
          apiFetch<TopProducto[]>('/api/reportes/top-productos?limit=5'),
          apiFetch<TopReferido[]>('/api/reportes/top-referidos?limit=5'),
        ]);
        if (cancel) return;
        setResumen(r);
        setTopProd(p ?? []);
        setTopRef(ref ?? []);
      } catch (e) {
        if (!cancel) {
          setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los reportes');
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const kpis = resumen
    ? [
        { etiqueta: 'Total vendido', valor: money(resumen.totalVendido), icon: 'coin' as const, tono: 'bg-brand-50 text-brand-600' },
        { etiqueta: 'Nº pedidos', valor: String(resumen.numPedidos), icon: 'clipboard' as const, tono: 'bg-sand text-ink-700' },
        { etiqueta: 'Ticket promedio', valor: money(resumen.ticketPromedio), icon: 'bag' as const, tono: 'bg-gold-50 text-gold-700' },
        { etiqueta: 'Comisiones devengadas', valor: money(resumen.comisionesDevengadas), icon: 'users' as const, tono: 'bg-leaf-50 text-leaf-600' },
      ]
    : [];

  return (
    <div>
      <PageHeader eyebrow="Administración" title="Resumen general" subtitle="Ventas, productos y red en un vistazo." />

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.etiqueta} className="card p-5">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tono}`}>
                  <Icon name={kpi.icon} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-500">{kpi.etiqueta}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{kpi.valor}</p>
              </div>
            ))}
            {!resumen && <p className="col-span-full text-ink-500">Sin datos de ventas en el periodo.</p>}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card p-6">
              <h2 className="mb-5 font-display text-xl font-semibold">Top productos</h2>
              {topProd.length === 0 ? (
                <p className="text-sm text-ink-500">Aún no hay ventas de productos</p>
              ) : (
                <ol className="divide-y divide-ink-100">
                  {topProd.map((p, i) => (
                    <li key={p.productoId} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-700">{i + 1}</span>
                        <div>
                          <p className="font-medium text-ink-900">{p.nombre}</p>
                          <p className="text-xs text-ink-500">{p.cantidad} uds.</p>
                        </div>
                      </div>
                      <span className="font-semibold">{money(p.total)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="card p-6">
              <h2 className="mb-5 font-display text-xl font-semibold">Top referidos</h2>
              {topRef.length === 0 ? (
                <p className="text-sm text-ink-500">Sin datos de red</p>
              ) : (
                <ol className="divide-y divide-ink-100">
                  {topRef.map((r, i) => (
                    <li key={r.referidoId} className="flex items-center justify-between gap-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 font-display text-sm font-semibold text-gold-700">{i + 1}</span>
                        <p className="font-medium text-ink-900">{r.nombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{money(r.ventas)}</p>
                        <p className="text-xs text-leaf-600">saldo {money(r.saldo)}</p>
                      </div>
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
