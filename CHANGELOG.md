# Changelog

## [Unreleased]

### Added
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
