// /mis-liquidaciones — historial API + solicitud local
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../services/http";
import {
  addSolicitud,
  getSolicitudes,
  type SolicitudLiquidacion,
} from "../services/clienteLocalService";
import {
  Alert,
  EmptyState,
  Icon,
  PageHeader,
  PageLoading,
  StatusBadge,
  money,
} from "./ui";

interface Liquidacion {
  id: number;
  referidoId: number;
  total: number;
  estado: string;
  creadoEn: string;
  pagadaEn?: string | null;
}

interface ComisionesResumen {
  pendiente: number;
  pagado: number;
  total: number;
}

const MisLiquidaciones = () => {
  const [list, setList] = useState<Liquidacion[]>([]);
  const [pendiente, setPendiente] = useState(0);
  const [solic, setSolic] = useState<SolicitudLiquidacion[]>(() => getSolicitudes());
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [liqs, coms] = await Promise.all([
          apiFetch<Liquidacion[]>("/api/liquidaciones/mias"),
          apiFetch<ComisionesResumen>("/api/comisiones/mias"),
        ]);
        if (cancel) return;
        setList(Array.isArray(liqs) ? liqs : []);
        setPendiente(coms?.pendiente ?? 0);
      } catch (e) {
        if (!cancel)
          setError(
            e instanceof ApiError ? e.message : "Error al cargar liquidaciones"
          );
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const solicitar = (e: FormEvent) => {
    e.preventDefault();
    if (pendiente <= 0) {
      setError("No tienes saldo pendiente para liquidar");
      return;
    }
    const s = addSolicitud(pendiente, nota.trim());
    setSolic(getSolicitudes());
    setNota("");
    setOk(
      `Solicitud #${s.id} registrada por ${money(pendiente)}. Un admin la procesará.`
    );
    setError("");
    setTimeout(() => setOk(""), 4000);
  };

  if (loading) return <PageLoading label="Cargando liquidaciones…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Tu negocio"
        title="Mis liquidaciones"
        subtitle="Pagos recibidos y solicitudes de retiro"
        action={
          <Link to="/mis-comisiones" className="btn btn-outline">
            Ver comisiones
          </Link>
        }
      />

      {error && <Alert>{error}</Alert>}
      {ok && <Alert tone="success">{ok}</Alert>}

      <section className="card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Saldo pendiente
            </p>
            <p className="mt-1 font-display text-3xl font-semibold text-gold-700">
              {money(pendiente)}
            </p>
          </div>
        </div>
        <form onSubmit={solicitar} className="mt-5 space-y-3">
          <div>
            <label className="label">Nota para el administrador (opcional)</label>
            <input
              className="input"
              placeholder="Ej. Transferencia a cuenta XXX"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={pendiente <= 0}
          >
            <Icon name="coin" className="h-4 w-4" /> Solicitar liquidación
          </button>
          <p className="text-xs text-ink-400">
            La solicitud queda registrada en este dispositivo. El administrador
            confirma el pago desde Liquidaciones.
          </p>
        </form>
      </section>

      {solic.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">
            Tus solicitudes
          </h2>
          <ul className="space-y-2">
            {solic.map((s) => (
              <li
                key={s.id}
                className="card flex flex-wrap items-center justify-between gap-2 p-4"
              >
                <div>
                  <p className="font-semibold">{money(s.monto)}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(s.creadoEn).toLocaleString()}
                    {s.nota ? ` · ${s.nota}` : ""}
                  </p>
                </div>
                <span className="badge bg-gold-100 text-gold-800">{s.estado}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Liquidaciones oficiales
        </h2>
        {list.length === 0 ? (
          <EmptyState
            icon="coin"
            title="Sin liquidaciones"
            text="Cuando el admin liquide tus comisiones, aparecerán aquí."
          />
        ) : (
          <ul className="space-y-2">
            {list.map((l) => (
              <li
                key={l.id}
                className="card flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-display text-xl font-semibold">
                    {money(l.total)}
                  </p>
                  <p className="text-xs text-ink-500">
                    {new Date(l.creadoEn).toLocaleString()}
                    {l.pagadaEn
                      ? ` · pagada ${new Date(l.pagadaEn).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <StatusBadge estado={l.estado} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default MisLiquidaciones;
