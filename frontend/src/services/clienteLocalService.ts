// Datos locales del panel cliente/distribuidor (perfil extra, solicitudes, notifs leídas)

export interface PerfilExtra {
  nombre: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  whatsapp: string;
}

export interface SolicitudLiquidacion {
  id: string;
  monto: number;
  nota: string;
  estado: "pendiente" | "vista" | "cancelada";
  creadoEn: string;
}

const KEY_PERFIL = "multicatalogo_perfil_extra";
const KEY_SOLIC = "multicatalogo_solicitudes_liq";
const KEY_NOTIF_READ = "multicatalogo_notif_leidas";

export function getPerfilExtra(): PerfilExtra {
  try {
    const raw = localStorage.getItem(KEY_PERFIL);
    if (!raw)
      return { nombre: "", telefono: "", ciudad: "", direccion: "", whatsapp: "" };
    return { ...JSON.parse(raw) };
  } catch {
    return { nombre: "", telefono: "", ciudad: "", direccion: "", whatsapp: "" };
  }
}

export function savePerfilExtra(p: PerfilExtra): void {
  localStorage.setItem(KEY_PERFIL, JSON.stringify(p));
}

export function getSolicitudes(): SolicitudLiquidacion[] {
  try {
    const raw = localStorage.getItem(KEY_SOLIC);
    return raw ? (JSON.parse(raw) as SolicitudLiquidacion[]) : [];
  } catch {
    return [];
  }
}

export function addSolicitud(monto: number, nota: string): SolicitudLiquidacion {
  const list = getSolicitudes();
  const s: SolicitudLiquidacion = {
    id: String(Date.now()),
    monto,
    nota,
    estado: "pendiente",
    creadoEn: new Date().toISOString(),
  };
  localStorage.setItem(KEY_SOLIC, JSON.stringify([s, ...list]));
  return s;
}

export function getNotifLeidas(): string[] {
  try {
    const raw = localStorage.getItem(KEY_NOTIF_READ);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markNotifLeida(id: string): void {
  const set = new Set(getNotifLeidas());
  set.add(id);
  localStorage.setItem(KEY_NOTIF_READ, JSON.stringify([...set]));
}

export function markAllNotifLeidas(ids: string[]): void {
  const set = new Set([...getNotifLeidas(), ...ids]);
  localStorage.setItem(KEY_NOTIF_READ, JSON.stringify([...set]));
}
