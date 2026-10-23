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
import { useAuth } from "./AuthContext";

interface FavoritesContextValue {
  ids: number[];
  isFavorite: (id: number) => boolean;
  toggle: (prod: Producto) => void;
  remove: (id: number) => void;
  clear: () => void;
  /** Productos favoritos con datos cacheados al momento de marcarlos */
  items: Producto[];
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function storageKey(email: string | undefined) {
  return `multicatalogo_favoritos_${email ?? "anonimo"}`;
}

interface Stored {
  ids: number[];
  items: Producto[];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = storageKey(user?.email);

  const [ids, setIds] = useState<number[]>([]);
  const [items, setItems] = useState<Producto[]>([]);

  // Cargar al montar / cambiar de usuario
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setIds([]);
        setItems([]);
        return;
      }
      const data = JSON.parse(raw) as Stored;
      setIds(Array.isArray(data.ids) ? data.ids : []);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setIds([]);
      setItems([]);
    }
  }, [key]);

  // Persist
  useEffect(() => {
    const payload: Stored = { ids, items };
    localStorage.setItem(key, JSON.stringify(payload));
  }, [ids, items, key]);

  const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);

  const toggle = useCallback((prod: Producto) => {
    setIds((prev) => {
      if (prev.includes(prod.id)) {
        setItems((it) => it.filter((p) => p.id !== prod.id));
        return prev.filter((x) => x !== prod.id);
      }
      setItems((it) => (it.some((p) => p.id === prod.id) ? it : [...it, prod]));
      return [...prev, prod.id];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setIds((prev) => prev.filter((x) => x !== id));
    setItems((it) => it.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => {
    setIds([]);
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({ ids, isFavorite, toggle, remove, clear, items }),
    [ids, isFavorite, toggle, remove, clear, items]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  return ctx;
}
