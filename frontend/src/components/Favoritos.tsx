import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "./ProductCard";
import { EmptyState, Icon, PageHeader } from "./ui";

const Favoritos = () => {
  const { items, clear } = useFavorites();
  const { addToCart } = useCart();

  return (
    <div>
      <PageHeader
        eyebrow="Tu lista"
        title="Favoritos"
        subtitle={
          items.length === 0
            ? "Aún no has marcado ningún producto"
            : `${items.length} producto${items.length === 1 ? "" : "s"} guardado${items.length === 1 ? "" : "s"}`
        }
      />

      {items.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button type="button" onClick={clear} className="btn btn-ghost text-sm text-ink-500">
            <Icon name="trash" className="h-4 w-4" /> Vaciar favoritos
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Sin favoritos todavía"
          text="Toca el corazón en cualquier producto del catálogo para guardarlo aquí."
          action={
            <Link to="/catalogo" className="btn btn-primary">
              <Icon name="grid" className="h-4 w-4" /> Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((prod) => (
            <ProductCard key={prod.id} prod={prod} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;
