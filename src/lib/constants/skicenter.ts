// Skicenter reference data — age brackets and skill levels

export const AGE_BRACKETS = {
  baby: { label: "Baby", minAge: 0, maxAge: 5 },
  infantil: { label: "Infantil", minAge: 6, maxAge: 11 },
  adolescente: { label: "Adolescente", minAge: 11, maxAge: 15 },
  adulto: { label: "Adulto", minAge: 16, maxAge: null },
} as const;

export const SKILL_LEVELS = {
  esqui: [
    { level: "A", description: "Nunca he esquiado, he probado alguna vez de forma ocasional" },
    { level: "B", description: "Hago giros de cuña o empiezo la curva en cuña y termino en paralelo en pistas verdes" },
    { level: "C", description: "Giro en paralelo básico en pistas verdes y azules, combino velocidad y enlace de curvas" },
    { level: "D", description: "Esquí en paralelo en todo tipo de pistas, combino velocidades y diferentes tipos de nieve" },
  ],
  snow: [
    { level: "A", description: "Iniciación al deporte, adaptación al material y movimientos básicos" },
    { level: "B", description: "Derrapaje en talones y puntas, inicio al giro y primera toma de contacto con remontes" },
    { level: "C", description: "Giros derrapados, desplazamiento por la estación e inicio a pistas azules" },
    { level: "D", description: "Perfeccionamiento de la conducción, inicio al freestyle y fuera de pista" },
  ],
} as const;

export type PersonType = keyof typeof AGE_BRACKETS;
export type SkillDiscipline = keyof typeof SKILL_LEVELS;
