// Configuración de negocio + cupones (admin) — localStorage
// Claves compartidas con el checkout (shippingService) cuando aplique.

export interface BusinessConfig {
  /** Comisión nivel 1 (0-1) */
  comisionN1: number;
  comisionN2: number;
  comisionN3: number;
  /** Mínimo para solicitar liquidación */
  minLiquidacion: number;
  /** Envío gratis desde este subtotal */
  envioGratisDesde: number;
  /** Umbral de stock bajo */
  stockBajo: number;
  /** Nombre comercial */
  nombreNegocio: string;
  /** IVA % (informativo en facturas) */
  ivaPct: number;
}

export interface AdminCupon {
  id: string;
  codigo: string;
  tipo: "pct" | "fijo" | "envio";
  valor: number;
  minCompra: number;
  usosMax: number;
  usosHechos: number;
  activo: boolean;
  expira?: string; // ISO date
}

export interface BannerCampana {
  id: string;
  titulo: string;
  texto: string;
  cta: string;
  ctaUrl: string;
  activo: boolean;
  desde?: string;
  hasta?: string;
}

const KEY_CFG = "multicatalogo_admin_config";
const KEY_CUP = "multicatalogo_admin_cupones";
const KEY_BAN = "multicatalogo_admin_banners";

export const DEFAULT_CONFIG: BusinessConfig = {
  comisionN1: 0.1,
  comisionN2: 0.05,
  comisionN3: 0.02,
  minLiquidacion: 20,
  envioGratisDesde: 80,
  stockBajo: 15,
  nombreNegocio: "DTLC MultiCatálogo",
  ivaPct: 12,
};

export function getConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(KEY_CFG);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(cfg: BusinessConfig): void {
  localStorage.setItem(KEY_CFG, JSON.stringify(cfg));
}

export function getCupones(): AdminCupon[] {
  try {
    const raw = localStorage.getItem(KEY_CUP);
    if (!raw) {
      // semillas demo
      const seed: AdminCupon[] = [
        {
          id: "1",
          codigo: "DTLC10",
          tipo: "pct",
          valor: 10,
          minCompra: 30,
          usosMax: 1000,
          usosHechos: 0,
          activo: true,
        },
        {
          id: "2",
          codigo: "BIENVENIDA",
          tipo: "fijo",
          valor: 5,
          minCompra: 25,
          usosMax: 500,
          usosHechos: 0,
          activo: true,
        },
        {
          id: "3",
          codigo: "ENVIOGRATIS",
          tipo: "envio",
          valor: 0,
          minCompra: 0,
          usosMax: 200,
          usosHechos: 0,
          activo: true,
        },
      ];
      localStorage.setItem(KEY_CUP, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as AdminCupon[];
  } catch {
    return [];
  }
}

export function saveCupones(list: AdminCupon[]): void {
  localStorage.setItem(KEY_CUP, JSON.stringify(list));
}

export function getBanners(): BannerCampana[] {
  try {
    const raw = localStorage.getItem(KEY_BAN);
    if (!raw) return [];
    return JSON.parse(raw) as BannerCampana[];
  } catch {
    return [];
  }
}

export function saveBanners(list: BannerCampana[]): void {
  localStorage.setItem(KEY_BAN, JSON.stringify(list));
}

/** Exporta filas a CSV y dispara descarga */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))];
  const blob = new Blob(["\ufeff" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
