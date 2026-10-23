// src/components/Confirmacion.tsx
// Pantalla de confirmación: lee el pedido enviado desde Checkout (location.state).
import { Link, useLocation } from 'react-router-dom';
import { Icon, money } from './ui';

interface PedidoConfirmado {
  numero: string;
  items: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  cliente: { nombre: string; email: string; ciudad: string };
  fecha: string;
}

const Sello = () => (
  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-600">
    <Icon name="check" className="h-8 w-8" />
  </span>
);

const Confirmacion = () => {
  const location = useLocation();
  const pedido = (location.state as { pedido?: PedidoConfirmado } | null)?.pedido;

  if (!pedido) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <Sello />
        <h1 className="mt-5 font-display text-3xl font-semibold">¡Gracias por tu compra!</h1>
        <p className="mb-7 mt-2 text-ink-500">Tu pedido ha sido registrado correctamente.</p>
        <Link to="/tienda" className="btn btn-primary">Volver a la tienda</Link>
      </div>
    );
  }

  const datos = [
    ["Cliente", pedido.cliente.nombre],
    ["Fecha", pedido.fecha],
    ["Correo", pedido.cliente.email],
    ["Ciudad", pedido.cliente.ciudad],
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card overflow-hidden">
        <div className="bg-leaf-50 px-8 py-10 text-center">
          <Sello />
          <h1 className="mt-5 font-display text-3xl font-semibold">¡Pedido confirmado!</h1>
          <p className="mt-2 text-ink-600">
            Número de pedido: <span className="font-mono font-semibold text-ink-900">{pedido.numero}</span>
          </p>
        </div>

        <div className="p-8">
          <dl className="mb-8 grid grid-cols-2 gap-5 text-sm">
            {datos.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-400">{k}</dt>
                <dd className="mt-1 font-medium text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mb-3 font-display text-lg font-semibold">Detalle del pedido</h2>
          <ul className="space-y-2 border-b border-ink-100 pb-4 text-sm">
            {pedido.items.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span className="text-ink-600">{item.nombre} × {item.cantidad}</span>
                <span className="font-semibold">{money(item.precio * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mb-8 mt-4 flex items-baseline justify-between">
            <span className="font-semibold">Total pagado</span>
            <span className="font-display text-3xl font-semibold text-leaf-600">{money(pedido.total)}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/tienda" className="btn btn-primary flex-1">Seguir comprando</Link>
            <Link to="/mis-pedidos" className="btn btn-outline flex-1">Ver mis pedidos</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;
