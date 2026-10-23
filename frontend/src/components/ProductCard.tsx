// Tarjeta de producto: stock, comparar, carrito
import { Link } from "react-router-dom";
import type { Producto } from "../data/productos";
import { useCompare } from "../context/CompareContext";
import { Icon, money } from "./ui";

const ProductCard = ({
  prod,
  onAdd,
}: {
  prod: Producto;
  onAdd?: (p: Producto) => void;
}) => {
  const { toggle, has, isFull } = useCompare();
  const enComparar = has(prod.id);
  const sinStock = typeof prod.stock === "number" && prod.stock <= 0;

  return (
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
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1571781926291-c77df809dbe5?w=600&h=600&fit=crop";
          }}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-700 backdrop-blur">
            {prod.categoria}
          </span>
          {prod.nuevo && (
            <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
              Nuevo
            </span>
          )}
          {prod.destacado && !prod.nuevo && (
            <span className="rounded-full bg-gold-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
              Destacado
            </span>
          )}
        </div>
        {typeof prod.stock === "number" && prod.stock <= 30 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink-900/85 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            {prod.stock <= 0 ? "Agotado" : `Quedan ${prod.stock}`}
          </span>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <Link to={`/producto/${prod.id}`}>
          <h3 className="font-display text-lg font-medium leading-snug text-ink-900 transition group-hover:text-brand-700">
            {prod.nombre}
          </h3>
        </Link>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="font-semibold text-ink-700">{money(prod.precio)}</p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => toggle(prod)}
              disabled={!enComparar && isFull}
              title={
                enComparar
                  ? "Quitar de comparar"
                  : isFull
                    ? "Máximo 3 productos"
                    : "Comparar"
              }
              aria-label="Comparar"
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-90 ${
                enComparar
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-ink-200 text-ink-500 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              <Icon name="grid" className="h-4 w-4" />
            </button>
            {onAdd && (
              <button
                type="button"
                onClick={() => onAdd(prod)}
                disabled={sinStock}
                aria-label={`Añadir ${prod.nombre} al carrito`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white transition hover:bg-brand-600 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
