// Checkout: envío estimado, cupones, resumen profesional
import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import {
  aplicarCupon,
  estimarEnvio,
  type CouponResult,
} from "../services/shippingService";
import { Alert, EmptyState, Icon, PageHeader, money } from "./ui";

interface DatosEnvio {
  nombre: string;
  email: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  metodoPago: string;
}

const METODOS_PAGO = [
  "Tarjeta de crédito",
  "Transferencia bancaria",
  "Efectivo contra entrega",
];

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [datos, setDatos] = useState<DatosEnvio>({
    nombre: "",
    email: user?.email ?? "",
    direccion: "",
    ciudad: "",
    telefono: "",
    metodoPago: METODOS_PAGO[0],
  });
  const [cuponInput, setCuponInput] = useState("");
  const [cupon, setCupon] = useState<CouponResult | null>(null);
  const [cuponError, setCuponError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const envio = useMemo(
    () => estimarEnvio(datos.ciudad, totalPrice),
    [datos.ciudad, totalPrice]
  );

  const costoEnvio =
    cupon?.envioGratis || envio.costo === 0 ? 0 : envio.costo;
  const descuento = cupon?.descuento ?? 0;
  const totalFinal = Math.max(0, totalPrice - descuento + costoEnvio);

  if (cart.length === 0) {
    return (
      <EmptyState
        title="No tienes productos en el carrito"
        text="Añade algo del catálogo para continuar con tu compra."
        action={
          <Link to="/catalogo" className="btn btn-dark">
            <Icon name="arrow-left" className="h-4 w-4" /> Ir al catálogo
          </Link>
        }
      />
    );
  }

  const handleChange = (campo: keyof DatosEnvio, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const aplicar = () => {
    setCuponError("");
    const r = aplicarCupon(cuponInput, totalPrice);
    if ("error" in r) {
      setCupon(null);
      setCuponError(r.error);
      return;
    }
    setCupon(r);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Sin conexión. La compra requiere red.");
      return;
    }
    setProcesando(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token ?? ""}`,
        },
        body: JSON.stringify({
          cliente: {
            nombre: datos.nombre,
            email: datos.email,
            direccion: datos.direccion,
            ciudad: datos.ciudad,
            telefono: datos.telefono,
          },
          metodoPago: datos.metodoPago,
          items: cart.map((i) => ({
            productoId: i.id,
            cantidad: i.cantidad ?? 1,
          })),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message ?? `Error ${response.status}`);
      }

      const pedido = {
        numero: data.numero ?? data.pedido?.numero ?? `PED-${Date.now()}`,
        items: cart.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad ?? 1,
          precio: i.precio,
        })),
        total: data.total ?? totalFinal,
        subtotal: totalPrice,
        envio: costoEnvio,
        descuento,
        cupon: cupon?.codigo,
        cliente: {
          nombre: datos.nombre,
          email: datos.email,
          ciudad: datos.ciudad,
          direccion: datos.direccion,
          telefono: datos.telefono,
        },
        metodoPago: datos.metodoPago,
        fecha: new Date().toLocaleString(),
      };

      clearCart();
      navigate("/confirmacion", { state: { pedido } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Compra"
        title="Checkout"
        subtitle="Completa tus datos de envío y confirma el pedido."
      />

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-5">
          {error && <Alert>{error}</Alert>}

          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Datos de envío</h2>
            {(
              [
                ["nombre", "Nombre completo", "text"],
                ["email", "Correo", "email"],
                ["telefono", "Teléfono", "tel"],
                ["direccion", "Dirección", "text"],
                ["ciudad", "Ciudad", "text"],
              ] as const
            ).map(([campo, label, type]) => (
              <div key={campo}>
                <label className="label" htmlFor={campo}>
                  {label}
                </label>
                <input
                  id={campo}
                  required
                  type={type}
                  className="input"
                  value={datos[campo]}
                  onChange={(e) => handleChange(campo, e.target.value)}
                />
              </div>
            ))}
            {datos.ciudad.trim() && (
              <p className="rounded-xl bg-sand/80 px-4 py-3 text-sm text-ink-700">
                <span className="font-semibold">Envío estimado: </span>
                {costoEnvio === 0 && (cupon?.envioGratis || envio.costo === 0)
                  ? "Gratis"
                  : envio.etiqueta}
              </p>
            )}
          </div>

          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Pago</h2>
            <select
              className="input"
              value={datos.metodoPago}
              onChange={(e) => handleChange("metodoPago", e.target.value)}
            >
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <div>
              <label className="label" htmlFor="cupon">
                Cupón de descuento
              </label>
              <div className="flex gap-2">
                <input
                  id="cupon"
                  className="input flex-1"
                  placeholder="DTLC10, BIENVENIDA, ENVIOGRATIS"
                  value={cuponInput}
                  onChange={(e) => setCuponInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={aplicar}
                  className="btn btn-outline"
                >
                  Aplicar
                </button>
              </div>
              {cuponError && (
                <p className="mt-2 text-sm text-red-600">{cuponError}</p>
              )}
              {cupon && (
                <p className="mt-2 text-sm text-leaf-700">{cupon.mensaje}</p>
              )}
            </div>
          </div>
        </div>

        <aside className="card h-fit space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Resumen</h2>
          <ul className="space-y-2 border-b border-ink-100 pb-4 text-sm">
            {cart.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-ink-600">
                  {i.nombre} × {i.cantidad ?? 1}
                </span>
                <span className="font-medium">
                  {money(i.precio * (i.cantidad ?? 1))}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Subtotal</span>
              <span>{money(totalPrice)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-leaf-700">
                <span>Descuento</span>
                <span>−{money(descuento)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-500">Envío</span>
              <span>{costoEnvio === 0 ? "Gratis" : money(costoEnvio)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-semibold text-brand-700">
                {money(totalFinal)}
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-400">
            Envío gratis en compras desde $80. Cupones demo: DTLC10, BIENVENIDA,
            ENVIOGRATIS.
          </p>
          <button
            type="submit"
            disabled={procesando}
            className="btn btn-primary w-full py-3.5"
          >
            {procesando ? "Procesando…" : "Confirmar pedido"}
          </button>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
