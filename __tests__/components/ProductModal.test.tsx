import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductModal } from "@/app/(dashboard)/catalogo/_components/ProductModal";
import type { Product } from "@/hooks/useProducts";

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "prod-1",
  tenantId: "tenant-1",
  category: "forfait",
  name: "Forfait Baqueira",
  station: "baqueira",
  description: null,
  personType: "adulto",
  tier: null,
  includesHelmet: false,
  priceType: "per_day",
  price: 74,
  pricingMatrix: null,
  isActive: true,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  slug: null,
  fiscalRegime: "general",
  productType: null,
  providerPercent: null,
  agencyMarginPercent: null,
  supplierCommissionPercent: null,
  supplierCostType: null,
  settlementFrequency: null,
  isSettlable: false,
  isFeatured: false,
  isPublished: true,
  isPresentialSale: false,
  discountPercent: null,
  discountExpiresAt: null,
  coverImageUrl: null,
  images: [],
  includes: null,
  excludes: null,
  metaTitle: null,
  metaDescription: null,
  difficulty: null,
  ...overrides,
});

const renderModal = (props: Partial<Parameters<typeof ProductModal>[0]> = {}) => {
  const onSave = vi.fn();
  const onClose = vi.fn();
  const result = render(
    <ProductModal isOpen={true} product={null} onSave={onSave} onClose={onClose} {...props} />
  );
  return { ...result, onSave, onClose };
};

describe("ProductModal — DOM behavior", () => {
  // ═══ TEST 1: Auto-slug in CREATE mode ═══
  it("auto-genera slug desde name en modo crear", async () => {
    const user = userEvent.setup();
    renderModal();
    const nameInput = screen.getByLabelText(/nombre/i);
    const slugInput = screen.getByLabelText(/slug/i);
    await user.type(nameInput, "Forfait Baqueira 3 días");
    expect(slugInput).toHaveValue("forfait-baqueira-3-dias");
  });

  // ═══ TEST 2: NO auto-slug in EDIT mode ═══
  it("no auto-genera slug en modo editar", async () => {
    const user = userEvent.setup();
    renderModal({ product: makeProduct({ slug: "original-slug" }) });
    const nameInput = screen.getByLabelText(/nombre/i);
    const slugInput = screen.getByLabelText(/slug/i);
    expect(slugInput).toHaveValue("original-slug");
    await user.clear(nameInput);
    await user.type(nameInput, "Nuevo Nombre");
    expect(slugInput).toHaveValue("original-slug");
  });

  // ═══ TEST 3: Manual edit breaks auto-gen ═══
  it("edición manual del slug detiene auto-generación", async () => {
    const user = userEvent.setup();
    renderModal();
    const nameInput = screen.getByLabelText(/nombre/i);
    const slugInput = screen.getByLabelText(/slug/i);
    await user.type(nameInput, "Primer nombre");
    expect(slugInput).toHaveValue("primer-nombre");
    await user.clear(slugInput);
    await user.type(slugInput, "custom-slug");
    await user.clear(nameInput);
    await user.type(nameInput, "Segundo nombre");
    expect(slugInput).toHaveValue("custom-slug");
  });

  // ═══ TEST 4: Invalid slug shows error ═══
  it("slug inválido muestra mensaje de error", async () => {
    const user = userEvent.setup();
    renderModal();
    const slugInput = screen.getByLabelText(/slug/i);
    await user.type(slugInput, "Con Espacios");
    expect(screen.getByText(/solo minúsculas, números y guiones/i)).toBeInTheDocument();
  });

  // ═══ TEST 5: Section with data auto-opens ═══
  it("sección Imágenes y SEO arranca abierta si metaTitle tiene valor", () => {
    renderModal({ product: makeProduct({ metaTitle: "Título SEO" }) });
    const summary = screen.getByText(/imágenes y seo/i);
    const detailsEl = summary.closest("details");
    expect(detailsEl).not.toBeNull();
    // <details open> or <details open=""> both indicate open state
    expect(detailsEl!.hasAttribute("open")).toBe(true);
  });

  // ═══ TEST 6: Empty sections start closed ═══
  it("todas las secciones cerradas en crear nuevo", () => {
    renderModal();
    const sectionTitles = [
      /publicación y visibilidad/i,
      /fiscal y proveedor/i,
      /descuentos/i,
      /imágenes y seo/i,
    ];
    for (const titleRegex of sectionTitles) {
      const summaries = screen.getAllByText(titleRegex);
      const details = summaries[0].closest("details");
      expect(details).not.toBeNull();
      expect(details!.hasAttribute("open")).toBe(false);
    }
  });

  // ═══ TEST 7: Submit includes new fields ═══
  it("submit incluye campos nuevos tipados correctamente", async () => {
    const user = userEvent.setup();
    const { onSave } = renderModal();
    await user.type(screen.getByLabelText(/nombre/i), "Test Product");
    // Fill required price field
    const priceInput = screen.getByLabelText(/precio base/i) as HTMLInputElement;
    await user.clear(priceInput);
    await user.type(priceInput, "50");
    // Open publication section and toggle featured
    const pubSummary = screen.getByText(/publicación y visibilidad/i);
    await user.click(pubSummary);
    const pubDetails = pubSummary.closest("details")!;
    const featuredCheckbox = within(pubDetails).getByLabelText(/destacado/i);
    await user.click(featuredCheckbox);
    // Submit
    await user.click(screen.getByRole("button", { name: /crear producto/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.name).toBe("Test Product");
    expect(payload.slug).toBe("test-product");
    expect(payload.isFeatured).toBe(true);
    expect(payload.isPublished).toBe(true);
    expect(payload.fiscalRegime).toBe("general");
  });

  // ═══ TEST 8: EditableList add/remove ═══
  it("añade y elimina items de galería de imágenes", async () => {
    const user = userEvent.setup();
    const { onSave } = renderModal();
    await user.type(screen.getByLabelText(/nombre/i), "X");
    // Fill required price
    const priceInput = screen.getByLabelText(/precio base/i) as HTMLInputElement;
    await user.clear(priceInput);
    await user.type(priceInput, "10");
    // Open SEO section
    const seoSummary = screen.getByText(/imágenes y seo/i);
    await user.click(seoSummary);
    const seoDetails = seoSummary.closest("details")!;
    // Add 2 gallery images
    const addBtn = within(seoDetails).getByText(/añadir imagen/i);
    await user.click(addBtn);
    await user.click(addBtn);
    // Gallery URL inputs (exclude coverImageUrl which also has placeholder "https://...")
    const allUrlInputs = within(seoDetails).getAllByPlaceholderText("https://...");
    // First is cover, rest are gallery
    const galleryInputs = allUrlInputs.slice(1);
    expect(galleryInputs).toHaveLength(2);
    await user.type(galleryInputs[0], "https://a.com/1.jpg");
    await user.type(galleryInputs[1], "https://a.com/2.jpg");
    // Remove the first gallery item
    const removeButtons = within(seoDetails).getAllByLabelText(/eliminar item/i);
    await user.click(removeButtons[0]);
    // Submit
    await user.click(screen.getByRole("button", { name: /crear producto/i }));
    const payload = onSave.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.images).toEqual(["https://a.com/2.jpg"]);
  });
});
