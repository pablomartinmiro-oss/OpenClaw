# Configurar almacenamiento S3/R2 para uploads

## Recomendación: Cloudflare R2

- Sin costes de egress (transferencia de salida gratuita)
- API compatible con S3
- 10 GB/mes gratis en el plan gratuito
- Endpoint regional automático

## Pasos

### 1. Crear bucket en Cloudflare R2

1. Ir a [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2 Object Storage
2. Click "Create bucket"
3. Nombre: `openclaw-files` (o el que prefieras)
4. Región: automática

### 2. Crear API Token

1. R2 → Manage R2 API Tokens → Create API Token
2. Permisos: "Object Read & Write"
3. Scope: solo el bucket creado
4. Copiar Access Key ID y Secret Access Key

### 3. Configurar en Railway

En el dashboard de Railway → OpenClaw → Variables, añadir:

```
S3_BUCKET=openclaw-files
S3_REGION=auto
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<tu-access-key>
S3_SECRET_ACCESS_KEY=<tu-secret-key>
```

El `account-id` se encuentra en R2 → Overview → Account ID.

### 4. Verificar

Tras redeploy, el endpoint `GET /api/features/storage` debe retornar:

```json
{ "uploadEnabled": true }
```

El botón "Subir desde tu ordenador" en el Media Manager se activará automáticamente.

## Alternativas

### AWS S3

```
S3_BUCKET=openclaw-files
S3_REGION=eu-west-1
S3_ENDPOINT=  (dejar vacío para AWS)
S3_ACCESS_KEY_ID=<aws-key>
S3_SECRET_ACCESS_KEY=<aws-secret>
```

### MinIO (self-hosted)

```
S3_BUCKET=openclaw-files
S3_REGION=us-east-1
S3_ENDPOINT=https://minio.tu-servidor.com
S3_ACCESS_KEY_ID=<minio-key>
S3_SECRET_ACCESS_KEY=<minio-secret>
```

## Límites configurados

| Tipo | Tamaño máximo | Formatos |
|------|---------------|----------|
| Imágenes | 10 MB | jpeg, png, webp, gif |
| Documentos | 25 MB | pdf, xlsx |

Configurados en `src/app/api/upload/route.ts`.
