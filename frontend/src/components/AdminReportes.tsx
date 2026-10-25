// /admin/reportes — exportar CSV de ventas, productos, usuarios, comisiones
import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../services/http";
import { downloadCsv } from "../services/adminConfigService";
import { Alert, Icon, PageHeader, PageLoading, money } from "./ui";

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

interface UsuarioAdmin {
  id: number;
  email: string;
  rol: string;
  nombre: string;
  activo: boolean;
  pedidos: number;
  totalComprado: number;
  codigoRef?: string;
}

interface PedidoLista {
  id: number;
  numero: string;
  total: number;
  estado: string;
  fecha: string;
  cliente?: string;
  email?: string;
}

interface Deuda {
  referidoId?: number;
  nombre?: string;
  saldo?: number;
  pendiente?: number;
  [key: string]: unknown;
}

const AdminReportes = () => {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [topProd, setTopProd] = useState<TopProducto[]>([]);
  const [topRef, setTopRef] = useState<TopReferido[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [pedidos, setPedidos] = useState<PedidoLista[]>([]);
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [r, p, ref, u, ped, d] = await Promise.all([
          apiFetch<Resumen>("/api/reportes/resumen"),
          apiFetch<TopProducto[]>("/api/reportes/top-productos?limit=50"),
          apiFetch<TopReferido[]>("/api/reportes/top-referidos?limit=50"),
          apiFetch<{ data: UsuarioAdmin[] } | UsuarioAdmin[]>(
            "/api/admin/usuarios?page=1&limit=100"
          ),
          apiFetch<{ data: PedidoLista[] } | PedidoLista[]>(
            "/api/pedidos?page=1&limit=100"
          ),
          apiFetch<Deuda[] | { data: Deuda[] }>(
            "/api/reportes/comisiones-pendientes"
          ).catch(() => []),
        ]);
        if (cancel) return;
        setResumen(r);
        setTopProd(Array.isArray(p) ? p : []);
        setTopRef(Array.isArray(ref) ? ref : []);
        setUsuarios(
          Array.isArray(u) ? u : Array.isArray((u as { data: UsuarioAdmin[] }).data)
            ? (u as { data: UsuarioAdmin[] }).data
            : []
        );
        setPedidos(
          Array.isArray(ped)
            ? ped
            : Array.isArray((ped as { data: PedidoLista[] }).data)
              ? (ped as { data: PedidoLista[] }).data
              : []
        );
        setDeudas(
          Array.isArray(d)
            ? d
            : Array.isArray((d as { data: Deuda[] }).data)
              ? (d as { data: Deuda[] }).data
              : []
        );
      } catch (e) {
        if (!cancel)
          setError(e instanceof ApiError ? e.message : "Error al cargar reportes");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const fecha = new Date().toISOString().slice(0, 10);

  const exportar = (tipo: string) => {
    if (tipo === "resumen" && resumen) {
      downloadCsv(
        `resumen-${fecha}.csv`,
        ["Métrica", "Valor"],
        [
          ["Total vendido", resumen.totalVendido],
          ["Nº pedidos", resumen.numPedidos],
          ["Ticket promedio", resumen.ticketPromedio],
          ["Comisiones devengadas", resumen.comisionesDevengadas],
        ]
      );
    }
    if (tipo === "productos") {
      downloadCsv(
        `top-productos-${fecha}.csv`,
        ["ID", "Nombre", "Cantidad", "Total"],
        topProd.map((p) => [p.productoId, p.nombre, p.cantidad, p.total])
      );
    }
    if (tipo === "referidos") {
      downloadCsv(
        `top-referidos-${fecha}.csv`,
        ["ID", "Nombre", "Ventas", "Saldo"],
        topRef.map((r) => [r.referidoId, r.nombre, r.ventas, r.saldo])
      );
    }
    if (tipo === "usuarios") {
      downloadCsv(
        `usuarios-${fecha}.csv`,
        ["ID", "Nombre", "Email", "Rol", "Activo", "Pedidos", "Total comprado", "Código"],
        usuarios.map((u) => [
          u.id,
          u.nombre,
          u.email,
          u.rol,
          u.activo ? "sí" : "no",
          u.pedidos,
          u.totalComprado,
          u.codigoRef ?? "",
        ])
      );
    }
    if (tipo === "pedidos") {
      downloadCsv(
        `pedidos-${fecha}.csv`,
        ["ID", "Número", "Total", "Estado", "Fecha", "Cliente", "Email"],
        pedidos.map((p) => [
          p.id,
          p.numero,
          p.total,
          p.estado,
          p.fecha,
          p.cliente ?? "",
          p.email ?? "",
        ])
      );
    }
    if (tipo === "comisiones") {
      downloadCsv(
        `comisiones-pendientes-${fecha}.csv`,
        ["Referido", "Nombre", "Pendiente"],
        deudas.map((d) => [
          String(d.referidoId ?? d.id ?? ""),
          String(d.nombre ?? ""),
          String(d.saldo ?? d.pendiente ?? d.total ?? 0),
        ])
      );
    }
  };

  if (loading) return <PageLoading label="Cargando reportes…" />;

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Reportes"
        subtitle="Exporta CSV para Excel / Google Sheets"
      />
      {error && <Alert>{error}</Alert>}

      {resumen && (
        <div className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            ["Total vendido", money(resumen.totalVendido)],
            ["Pedidos", String(resumen.numPedidos)],
            ["Ticket promedio", money(resumen.ticketPromedio)],
            ["Comisiones", money(resumen.comisionesDevengadas)],
          ].map(([k, v]) => (
            <div key={k} className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                {k}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold">{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            id: "resumen",
            titulo: "Resumen general",
            desc: "KPIs de ventas y comisiones",
            icon: "coin" as const,
          },
          {
            id: "pedidos",
            titulo: "Pedidos",
            desc: `${pedidos.length} registros`,
            icon: "clipboard" as const,
          },
          {
            id: "productos",
            titulo: "Top productos",
            desc: `${topProd.length} productos`,
            icon: "box" as const,
          },
          {
            id: "usuarios",
            titulo: "Usuarios",
            desc: `${usuarios.length} cuentas`,
            icon: "users" as const,
          },
          {
            id: "referidos",
            titulo: "Top referidos",
            desc: `${topRef.length} nodos`,
            icon: "users" as const,
          },
          {
            id: "comisiones",
            titulo: "Comisiones pendientes",
            desc: `${deudas.length} registros`,
            icon: "coin" as const,
          },
        ].map((card) => (
          <div key={card.id} className="card flex flex-col p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon name={card.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">{card.titulo}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-500">{card.desc}</p>
            <button
              type="button"
              onClick={() => exportar(card.id)}
              className="btn btn-dark mt-4 w-full"
            >
              <Icon name="doc" className="h-4 w-4" /> Descargar CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReportes;
