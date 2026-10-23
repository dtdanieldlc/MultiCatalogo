// Tarjeta de producto reutilizable (Storefront y Catálogo).
import { Link } from "react-router-dom";
import type { Producto } from "../data/productos";
import { Icon, money } from "./ui";

const ProductCard = ({ prod, onAdd }: { prod: Producto; onAdd?: (p: Producto) => void }) => (
  <article className="group flex flex-col">
    <Link
      to={`/producto/${prod.id}`}
      className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand"
    >
      <img
        src={prod.img}
        alt={prod.nombre}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-700 backdrop-blur">
        {prod.categoria}
      </span>
    </Link>
    <div className="mt-3 flex flex-1 flex-col">
      <Link to={`/producto/${prod.id}`}>
        <h3 className="font-display text-lg font-medium leading-snug text-ink-900 transition group-hover:text-brand-700">
          {prod.nombre}
        </h3>
      </Link>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-semibold text-ink-700">{money(prod.precio)}</p>
        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(prod)}
            aria-label={`Añadir ${prod.nombre} al carrito`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white transition hover:bg-brand-600 active:scale-90"
          >
            <Icon name="plus" className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </article>
);

export default ProductCard;
