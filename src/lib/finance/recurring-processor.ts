import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Process all active recurring expenses for a tenant.
 * For each recurring expense where nextDueDate <= today:
 *   - Clone the template expense
 *   - Advance nextDueDate based on pattern
 * Returns the count of created expenses.
 */
export async function processRecurringExpenses(
  tenantId: string
): Promise<number> {
  const log = logger.child({ tenantId, fn: "processRecurringExpenses" });
  const now = new Date();

  // Find active recurring expenses that are due
  const dueRecurrences = await prisma.recurringExpense.findMany({
    where: {
      tenantId,
      active: true,
      nextDueDate: { lte: now },
    },
    include: {
      expense: true,
    },
  });

  if (dueRecurrences.length === 0) {
    log.info("No recurring expenses due");
    return 0;
  }

  let created = 0;

  for (const recurrence of dueRecurrences) {
    const template = recurrence.expense;

    try {
      await prisma.$transaction(async (tx) => {
        // Clone the template expense with the due date
        await tx.expense.create({
          data: {
            tenantId,
            date: recurrence.nextDueDate,
            categoryId: template.categoryId,
            costCenterId: template.costCenterId,
            concept: template.concept,
            amount: template.amount,
            paymentMethod: template.paymentMethod,
            status: "pending",
            supplierId: template.supplierId,
          },
        });

        // Advance nextDueDate based on pattern
        const next = new Date(recurrence.nextDueDate);
        switch (recurrence.pattern) {
          case "weekly":
            next.setDate(next.getDate() + 7);
            break;
          case "biweekly":
            next.setDate(next.getDate() + 14);
            break;
          case "monthly":
            next.setMonth(next.getMonth() + 1);
            break;
          default:
            next.setMonth(next.getMonth() + 1);
        }

        await tx.recurringExpense.update({
          where: { id: recurrence.id },
          data: { nextDueDate: next },
        });
      });

      created++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      log.error(
        { recurringId: recurrence.id, error: msg },
        "Failed to process recurring expense"
      );
    }
  }

  log.info({ created, total: dueRecurrences.length }, "Recurring expenses processed");
  return created;
}
