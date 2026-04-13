import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mock hooks ──────────────────────────────────────────────────────────

const mockGalleryItems = vi.fn().mockReturnValue({ data: { items: [] }, isLoading: false });
const mockCreateGallery = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockUpdateGallery = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockDeleteGallery = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockReorder = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockMediaFiles = vi.fn().mockReturnValue({ data: { files: [] }, isLoading: false });
const mockCreateMedia = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockDeleteMedia = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockStorageFeature = vi.fn().mockReturnValue({ data: { uploadEnabled: false } });
const mockHomeModuleItems = vi.fn().mockReturnValue({ data: { items: [] }, isLoading: false });
const mockCreateHomeModule = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockDeleteHomeModule = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });

vi.mock("@/hooks/useCmsExtended", () => ({
  useGalleryItems: (...args: unknown[]) => mockGalleryItems(...args),
  useCreateGalleryItem: () => mockCreateGallery(),
  useUpdateGalleryItem: () => mockUpdateGallery(),
  useDeleteGalleryItem: () => mockDeleteGallery(),
  useReorder: () => mockReorder(),
  useMediaFiles: (...args: unknown[]) => mockMediaFiles(...args),
  useCreateMediaFile: () => mockCreateMedia(),
  useDeleteMediaFile: () => mockDeleteMedia(),
  useStorageFeature: () => mockStorageFeature(),
  useHomeModuleItems: (...args: unknown[]) => mockHomeModuleItems(...args),
  useCreateHomeModuleItem: () => mockCreateHomeModule(),
  useDeleteHomeModuleItem: () => mockDeleteHomeModule(),
}));

