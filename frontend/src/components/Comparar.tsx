// Comparación lado a lado (hasta 3 productos)
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import { EmptyState, Icon, PageHeader, money } from "./ui";

const Comparar = () => {
  const { items, remove, clear } = useCompare();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="grid"
        title="Nada que comparar"
        text="Desde el catálogo, marca hasta 3 productos con el botón Comparar."
        action={
          <Link to="/catalogo" className="btn btn-dark">
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  const rows: { label: string; get: (p: (typeof items)[0]) => string }[] = [
    { label: "Precio", get: (p) => money(p.precio) },
    { label: "Categoría", get: (p) => p.categoria },
    {
      label: "Stock",
      get: (p) =>
        typeof p.stock === "number"
          ? p.stock > 0
            ? `${p.stock} uds.`
            : "Agotado"
          : "—",
    },
    {
      label: "Descripción",
      get: (p) =>
        p.descripcion.length > 120
          ? p.descripcion.slice(0, 120) + "…"
          : p.descripcion,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo"
        title="Comparar productos"
        subtitle={`${items.length} seleccionado(s)`}
      />
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" onClick={clear} className="btn btn-outline btn-sm">
          Vaciar
        </button>
        <Link to="/catalogo" className="btn btn-dark btn-sm">
          Seguir explorando
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100">
              <th className="w-36 px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                Atributo
              </th>
              {items.map((p) => (
                <th key={p.id} className="min-w-[180px] px-4 py-4 text-left">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200"
                      aria-label="Quitar"
                    >
                      <Icon name="x" className="h-3.5 w-3.5" />
                    </button>
                    <Link to={`/producto/${p.id}`}>
                      <img
                        src={p.img}
                        alt={p.nombre}
                        className="mb-3 aspect-square w-full rounded-xl object-cover"
                      />
                      <p className="font-display text-base font-semibold text-ink-900">
                        {p.nombre}
                      </p>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-ink-50">
                <td className="px-4 py-3 font-medium text-ink-500">{row.label}</td>
                {items.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-ink-800">
                    {row.get(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-4" />
              {items.map((p) => (
                <td key={p.id} className="px-4 py-4">
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    disabled={typeof p.stock === "number" && p.stock <= 0}
                    onClick={() => addToCart(p)}
                  >
                    Añadir al carrito
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Comparar;
