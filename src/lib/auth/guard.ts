import { auth } from "@/lib/auth/config";
import { unauthorized } from "@/lib/api-response";
import { NextResponse } from "next/server";

/**
 * Extract authenticated session with tenantId.
 * Returns the session data or a 401 response.
 *
 * Usage in API routes:
 * ```ts
 * const [session, errorResponse] = await requireTenant();
 * if (errorResponse) return errorResponse;
 * const { tenantId, userId, roleName } = session;
 * ```
 */
export async function requireTenant(): Promise<
  | [
      {
        tenantId: string;
        userId: string;
        email: string;
        roleName: string;
        isDemo: boolean;
      },
      null,
    ]
  | [null, NextResponse]
> {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return [null, unauthorized()];
  }

  return [
    {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      email: session.user.email,
      roleName: session.user.roleName,
      isDemo: session.user.isDemo,
    },
    null,
  ];
}

/**
 * Require authenticated session with owner role.
 */
export async function requireOwner(): Promise<
  | [{ tenantId: string; userId: string }, null]
  | [null, NextResponse]
> {
  const [session, error] = await requireTenant();
  if (error) return [null, error];

  if (!session.roleName.toLowerCase().startsWith("owner")) {
    return [
      null,
      NextResponse.json({ error: "Owner access required" }, { status: 403 }),
    ];
  }

  return [session, null];
}
