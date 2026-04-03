import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

const log = logger.child({ layer: "storage" });

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (s3Client) return s3Client;

  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !accessKeyId || !secretAccessKey) {
    log.warn("S3 not configured — file uploads disabled");
    return null;
  }

  s3Client = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true, // Required for R2/MinIO
  });

  return s3Client;
}

function getBucket(): string {
  return process.env.S3_BUCKET || "openclaw-files";
}

/**
 * Upload a file to S3/R2.
 * Key format: {tenantId}/{module}/{entityId}/{uuid}-{filename}
 */
export async function uploadFile(
  tenantId: string,
  module: string,
  entityId: string,
  file: Buffer,
  filename: string,
  contentType: string = "application/octet-stream"
): Promise<{ key: string; url: string } | null> {
  const client = getS3Client();
  if (!client) return null;

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${tenantId}/${module}/${entityId}/${randomUUID()}-${safeName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  const endpoint = process.env.S3_ENDPOINT || "";
  const url = `${endpoint}/${getBucket()}/${key}`;

  log.info({ key, tenantId, module }, "File uploaded");
  return { key, url };
}

/**
 * Delete a file from S3/R2.
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();
  if (!client) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );

  log.info({ key }, "File deleted");
}

/**
 * Generate a pre-signed URL for temporary access.
 */
export async function getSignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const client = getS3Client();
  if (!client) return null;

  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  return awsGetSignedUrl(client, command, { expiresIn });
}
