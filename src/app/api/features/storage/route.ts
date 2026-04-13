export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { isS3Configured } from "@/lib/features/storage";

export async function GET() {
  return NextResponse.json({ uploadEnabled: isS3Configured() });
}
