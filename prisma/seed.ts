import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = {
  "comms:view": "View conversations",
  "comms:send": "Send SMS messages",
  "comms:assign": "Assign/reassign conversations",
  "pipelines:view": "View pipelines and deals",
  "pipelines:edit": "Move deals, edit deal details",
  "pipelines:create": "Create new opportunities",
  "pipelines:delete": "Delete opportunities",
  "analytics:view": "View marketing analytics",
  "analytics:export": "Export analytics data",
  "contacts:view": "View contacts",
  "contacts:edit": "Edit contacts, add notes",
  "contacts:create": "Create new contacts",
  "contacts:delete": "Delete contacts",
  "settings:team": "Manage team members and roles",
  "settings:tenant": "Manage integrations and tenant config",
} as const;

const DEFAULT_ROLES: Record<string, string[]> = {
  "Owner / Manager": Object.keys(PERMISSIONS),
  "Sales Rep": [
    "comms:view",
    "comms:send",
    "pipelines:view",
    "pipelines:edit",
    "pipelines:create",
    "contacts:view",
  ],
  Marketing: ["analytics:view", "analytics:export", "contacts:view"],
  "VA / Admin": [
    "contacts:view",
    "contacts:edit",
    "contacts:create",
    "comms:view",
    "comms:send",
  ],
};

async function main() {
  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo",
      onboardingComplete: true,
    },
  });

  // Create default roles
  const roles = {
    owner: await prisma.role.upsert({
      where: { name_tenantId: { name: "Owner / Manager", tenantId: tenant.id } },
      update: {},
      create: {
        name: "Owner / Manager",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["Owner / Manager"],
      },
    }),
    sales: await prisma.role.upsert({
      where: { name_tenantId: { name: "Sales Rep", tenantId: tenant.id } },
      update: {},
      create: {
        name: "Sales Rep",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["Sales Rep"],
      },
    }),
    marketing: await prisma.role.upsert({
      where: { name_tenantId: { name: "Marketing", tenantId: tenant.id } },
      update: {},
      create: {
        name: "Marketing",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["Marketing"],
      },
    }),
    va: await prisma.role.upsert({
      where: { name_tenantId: { name: "VA / Admin", tenantId: tenant.id } },
      update: {},
      create: {
        name: "VA / Admin",
        tenantId: tenant.id,
        isSystem: true,
        permissions: DEFAULT_ROLES["VA / Admin"],
      },
    }),
  };

  // Create demo admin user
  await prisma.user.upsert({
    where: { email_tenantId: { email: "admin@demo.com", tenantId: tenant.id } },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Demo Admin",
      passwordHash: await hash("demo1234", 12),
      tenantId: tenant.id,
      roleId: roles.owner.id,
    },
  });

  // Create demo sales rep
  await prisma.user.upsert({
    where: { email_tenantId: { email: "sales@demo.com", tenantId: tenant.id } },
    update: {},
    create: {
      email: "sales@demo.com",
      name: "Demo Sales Rep",
      passwordHash: await hash("demo1234", 12),
      tenantId: tenant.id,
      roleId: roles.sales.id,
    },
  });

  // Enable all modules for demo tenant
  for (const mod of ["comms", "pipelines", "analytics", "contacts"]) {
    await prisma.moduleConfig.upsert({
      where: { tenantId_module: { tenantId: tenant.id, module: mod } },
      update: {},
      create: { tenantId: tenant.id, module: mod, isEnabled: true },
    });
  }

  console.log("Seed complete: demo tenant with admin + sales rep created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
