// Estimación de envío por ciudad (Ecuador) + cupones demo

export interface ShippingQuote {
  ciudad: string;
  costo: number;
  diasMin: number;
  diasMax: number;
  etiqueta: string;
}

const TARIFAS: Record<string, { costo: number; diasMin: number; diasMax: number }> = {
  guayaquil: { costo: 3.5, diasMin: 1, diasMax: 2 },
  quito: { costo: 4.5, diasMin: 2, diasMax: 4 },
  cuenca: { costo: 4.0, diasMin: 2, diasMax: 3 },
  manta: { costo: 4.0, diasMin: 2, diasMax: 3 },
  ambato: { costo: 4.5, diasMin: 2, diasMax: 4 },
  loja: { costo: 5.5, diasMin: 3, diasMax: 5 },
  "santa elena": { costo: 3.5, diasMin: 1, diasMax: 2 },
  riobamba: { costo: 4.5, diasMin: 2, diasMax: 4 },
  machala: { costo: 4.0, diasMin: 2, diasMax: 3 },
  esmeraldas: { costo: 5.0, diasMin: 3, diasMax: 5 },
};

export function estimarEnvio(ciudad: string, subtotal: number): ShippingQuote {
  const key = ciudad.trim().toLowerCase();
  const base = TARIFAS[key] ?? { costo: 5.5, diasMin: 3, diasMax: 6 };
  // Envío gratis sobre $80
  const costo = subtotal >= 80 ? 0 : base.costo;
  return {
    ciudad: ciudad.trim() || "—",
    costo,
    diasMin: base.diasMin,
    diasMax: base.diasMax,
    etiqueta:
      costo === 0
        ? "Envío gratis"
        : `$${costo.toFixed(2)} · ${base.diasMin}–${base.diasMax} días hábiles`,
  };
}

/** Cupones demo (sin backend) */
const CUPONES: Record<string, { tipo: "pct" | "fijo"; valor: number; min: number }> = {
  DTLC10: { tipo: "pct", valor: 10, min: 30 },
  BIENVENIDA: { tipo: "fijo", valor: 5, min: 25 },
  ENVIOGRATIS: { tipo: "pct", valor: 0, min: 0 }, // marca envío gratis
};

export interface CouponResult {
  codigo: string;
  descuento: number;
  envioGratis: boolean;
  mensaje: string;
}

export function aplicarCupon(
  codigo: string,
  subtotal: number
): CouponResult | { error: string } {
  const c = codigo.trim().toUpperCase();
  const rule = CUPONES[c];
  if (!rule) return { error: "Cupón no válido" };
  if (subtotal < rule.min) {
    return { error: `Mínimo de compra $${rule.min.toFixed(2)}` };
  }
  if (c === "ENVIOGRATIS") {
    return {
      codigo: c,
      descuento: 0,
      envioGratis: true,
      mensaje: "Envío gratis aplicado",
    };
  }
  const descuento =
    rule.tipo === "pct" ? (subtotal * rule.valor) / 100 : rule.valor;
  return {
    codigo: c,
    descuento: Math.round(descuento * 100) / 100,
    envioGratis: false,
    mensaje:
      rule.tipo === "pct"
        ? `${rule.valor}% de descuento`
        : `$${rule.valor.toFixed(2)} de descuento`,
  };
}
