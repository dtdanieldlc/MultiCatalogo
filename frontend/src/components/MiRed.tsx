// Mi Red — subárbol del usuario + link de invitación + ledger de comisiones
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../services/http';
import { Alert, Icon, PageHeader, PageLoading, StatusBadge, money } from './ui';

interface Referido {
  id: number;
  nombre: string;
  nivel: number;
  ventas: number;
  saldo?: number;
  hijos?: Referido[];
}

interface RedMia {
  red: Referido;
  codigo: string;
  link: string;
}

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

function Nodo({ n, depth = 0 }: { n: Referido; depth?: number }) {
  return (
    <li className={depth > 0 ? 'relative ml-4 border-l border-ink-200 pl-4 sm:ml-6 sm:pl-6' : ''}>
      <div className="my-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-sand/70 px-4 py-3 text-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
          {n.nombre.charAt(0).toUpperCase()}
        </span>
        <span className="font-semibold text-ink-900">{n.nombre}</span>
        <span className="badge bg-white text-ink-600">Nivel {n.nivel}</span>
        <span className="text-xs font-medium text-brand-700">ventas {money(n.ventas)}</span>
        {typeof n.saldo === 'number' && <span className="text-xs font-medium text-leaf-600">saldo {money(n.saldo)}</span>}
      </div>
      {n.hijos && n.hijos.length > 0 && (
        <ul>
          {n.hijos.map((h) => (
            <Nodo key={h.id} n={h} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

const MiRed = () => {
  const [redMia, setRedMia] = useState<RedMia | null>(null);
  const [coms, setComs] = useState<ComisionesResumen | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [r, c] = await Promise.all([
          apiFetch<RedMia>('/api/red/mia'),
          apiFetch<ComisionesResumen>('/api/comisiones/mias'),
        ]);
        if (cancel) return;
        setRedMia(r);
        setComs(c);
      } catch (e) {
        if (!cancel) setError(e instanceof ApiError ? e.message : 'Error al cargar la red');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const linkCompleto =
    redMia?.codigo != null
      ? `${window.location.origin}/registro?ref=${encodeURIComponent(redMia.codigo)}`
      : '';

  const copiar = async () => {
    if (!linkCompleto) return;
    try {
      await navigator.clipboard.writeText(linkCompleto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (loading) return <PageLoading label="Cargando tu red…" />;

  const resumen = coms
    ? [
        { k: 'Pendiente', v: coms.pendiente, c: 'bg-gold-50 text-gold-700' },
        { k: 'Pagado', v: coms.pagado, c: 'bg-leaf-50 text-leaf-700' },
        { k: 'Total', v: coms.total, c: 'bg-sand text-ink-800' },
      ]
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader eyebrow="Tu comunidad" title="Mi red" subtitle="Invita personas, mira tu árbol y controla tus comisiones." />

      {error && <Alert>{error}</Alert>}

      <section className="card relative overflow-hidden p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-100 blur-2xl" />
        <div className="relative">
          <h2 className="font-display text-xl font-semibold">Tu enlace de referido</h2>
          <p className="mb-4 mt-1 text-sm text-ink-500">Comparte este enlace para que nuevos clientes cuelguen de tu nodo.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Icon name="link" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input readOnly aria-label="Enlace de referido" className="input bg-sand pl-11 text-sm" value={linkCompleto} />
            </div>
            <button type="button" onClick={() => void copiar()} className={`btn ${copiado ? 'bg-leaf-600 text-white' : 'btn-dark'}`}>
              <Icon name={copiado ? 'check' : 'copy'} className="h-4 w-4" />
              {copiado ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          {redMia?.codigo && (
            <p className="mt-3 text-xs text-ink-500">
              Código: <span className="rounded-md bg-sand px-1.5 py-0.5 font-mono font-semibold text-ink-800">{redMia.codigo}</span>
            </p>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">Tu subárbol</h2>
        {redMia?.red ? (
          <ul>
            <Nodo n={redMia.red} />
          </ul>
        ) : (
          <p className="text-sm text-ink-500">No tienes nodo en la red aún</p>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">Mis comisiones</h2>
        {coms && (
          <div className="mb-6 grid grid-cols-3 gap-3 text-center">
            {resumen.map((r) => (
              <div key={r.k} className={`rounded-2xl p-3 sm:p-4 ${r.c}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{r.k}</p>
                <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">{money(r.v)}</p>
              </div>
            ))}
          </div>
        )}
        {!coms?.items?.length ? (
          <p className="text-sm text-ink-500">Aún no hay comisiones registradas</p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="th">Pedido</th>
                  <th className="th">Nivel</th>
                  <th className="th">%</th>
                  <th className="th">Monto</th>
                  <th className="th">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {coms.items.map((c) => (
                  <tr key={c.id}>
                    <td className="td font-mono text-xs">{c.pedidoNumero || c.pedidoId}</td>
                    <td className="td">{c.nivel}</td>
                    <td className="td">{(c.porcentaje * 100).toFixed(0)}%</td>
                    <td className="td font-semibold">{money(c.monto)}</td>
                    <td className="td"><StatusBadge estado={c.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default MiRed;
