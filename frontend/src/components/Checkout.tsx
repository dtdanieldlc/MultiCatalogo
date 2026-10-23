// src/components/Checkout.tsx
// Flujo de checkout (Tema 5 + Fase 4):
// - Formulario de envío con validación básica
// - Resumen del pedido en tiempo real
// - Envía el pedido a POST /api/checkout y redirige a /confirmacion si el servidor lo confirma
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Alert, EmptyState, Icon, PageHeader, money } from './ui';

interface DatosEnvio {
  nombre: string;
  email: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  metodoPago: string;
}

const METODOS_PAGO = ["Tarjeta de crédito", "Transferencia bancaria", "Efectivo contra entrega"];

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [datos, setDatos] = useState<DatosEnvio>({
    nombre: "",
    email: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    metodoPago: METODOS_PAGO[0],
  });
  const [procesando, setProcesando] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Si el carrito está vacío, mostramos un aviso en lugar del formulario
  if (cart.length === 0) {
    return (
      <EmptyState
        title="No tienes productos en el carrito"
        text="Añade algo del catálogo para continuar con tu compra."
        action={<Link to="/catalogo" className="btn btn-dark"><Icon name="arrow-left" className="h-4 w-4" /> Ir al catálogo</Link>}
      />
    );
  }

  const handleChange = (campo: keyof DatosEnvio, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  // Fase 4: el pedido se envía a POST /api/checkout (transacción ACID en el backend).
  // El servidor calcula el total con los precios de la BD; aquí solo se mandan id y cantidad.
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
          items: cart.map((item) => ({ id: item.id, cantidad: item.cantidad })),
        }),
      });

      // Errores con formato estandarizado: { status, message, details }
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message ?? "Error inesperado del servidor");
      }

      // Pedido confirmado por el servidor: vaciamos el carrito y mostramos el recibo
      const pedido = { ...data, fecha: new Date(data.fecha).toLocaleString("es-EC") };
      clearCart();
      navigate("/confirmacion", { state: { pedido } });
    } catch (err) {
      // TypeError = el navegador no pudo contactar al servidor (caído, CORS, red)
      setError(
        err instanceof TypeError
          ? "No se pudo conectar con el servidor"
          : (err as Error).message
      );
      setProcesando(false); // el carrito NO se vacía: el cliente puede reintentar
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Último paso" title="Finalizar compra" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-5 font-display text-xl font-semibold">Datos de envío</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label htmlFor="nombre" className="label">Nombre completo *</label>
                <input id="nombre" type="text" required autoComplete="name" value={datos.nombre} onChange={(e) => handleChange("nombre", e.target.value)} className="input" />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="email" className="label">Correo electrónico *</label>
                <input id="email" type="email" required autoComplete="email" value={datos.email} onChange={(e) => handleChange("email", e.target.value)} className="input" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="direccion" className="label">Dirección *</label>
                <input id="direccion" type="text" required autoComplete="street-address" value={datos.direccion} onChange={(e) => handleChange("direccion", e.target.value)} className="input" />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="ciudad" className="label">Ciudad *</label>
                <input id="ciudad" type="text" required autoComplete="address-level2" value={datos.ciudad} onChange={(e) => handleChange("ciudad", e.target.value)} className="input" />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="telefono" className="label">Teléfono *</label>
                <input id="telefono" type="tel" required autoComplete="tel" value={datos.telefono} onChange={(e) => handleChange("telefono", e.target.value)} className="input" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-5 font-display text-xl font-semibold">Método de pago</h2>
            <div className="space-y-3" role="radiogroup">
              {METODOS_PAGO.map((metodo) => {
                const activo = datos.metodoPago === metodo;
                return (
                  <label
                    key={metodo}
                    className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border px-4 transition ${
                      activo ? "border-brand-500 bg-brand-50 ring-4 ring-brand-100" : "border-ink-200 hover:border-ink-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value={metodo}
                      checked={activo}
                      onChange={(e) => handleChange("metodoPago", e.target.value)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span className="text-sm font-medium text-ink-800">{metodo}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {error && <Alert>{error}</Alert>}

          <button type="submit" disabled={procesando} className="btn btn-primary w-full py-4 text-base">
            {procesando ? "Procesando pago…" : `Confirmar pedido · ${money(totalPrice)}`}
          </button>
        </form>

        {/* ===== RESUMEN ===== */}
        <aside className="card h-fit p-6 lg:sticky lg:top-4">
          <h2 className="font-display text-xl font-semibold">Resumen</h2>
          <ul className="mt-5 space-y-4 border-b border-ink-100 pb-5">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="relative">
                  <img src={item.img} alt="" className="h-14 w-14 rounded-lg bg-sand object-cover" />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-ink-900 px-1 text-[11px] font-bold text-white">
                    {item.cantidad}
                  </span>
                </span>
                <span className="flex-1 text-sm text-ink-700">{item.nombre}</span>
                <span className="text-sm font-semibold">{money(item.precio * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-display text-3xl font-semibold text-brand-700">{money(totalPrice)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
