// /notificaciones — actividad reciente (comisiones + pedidos)
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/http";
import {
  getNotifLeidas,
  markAllNotifLeidas,
  markNotifLeida,
} from "../services/clienteLocalService";
import { EmptyState, Icon, PageHeader, PageLoading, money } from "./ui";

interface Notif {
  id: string;
  tipo: "comision" | "pedido";
  titulo: string;
  texto: string;
  fecha: string;
  href: string;
}

interface ComisionFila {
  id: number;
  monto: number;
  nivel: number;
  estado: string;
  creadoEn: string;
  pedidoNumero?: string;
}

interface PedidoLista {
  id: number;
  numero: string;
  total: number;
  estado: string;
  fecha: string;
}

const Notificaciones = () => {
  const [items, setItems] = useState<Notif[]>([]);
  const [leidas, setLeidas] = useState<string[]>(() => getNotifLeidas());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [coms, peds] = await Promise.all([
          apiFetch<{ items: ComisionFila[] }>("/api/comisiones/mias").catch(
            () => ({ items: [] as ComisionFila[] })
          ),
          apiFetch<{ data: PedidoLista[] } | PedidoLista[]>(
            "/api/pedidos/mios?page=1&limit=20"
          ).catch(() => ({ data: [] as PedidoLista[] })),
        ]);
        if (cancel) return;
        const lista: Notif[] = [];
        for (const c of coms.items ?? []) {
          lista.push({
            id: `c-${c.id}`,
            tipo: "comision",
            titulo: `Comisión nivel ${c.nivel}`,
            texto: `${money(c.monto)} · ${c.estado}${
              c.pedidoNumero ? ` · ${c.pedidoNumero}` : ""
            }`,
            fecha: c.creadoEn,
            href: "/mis-comisiones",
          });
        }
        const pedidos = Array.isArray(peds)
          ? peds
          : Array.isArray((peds as { data: PedidoLista[] }).data)
            ? (peds as { data: PedidoLista[] }).data
            : [];
        for (const p of pedidos) {
          lista.push({
            id: `p-${p.id}`,
            tipo: "pedido",
            titulo: `Pedido ${p.numero}`,
            texto: `${money(p.total)} · ${p.estado}`,
            fecha: p.fecha,
            href: "/mis-pedidos",
          });
        }
        lista.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setItems(lista.slice(0, 40));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const noLeidas = useMemo(
    () => items.filter((i) => !leidas.includes(i.id)).length,
    [items, leidas]
  );

  const marcarTodo = () => {
    markAllNotifLeidas(items.map((i) => i.id));
    setLeidas(getNotifLeidas());
  };

  if (loading) return <PageLoading label="Cargando actividad…" />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Actividad"
        title="Notificaciones"
        subtitle={
          noLeidas > 0
            ? `${noLeidas} sin leer`
            : "Comisiones y pedidos recientes"
        }
        action={
          noLeidas > 0 ? (
            <button type="button" className="btn btn-outline" onClick={marcarTodo}>
              Marcar todas leídas
            </button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="sparkles"
          title="Sin actividad"
          text="Cuando tengas pedidos o comisiones, te avisaremos aquí."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const leida = leidas.includes(n.id);
            return (
              <li key={n.id}>
                <Link
                  to={n.href}
                  onClick={() => {
                    markNotifLeida(n.id);
                    setLeidas(getNotifLeidas());
                  }}
                  className={`card flex items-start gap-3 p-4 transition hover:border-brand-200 ${
                    leida ? "opacity-70" : "ring-1 ring-brand-100"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      n.tipo === "comision"
                        ? "bg-leaf-50 text-leaf-700"
                        : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    <Icon
                      name={n.tipo === "comision" ? "coin" : "bag"}
                      className="h-4 w-4"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-900">{n.titulo}</p>
                      {!leida && (
                        <span className="h-2 w-2 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <p className="text-sm text-ink-600">{n.texto}</p>
                    <p className="mt-1 text-xs text-ink-400">
                      {new Date(n.fecha).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notificaciones;
