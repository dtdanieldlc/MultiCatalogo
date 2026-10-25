// /materiales — kit de invitación / marketing del distribuidor
import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../services/http";
import { Alert, Icon, PageHeader, PageLoading } from "./ui";

interface RedMia {
  codigo: string;
  link: string;
}

const PLANTILLAS = [
  {
    id: "invita",
    titulo: "Invitación general",
    texto: (link: string, codigo: string) =>
      `¡Hola! Te invito a conocer DTLC MultiCatálogo 💄\nProductos de cosmética y la oportunidad de generar ingresos.\nRegístrate con mi código *${codigo}*:\n${link}`,
  },
  {
    id: "promo",
    titulo: "Promo de catálogo",
    texto: (link: string) =>
      `Mira el catálogo DTLC ✨\nCuidado de la piel, kits y más.\nEntra aquí: ${link}`,
  },
  {
    id: "equipo",
    titulo: "Únete a mi equipo",
    texto: (link: string, codigo: string) =>
      `Estoy armando mi equipo DTLC 🤝\nSi quieres emprender con cosméticos, regístrate con el código ${codigo}:\n${link}`,
  },
];

const Materiales = () => {
  const [codigo, setCodigo] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await apiFetch<RedMia>("/api/red/mia");
        if (cancel) return;
        const c = r.codigo ?? "";
        setCodigo(c);
        setLink(
          `${window.location.origin}/registro?ref=${encodeURIComponent(c)}`
        );
      } catch (e) {
        if (!cancel)
          setError(e instanceof ApiError ? e.message : "No se pudo cargar tu código");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const copiar = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiado(id);
      setTimeout(() => setCopiado(""), 2000);
    } catch {
      /* ignore */
    }
  };

  const whatsapp = (text: string) => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) return <PageLoading label="Cargando materiales…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Crecimiento"
        title="Materiales"
        subtitle="Comparte tu enlace y mensajes listos para WhatsApp"
      />

      {error && <Alert>{error}</Alert>}

      <section className="card p-6">
        <h2 className="font-display text-xl font-semibold">Tu enlace</h2>
        <p className="mt-1 text-sm text-ink-500">
          Código:{" "}
          <span className="font-mono font-semibold text-ink-800">{codigo || "—"}</span>
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input readOnly className="input flex-1 bg-sand text-sm" value={link} />
          <button
            type="button"
            className={`btn ${copiado === "link" ? "bg-leaf-600 text-white" : "btn-dark"}`}
            onClick={() => void copiar(link, "link")}
          >
            <Icon name={copiado === "link" ? "check" : "copy"} className="h-4 w-4" />
            {copiado === "link" ? "Copiado" : "Copiar"}
          </button>
        </div>
        {codigo && (
          <div className="mt-5 flex justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}`}
              alt="QR de registro"
              className="rounded-2xl border border-ink-100 bg-white p-3"
              width={180}
              height={180}
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Plantillas</h2>
        {PLANTILLAS.map((p) => {
          const body = p.texto(link, codigo);
          return (
            <div key={p.id} className="card p-5">
              <h3 className="font-semibold text-ink-900">{p.titulo}</h3>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-sand/80 p-3 text-sm text-ink-700">
                {body}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-dark"
                  onClick={() => void copiar(body, p.id)}
                >
                  <Icon
                    name={copiado === p.id ? "check" : "copy"}
                    className="h-4 w-4"
                  />
                  {copiado === p.id ? "Copiado" : "Copiar texto"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => whatsapp(body)}
                >
                  WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Materiales;
