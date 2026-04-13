# Changelog

## [Unreleased]

### Added
- CMS UI: 3 nuevos tabs (Galería, Media, Home Modules) con gestión completa desde el dashboard.
- Galería: grid de cards con reorder por flechas, filtro por categoría, modal CRUD.
- Media Library: registro de archivos por URL con auto-inferencia de tipo. Botón "Subir" con feature flag S3 (ComingSoonBadge si no configurado).
- Home Modules: 3 secciones colapsables (Destacados/Populares/Temporada) con selector de productos y búsqueda.
- Slideshow enriquecido: sección colapsable "Contenido" con badge, título, subtítulo, descripción, CTA y URL de reserva.
- PageBlock: selector de tipo ampliado con hero/cta/faq (ComingSoonBadge para editor visual, JSON textarea por ahora).
- StorageCard en Ajustes: estado S3 con link a guía de configuración.
- ComingSoonBadge: componente reutilizable con 3 variantes (inline/banner/tooltip).
- ImagePlaceholder: componente para fallback visual en imágenes no cargadas.
- CollapsibleSection y EditableList movidos a src/components/shared/ para reutilización cross-módulo.
- CMS enriquecido: galería pública con categorías, media library (URL manual + feature flag para S3 upload), módulos de homepage (destacados/populares/temporada), slideshow con badge/título/subtítulo/CTA/reserva.
- Endpoints públicos preparados para storefront: galería y slideshow (solo items activos, scoped por tenant).
- Block types avanzados: hero, CTA y FAQ con schemas Zod tipados para el editor de páginas.
- Feature flag isS3Configured: detecta automáticamente si el almacenamiento está configurado.
- Documentación: guía paso a paso para configurar Cloudflare R2/S3 (docs/SETUP-S3.md).
- Modal de producto ampliado con 4 secciones colapsables para los 21 campos nuevos de catálogo (publicación y visibilidad, fiscal y proveedor, descuentos, imágenes y SEO).
- Auto-generación de slug desde el nombre en productos nuevos. En productos existentes el slug se preserva intacto.
- Infraestructura de tests DOM: vitest projects API con entornos separados node/jsdom, testing-library, user-event.
- Catálogo enriquecido: productos ahora soportan slug público, régimen fiscal, márgenes de proveedor, flags de publicación, galería de imágenes, SEO y dificultad. Endpoints nuevos: clone de producto y lookup público por slug (PR #23).

### Fixed
- Accesibilidad: pares htmlFor/id en inputs de nombre, slug, precio.
