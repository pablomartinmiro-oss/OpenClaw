export type TpvTabKey =
  | "alquiler"
  | "forfait"
  | "clases"
  | "comida"
  | "otros";

export const TPV_CATEGORIES: Record<
  TpvTabKey,
  { label: string; categories: string[] }
> = {
  alquiler: { label: "Alquiler", categories: ["alquiler", "locker"] },
  forfait: { label: "Forfait", categories: ["forfait"] },
  clases: {
    label: "Clases",
    categories: ["escuela", "clase_particular", "snowcamp"],
  },
  comida: { label: "Comida", categories: ["menu", "apreski"] },
  otros: { label: "Otros", categories: ["taxi", "pack"] },
};

export const TPV_TABS: TpvTabKey[] = [
  "alquiler",
  "forfait",
  "clases",
  "comida",
  "otros",
];