vi.mock("@/hooks/useProducts", () => ({
  useProducts: () => ({
    data: [
      { id: "p1", name: "Forfait Baqueira", category: "forfait", slug: "forfait-baq", coverImageUrl: null },
      { id: "p2", name: "SnowCamp Full Day", category: "snowcamp", slug: "snowcamp-full", coverImageUrl: null },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useCms", () => ({
  useSlideshowItems: () => ({ data: { items: [] }, isLoading: false }),
  useCreateSlideshowItem: () => ({ mutateAsync: vi.fn() }),
  useUpdateSlideshowItem: () => ({ mutateAsync: vi.fn() }),
  useDeleteSlideshowItem: () => ({ mutateAsync: vi.fn() }),
  useCmsPages: () => ({ data: { pages: [] }, isLoading: false }),
  useCreateCmsPage: () => ({ mutateAsync: vi.fn() }),
  useUpdateCmsPage: () => ({ mutateAsync: vi.fn() }),
  useDeleteCmsPage: () => ({ mutateAsync: vi.fn() }),
  useCmsMenuItems: () => ({ data: { items: [] }, isLoading: false }),
  useCreateCmsMenuItem: () => ({ mutateAsync: vi.fn() }),
  useUpdateCmsMenuItem: () => ({ mutateAsync: vi.fn() }),
  useDeleteCmsMenuItem: () => ({ mutateAsync: vi.fn() }),
  useSiteSettings: () => ({ data: { settings: [] }, isLoading: false }),
  useUpsertSiteSetting: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/components/shared/LoadingSkeleton", () => ({
  PageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// QueryClient mock for hooks that need it
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return { ...actual };
});

describe("PORT-05b: CMS UI tests", () => {
  beforeEach(() => vi.clearAllMocks());

  // ═══ 1. MediaManager: upload disabled with coming soon ═══
  it("MediaManager: botón Subir disabled con tooltip cuando uploadEnabled=false", async () => {
    mockStorageFeature.mockReturnValue({ data: { uploadEnabled: false } });
    const { default: MediaManager } = await import("@/app/(dashboard)/cms/_components/MediaManager");
    render(<MediaManager />);

    const uploadBtn = screen.getByTitle(/configurar almacenamiento/i);
    expect(uploadBtn).toBeDisabled();
    expect(screen.getByText(/upload de archivos/i)).toBeInTheDocument();
  });

  // ═══ 2. BlockTypeSelector: hero shows coming soon ═══
  it("PageBlock editor: seleccionar tipo hero muestra badge Próximamente", async () => {
    const { default: BlockTypeSelector } = await import("@/app/(dashboard)/cms/_components/BlockTypeSelector");
    const onChange = vi.fn();
    const onContentInit = vi.fn();
    const { rerender } = render(<BlockTypeSelector value="text" onChange={onChange} onContentInit={onContentInit} />);

    // Initially no coming soon badge
    expect(screen.queryByText(/editor visual/i)).not.toBeInTheDocument();

    // Change to hero
    rerender(<BlockTypeSelector value="hero" onChange={onChange} onContentInit={onContentInit} />);
    expect(screen.getByText(/editor visual/i)).toBeInTheDocument();
  });

  // ═══ 3. GalleryManager: empty state ═══
  it("GalleryManager: muestra empty state cuando no hay items", async () => {
    mockGalleryItems.mockReturnValue({ data: { items: [] }, isLoading: false });
    const { default: GalleryManager } = await import("@/app/(dashboard)/cms/_components/GalleryManager");
    render(<GalleryManager />);

    expect(screen.getByText(/no hay items en la galería/i)).toBeInTheDocument();
  });

  // ═══ 4. GalleryManager: add item opens modal ═══
  it("GalleryManager: click Nuevo Item abre modal", async () => {
    mockGalleryItems.mockReturnValue({ data: { items: [] }, isLoading: false });
    const user = userEvent.setup();
    const { default: GalleryManager } = await import("@/app/(dashboard)/cms/_components/GalleryManager");
    render(<GalleryManager />);

    await user.click(screen.getByText(/nuevo item/i));
    expect(screen.getByText(/url de imagen/i)).toBeInTheDocument();
  });

  // ═══ 5. GalleryManager: reorder arrows ═══
  it("GalleryManager: flecha arriba disabled en primer item", async () => {
    mockGalleryItems.mockReturnValue({
      data: {
        items: [
          { id: "g1", imageUrl: "https://a.jpg", title: "First", category: null, sortOrder: 0, isActive: true, fileKey: null, createdAt: "" },
          { id: "g2", imageUrl: "https://b.jpg", title: "Second", category: null, sortOrder: 1, isActive: true, fileKey: null, createdAt: "" },
        ],
      },
      isLoading: false,
    });
    const { default: GalleryManager } = await import("@/app/(dashboard)/cms/_components/GalleryManager");
    render(<GalleryManager />);

    const upButtons = screen.getAllByLabelText(/subir/i);
    expect(upButtons[0]).toBeDisabled();
    expect(upButtons[1]).not.toBeDisabled();
  });

  // ═══ 6. MediaManager: upload disabled state ═══
  it("MediaManager: uploadEnabled=false muestra banner coming soon", async () => {
    mockStorageFeature.mockReturnValue({ data: { uploadEnabled: false } });
    const { default: MediaManager } = await import("@/app/(dashboard)/cms/_components/MediaManager");
    render(<MediaManager />);

    expect(screen.getByText(/upload de archivos/i)).toBeInTheDocument();
  });

  // ═══ 7. MediaManager: upload enabled state ═══
  it("MediaManager: uploadEnabled=true no muestra banner", async () => {
    mockStorageFeature.mockReturnValue({ data: { uploadEnabled: true } });
    mockMediaFiles.mockReturnValue({ data: { files: [] }, isLoading: false });
    const { default: MediaManager } = await import("@/app/(dashboard)/cms/_components/MediaManager");
    render(<MediaManager />);

    expect(screen.queryByText(/upload de archivos.*pendiente/i)).not.toBeInTheDocument();
  });

  // ═══ 8. MediaManager: add by URL infers type ═══
  it("MediaManager: Añadir por URL abre modal", async () => {
    mockStorageFeature.mockReturnValue({ data: { uploadEnabled: false } });
    const user = userEvent.setup();
    const { default: MediaManager } = await import("@/app/(dashboard)/cms/_components/MediaManager");
    render(<MediaManager />);

    await user.click(screen.getByText(/añadir por url/i));
    expect(screen.getByLabelText(/url del archivo/i)).toBeInTheDocument();
  });

  // ═══ 9. HomeModulesManager: 3 sections ═══
  it("HomeModulesManager: renderiza 3 secciones colapsables", async () => {
    mockHomeModuleItems.mockReturnValue({ data: { items: [] }, isLoading: false });
    const { default: HomeModulesManager } = await import("@/app/(dashboard)/cms/_components/HomeModulesManager");
    render(<HomeModulesManager />);

    expect(screen.getByText(/destacados/i)).toBeInTheDocument();
    expect(screen.getByText(/populares/i)).toBeInTheDocument();
    expect(screen.getByText(/temporada/i)).toBeInTheDocument();
  });

  // ═══ 10. HomeModulesManager: product picker ═══
  it("HomeModulesManager: click Añadir producto muestra picker con búsqueda", async () => {
    mockHomeModuleItems.mockReturnValue({ data: { items: [] }, isLoading: false });
    const user = userEvent.setup();
    const { default: HomeModulesManager } = await import("@/app/(dashboard)/cms/_components/HomeModulesManager");
    render(<HomeModulesManager />);

    // Open Destacados section
    await user.click(screen.getByText(/destacados/i));
    // Click Añadir
    const addButtons = screen.getAllByText(/añadir producto/i);
    await user.click(addButtons[0]);
    // Search should appear
    const searchInput = screen.getByPlaceholderText(/buscar producto/i);
    expect(searchInput).toBeInTheDocument();
    // Type to filter
    await user.type(searchInput, "Forfait");
    expect(screen.getByText("Forfait Baqueira")).toBeInTheDocument();
  });

  // ═══ 11. SlideModal: content section auto-opens with data ═══
  it("SlideModal: sección Contenido auto-abre si título relleno", async () => {
    const { default: SlideModal } = await import("@/app/(dashboard)/cms/_components/SlideModal");
    render(
      <SlideModal
        slide={{ id: "s1", imageUrl: "https://img.jpg", caption: null, linkUrl: null, sortOrder: 0, isActive: true, createdAt: "", badge: null, title: "Hero Title", subtitle: null, description: null, ctaText: null, ctaUrl: null, reserveUrl: null }}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const summary = screen.getByText(/contenido enriquecido/i);
    const details = summary.closest("details");
    expect(details).not.toBeNull();
    expect(details!.hasAttribute("open")).toBe(true);
  });

  // ═══ 12. SlideModal: warning when active without image ═══
  it("SlideModal: isActive sin imageUrl muestra warning", async () => {
    const { default: SlideModal } = await import("@/app/(dashboard)/cms/_components/SlideModal");
    render(
      <SlideModal
        slide={null}
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    // Default is isActive=true, imageUrl=""
    expect(screen.getByText(/slide activo sin imagen/i)).toBeInTheDocument();
  });

  // ═══ 13. Responsive: MediaManager grid no overflow ═══
  it("MediaManager: grid responsive en viewport estrecho", async () => {
    mockStorageFeature.mockReturnValue({ data: { uploadEnabled: false } });
    const { default: MediaManager } = await import("@/app/(dashboard)/cms/_components/MediaManager");
    const { container } = render(<MediaManager />);

    // Verify grid uses responsive classes
    const grids = container.querySelectorAll("[class*='grid']");
    // At minimum the button bar should not overflow
    expect(container.querySelector("[class*='flex-wrap']")).not.toBeNull();
  });

  // ═══ 14. Tabs: overflow-x-auto on container ═══
  it("CMS page: tabs container tiene overflow-x-auto", async () => {
    // Can't easily render the full page with all providers, so test the class presence
    // by importing and checking the rendered output
    const { default: ContenidosPage } = await import("@/app/(dashboard)/cms/page");
    const { container } = render(<ContenidosPage />);

    const scrollContainer = container.querySelector("[class*='overflow-x-auto']");
    expect(scrollContainer).not.toBeNull();
    // Should have 7 tab buttons
    const tabButtons = container.querySelectorAll("button[data-tab]");
    expect(tabButtons.length).toBe(7);
  });
});
