// Comparador de productos (máx. 3) — persistido en sessionStorage
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Producto } from "../data/productos";

const KEY = "multicatalogo_compare";
const MAX = 3;

interface CompareContextValue {
  items: Producto[];
  toggle: (p: Producto) => void;
  remove: (id: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function load(): Producto[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Producto[];
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Producto[]>(() => load());

  useEffect(() => {
    sessionStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const toggle = useCallback((p: Producto) => {
    setItems((prev) => {
      if (prev.some((x) => x.id === p.id)) {
        return prev.filter((x) => x.id !== p.id);
      }
      if (prev.length >= MAX) return prev;
      return [...prev, p];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      toggle,
      remove,
      clear,
      has: (id: number) => items.some((x) => x.id === id),
      isFull: items.length >= MAX,
    }),
    [items, toggle, remove, clear]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare debe usarse dentro de CompareProvider");
  return ctx;
}
