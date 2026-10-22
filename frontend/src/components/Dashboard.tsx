// Dashboard admin — KPIs reales desde /api/reportes/*
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../services/http';

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
        {
          etiqueta: 'Total vendido',
          valor: `$${resumen.totalVendido.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          color: 'text-indigo-600',
        },
        {
          etiqueta: 'Nº pedidos',
          valor: String(resumen.numPedidos),
          color: 'text-indigo-600',
        },
        {
          etiqueta: 'Ticket promedio',
          valor: `$${resumen.ticketPromedio.toFixed(2)}`,
          color: 'text-slate-800',
        },
        {
          etiqueta: 'Comisiones devengadas',
          valor: `$${resumen.comisionesDevengadas.toFixed(2)}`,
          color: 'text-green-600',
        },
      ]
    : [];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Resumen General</h1>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Cargando reportes…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => (
              <div
                key={kpi.etiqueta}
                className="bg-white p-5 rounded-lg shadow-sm border border-slate-100"
              >
                <p className="text-xs text-slate-500 uppercase font-semibold">{kpi.etiqueta}</p>
                <p className={`text-2xl sm:text-3xl font-bold mt-2 ${kpi.color}`}>{kpi.valor}</p>
              </div>
            ))}
            {!resumen && (
              <p className="text-slate-500 col-span-full">Sin datos de ventas en el periodo.</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Top productos</h2>
              {topProd.length === 0 ? (
                <p className="text-slate-500 text-sm">Aún no hay ventas de productos</p>
              ) : (
                <ul className="space-y-3">
                  {topProd.map((p, i) => (
                    <li
                      key={p.productoId}
                      className="flex justify-between items-center border-b border-slate-50 pb-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-800">{p.nombre}</p>
                          <p className="text-xs text-slate-500">{p.cantidad} uds.</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-800">${p.total.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Top referidos</h2>
              {topRef.length === 0 ? (
                <p className="text-slate-500 text-sm">Sin datos de red</p>
              ) : (
                <ul className="space-y-3">
                  {topRef.map((r, i) => (
                    <li
                      key={r.referidoId}
                      className="flex justify-between items-center border-b border-slate-50 pb-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-sm font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <p className="font-medium text-slate-800">{r.nombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${r.ventas.toLocaleString()}</p>
                        <p className="text-xs text-green-600">saldo ${r.saldo.toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
