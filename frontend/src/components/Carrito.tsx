// src/components/Carrito.tsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyState, Icon, PageHeader, money } from './ui';

const Carrito = () => {
  const { cart, removeFromCart, incrementQuantity, decrementQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Compra" title="Tu carrito" />
        <EmptyState
          title="Tu carrito está vacío"
          text="Aún no has añadido productos. Explora el catálogo y encuentra tu favorito."
          action={<Link to="/catalogo" className="btn btn-primary">Explorar catálogo</Link>}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Compra" title="Tu carrito" subtitle={`${cart.length} producto(s) seleccionados`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-3">
          {cart.map((item) => (
            <li key={item.id} className="card flex gap-4 p-3 sm:p-4">
              <Link to={`/producto/${item.id}`} className="shrink-0">
                <img src={item.img} alt={item.nombre} className="h-24 w-24 rounded-xl bg-sand object-cover sm:h-28 sm:w-28" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/producto/${item.id}`}>
                      <h3 className="truncate font-display text-lg font-medium text-ink-900 hover:text-brand-700">{item.nombre}</h3>
                    </Link>
                    <p className="text-sm text-ink-500">{money(item.precio)} c/u</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-400 transition hover:bg-brand-50 hover:text-brand-700"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <Icon name="trash" className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ink-200">
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-50"
                      aria-label="Disminuir cantidad"
                    >
                      <Icon name="minus" className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{item.cantidad}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-50"
                      aria-label="Aumentar cantidad"
                    >
                      <Icon name="plus" className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-semibold text-ink-900">{money(item.precio * item.cantidad)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit p-6 lg:sticky lg:top-4">
          <h2 className="font-display text-xl font-semibold">Resumen del pedido</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-medium">{money(totalPrice)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-ink-100 pt-4">
              <dt className="font-semibold text-ink-900">Total a pagar</dt>
              <dd className="font-display text-3xl font-semibold text-brand-700">{money(totalPrice)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="btn btn-primary mt-6 w-full py-3.5">
            Proceder al pago <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
          <Link to="/catalogo" className="btn btn-ghost mt-2 w-full">Seguir comprando</Link>
        </aside>
      </div>
    </div>
  );
};

export default Carrito;
