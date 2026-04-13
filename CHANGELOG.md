# Changelog

## [Unreleased]

### Added
- Modal de producto ampliado con 4 secciones colapsables para los 21 campos nuevos de catálogo (publicación y visibilidad, fiscal y proveedor, descuentos, imágenes y SEO).
- Auto-generación de slug desde el nombre en productos nuevos. En productos existentes el slug se preserva intacto.
- Infraestructura de tests DOM: vitest projects API con entornos separados node/jsdom, testing-library, user-event.
- Catálogo enriquecido: productos ahora soportan slug público, régimen fiscal, márgenes de proveedor, flags de publicación, galería de imágenes, SEO y dificultad. Endpoints nuevos: clone de producto y lookup público por slug (PR #23).

### Fixed
- Accesibilidad: pares htmlFor/id en inputs de nombre, slug, precio.
