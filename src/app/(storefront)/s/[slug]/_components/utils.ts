const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function formatEUR(amount: number): string {
  return eurFormatter.format(amount);
}
