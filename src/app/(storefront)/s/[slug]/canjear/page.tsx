"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Platform {
  id: string;
  name: string;
  type: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  station: string;
  price: number;
}

const SKI_LEVELS = [
  { value: "A", label: "A — Nunca he esquiado o probe alguna vez" },
  { value: "B", label: "B — Cuna en pistas verdes" },
  { value: "C", label: "C — Paralelo basico en verdes/azules" },
  { value: "D", label: "D — Paralelo en todo tipo de pistas" },
];

export default function CanjearPage() {
  const { slug } = useParams<{ slug: string }>();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [step, setStep] = useState<"code" | "details" | "done">("code");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locator, setLocator] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [productId, setProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skiLevel, setSkiLevel] = useState("");
  const [bootSize, setBootSize] = useState("");
  const [numPeople, setNumPeople] = useState(1);
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/storefront/public/${slug}/platforms`).then((r) => r.json()),
      fetch(`/api/storefront/public/${slug}/products?limit=100`).then((r) =>
        r.json()
      ),
    ])
      .then(([pData, prData]) => {
        const list: Platform[] = pData.platforms ?? [];
        setPlatforms(list);
        if (list.length === 1) setPlatformId(list[0].id);
        setProducts(prData.products ?? []);
      })
      .catch(() => setPlatforms([]));
  }, [slug]);

  const onValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return setError("Introduce el código del cupón");
    if (!platformId) return setError("Selecciona la plataforma");
    setStep("details");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerName.trim()) return setError("Introduce tu nombre");
    if (!email.trim()) return setError("Introduce tu email");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/ticketing/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          platformId,
          code: code.trim().toUpperCase(),
          productId: productId || null,
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          skiLevel: skiLevel || null,
          bootSize: bootSize.trim() || null,
          numPeople,
          preferredDate: preferredDate || null,
          notes: notes.trim() || null,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo canjear el cupón");
        return;
      }
      setLocator(data.locator ?? null);
      setStep("done");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Canjear cupón
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Introduce el código de tu cupón o bono para reservar tu actividad.
        </p>
      </div>

      {step === "code" && (
        <form
          onSubmit={onValidate}
          className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-5"
        >
          <Field label="Código del cupón" required>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej. GR-12345"
              className={inputCls}
              maxLength={100}
              autoFocus
            />
          </Field>
          <Field label="Plataforma" required>
            <select
              value={platformId}
              onChange={(e) => setPlatformId(e.target.value)}
              className={inputCls}
            >
              <option value="">Selecciona una plataforma</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          {platforms.length === 0 && (
            <p className="text-xs text-gray-500">
              Esta tienda aún no tiene plataformas configuradas. Contacta con
              el centro.
            </p>
          )}
          {error && <ErrorMsg msg={error} />}
          <button type="submit" className={primaryBtn}>
            Continuar
          </button>
        </form>
      )}

      {step === "details" && (
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-5"
        >
          <div className="rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 text-sm text-gray-700">
            Código:{" "}
            <span className="font-mono font-semibold text-gray-900">
              {code.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre completo" required>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputCls}
                maxLength={200}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                maxLength={200}
              />
            </Field>
            <Field label="Teléfono">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
                maxLength={50}
              />
            </Field>
            <Field label="Número de personas" required>
              <input
                type="number"
                min={1}
                max={50}
                value={numPeople}
                onChange={(e) => setNumPeople(Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Fecha preferida">
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Producto (opcional)">
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className={inputCls}
              >
                <option value="">Sin asignar</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Nivel de esquí">
              <select
                value={skiLevel}
                onChange={(e) => setSkiLevel(e.target.value)}
                className={inputCls}
              >
                <option value="">No aplica</option>
                {SKI_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Talla de bota">
              <input
                value={bootSize}
                onChange={(e) => setBootSize(e.target.value)}
                placeholder="Ej. 42 EU"
                className={inputCls}
                maxLength={20}
              />
            </Field>
          </div>

          <Field label="Notas adicionales">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Honeypot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          {error && <ErrorMsg msg={error} />}

          <div className="flex flex-col sm:flex-row-reverse gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className={primaryBtn}
            >
              {submitting ? "Enviando..." : "Confirmar canje"}
            </button>
            <button
              type="button"
              onClick={() => setStep("code")}
              className={secondaryBtn}
            >
              Volver
            </button>
          </div>
        </form>
      )}

      {step === "done" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckIcon />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Canje recibido
          </h2>
          <p className="text-sm text-gray-500">
            Te contactaremos por email para confirmar la fecha y los detalles
            de tu reserva.
          </p>
          {locator && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Tu localizador</p>
              <p className="font-mono text-lg font-semibold text-gray-900">
                {locator}
              </p>
            </div>
          )}
          <Link
            href={`/s/${slug}`}
            className="inline-block text-sm font-medium text-[#E87B5A] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#E87B5A]/30 focus:border-[#E87B5A]";
const primaryBtn =
  "inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#E87B5A] rounded-lg hover:bg-[#D56E4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const secondaryBtn =
  "inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-[#C75D4A]">*</span>}
      </span>
      {children}
    </label>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
      {msg}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5B8C6D"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
