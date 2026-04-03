#!/bin/bash
# DEAD CODE REMOVAL — Run after committing security fixes
# These files are from Sensa Padel and Chief of Staff — not related to SKIINET

echo "=== Removing dead route directories ==="
rm -rf src/app/sensa-padel/
rm -rf src/app/padel-club-madrid/
rm -rf src/app/chief-of-staff/
rm -rf src/app/command/
rm -rf src/app/api/sensa/
rm -rf src/app/api/chief/
rm -rf src/app/api/brain/
rm -rf src/app/api/agents/
rm -rf src/app/api/integrations/

echo "=== Removing dead lib directories ==="
rm -rf src/lib/agents/
rm -rf src/lib/provisioner/
rm -rf src/lib/templates/

echo "=== Removing dead proxy.ts (replaced by middleware.ts) ==="
rm -f src/proxy.ts

echo "=== Removing CSV imports with customer data ==="
rm -rf csv-imports/

echo "=== Removing sensitive docs ==="
rm -f AUDIT-2026-03-23.md
rm -f AUDIT.md

echo "=== Done! Now manually remove these Prisma models from schema.prisma: ==="
echo "  - SensaMember"
echo "  - SensaRevenue"
echo "  - SensaSession"
echo "  - SensaLead"
echo "  - Integration"
echo "  - InboxItem"
echo "  - ChiefTask"
echo ""
echo "Then run: npx prisma generate && npx prisma migrate dev --name remove-dead-models"
