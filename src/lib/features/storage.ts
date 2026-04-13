/**
 * Check if S3/R2 storage is configured for file uploads.
 * Returns false if any required env var is missing — media upload
 * UI should show "coming soon" state when this returns false.
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.S3_BUCKET &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  );
}
