// src/components/Storefront.tsx
// Tienda: hero editorial, categorías, destacados y explicación del plan multinivel.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductos } from '../services/productosService';
import type { Producto } from '../data/productos';
import { categorias } from '../data/productos';
import ProductCard from './ProductCard';
import { Icon, ProductGridSkeleton } from './ui';

const PASOS = [
  { titulo: 'Explora y compra', texto: 'Elige tus productos favoritos del catálogo y genera tu primera venta.' },
  { titulo: 'Invita a tu red', texto: 'Comparte tu enlace de referido. Cada invitado suma un nivel en tu red.' },
  { titulo: 'Gana comisiones', texto: 'Recibe 10 %, 5 % y 2 % de las ventas de tus niveles 1, 2 y 3.' },
];

const Storefront = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [destacados, setDestacados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getProductos()
      .then((data) => {
        setDestacados(data.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-900 text-white">
        <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-brand-600/50 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="relative grid items-center gap-10 px-6 py-12 md:px-12 md:py-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200">
              Cosmética · venta en red
            </p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Belleza que se comparte, <em className="font-medium italic text-brand-200">ganancias que crecen.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-brand-100/90">
              Explora nuestra línea de cosméticos premium y descubre cómo tu red de referidos genera comisiones en cada nivel.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/catalogo" className="btn bg-white px-7 py-3.5 text-brand-800 hover:bg-brand-50">
                Ver catálogo completo <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
              {user?.rol === 'admin' && (
                <Link to="/mi-red" className="btn border border-white/30 px-7 py-3.5 text-white hover:bg-white/10">
                  Conocer el plan multinivel
                </Link>
              )}
            </div>
          </div>

          {/* Collage de productos */}
          <div className="hidden grid-cols-2 gap-4 lg:grid" aria-hidden="true">
            {(loading ? [] : destacados.slice(0, 2)).map((p, i) => (
              <img
                key={p.id}
                src={p.img}
                alt=""
                className={`aspect-[3/4] w-full rounded-3xl object-cover shadow-lift ${i === 1 ? 'mt-10' : ''}`}
              />
            ))}
            {loading && (
              <>
                <div className="aspect-[3/4] rounded-3xl bg-white/10" />
                <div className="mt-10 aspect-[3/4] rounded-3xl bg-white/10" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== CATEGORÍAS ===== */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Comprar por</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Categorías</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {categorias.map((cat, i) => (
            <Link
              key={cat}
              to={`/catalogo?categoria=${encodeURIComponent(cat)}`}
              className="group card flex min-h-[110px] flex-col justify-between p-5 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="font-display text-sm text-brand-600">0{i + 1}</span>
              <span className="flex items-center justify-between font-semibold text-ink-800">
                {cat}
                <Icon name="arrow-right" className="h-4 w-4 text-ink-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== DESTACADOS ===== */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Selección</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Productos destacados</h2>
          </div>
          <Link to="/catalogo" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
            Ver todo →
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton n={4} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {destacados.map((prod) => (
              <ProductCard key={prod.id} prod={prod} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>

      {/* ===== PLAN MULTINIVEL ===== */}
      <section className="rounded-[2rem] bg-sand px-6 py-12 md:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-2">Plan multinivel</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">¿Cómo funciona?</h2>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {PASOS.map((item, i) => (
            <li key={item.titulo} className="rounded-2xl bg-white p-7 shadow-soft">
              <span className="font-display text-5xl font-medium text-brand-200">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold text-ink-900">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== LLAMADA FINAL ===== */}
      <section className="rounded-[2rem] bg-ink-900 px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-medium text-white md:text-5xl">Comienza tu propia red hoy</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-300">
          Únete a MultiCatálogo y transforma tu red de contactos en un negocio de cosméticos premium.
        </p>
        <Link to="/catalogo" className="btn btn-primary mt-8 px-9 py-3.5">
          Explorar el catálogo
        </Link>
      </section>
    </div>
  );
};

export default Storefront;
