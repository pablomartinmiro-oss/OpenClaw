/**
 * DIN Setting Calculator based on ISO 11088 standard.
 * Pure function — no database access.
 *
 * The DIN (Deutsches Institut fuer Normung) setting determines the release
 * force of ski bindings. Too low = bindings release during normal skiing;
 * too high = bindings don't release during a fall, risking injury.
 */

export interface DinInput {
  weight: number; // kg
  height: number; // cm
  bootSoleLength: number; // mm
  age: number;
  abilityLevel: "beginner" | "intermediate" | "advanced" | "expert";
}

// Skier type: 1 = cautious beginner, 2 = moderate, 3 = fast/aggressive
function getSkierType(
  abilityLevel: DinInput["abilityLevel"],
  age: number
): number {
  const base =
    abilityLevel === "beginner"
      ? 1
      : abilityLevel === "intermediate"
        ? 2
        : 3; // advanced & expert

  // Skiers over 50 or under 10 get type reduced by 1 (more cautious)
  if ((age >= 50 || age < 10) && base > 1) return base - 1;
  return base;
}

// ISO 11088 skier code from weight/height brackets
// Returns a code 0-13 used to look up DIN in the table
function getSkierCode(weight: number, height: number): number {
  // Weight/height brackets per ISO 11088
  const brackets: { maxWeight: number; maxHeight: number }[] = [
    { maxWeight: 13, maxHeight: 100 }, // code 0 (children)
    { maxWeight: 17, maxHeight: 108 }, // code 1
    { maxWeight: 21, maxHeight: 115 }, // code 2
    { maxWeight: 25, maxHeight: 122 }, // code 3
    { maxWeight: 30, maxHeight: 130 }, // code 4
    { maxWeight: 35, maxHeight: 137 }, // code 5
    { maxWeight: 42, maxHeight: 145 }, // code 6
    { maxWeight: 48, maxHeight: 152 }, // code 7
    { maxWeight: 57, maxHeight: 160 }, // code 8
    { maxWeight: 66, maxHeight: 168 }, // code 9
    { maxWeight: 78, maxHeight: 178 }, // code 10
    { maxWeight: 91, maxHeight: 188 }, // code 11
    { maxWeight: 107, maxHeight: 200 }, // code 12
    { maxWeight: Infinity, maxHeight: Infinity }, // code 13
  ];

  for (let i = 0; i < brackets.length; i++) {
    if (
      weight <= brackets[i].maxWeight ||
      height <= brackets[i].maxHeight
    ) {
      return i;
    }
  }
  return 13;
}

// DIN lookup table: [skierCode][skierType - 1]
// Each row = skier code (0-13), columns = type 1, type 2, type 3
const DIN_TABLE: (number | null)[][] = [
  [0.75, 0.75, null], // code 0
  [0.75, 1.0, null], // code 1
  [1.0, 1.25, 1.5], // code 2
  [1.25, 1.5, 1.75], // code 3
  [1.5, 1.75, 2.25], // code 4
  [1.75, 2.25, 2.75], // code 5
  [2.25, 2.75, 3.5], // code 6
  [2.75, 3.5, 4.5], // code 7
  [3.5, 4.5, 5.5], // code 8
  [4.5, 5.5, 6.5], // code 9
  [5.5, 6.5, 7.5], // code 10
  [6.5, 7.5, 8.5], // code 11
  [7.5, 8.5, 10.0], // code 12
  [8.5, 10.0, 12.0], // code 13
];

// Boot sole length correction factors
// If boot is shorter/longer than reference, adjust DIN
function getSoleLengthAdjustment(
  bootSoleLength: number,
  skierCode: number
): number {
  // Reference sole lengths per skier code bracket (mm)
  const refLengths: Record<number, number> = {
    0: 200, 1: 215, 2: 230, 3: 245, 4: 255,
    5: 265, 6: 275, 7: 285, 8: 295, 9: 310,
    10: 320, 11: 330, 12: 340, 13: 350,
  };

  const ref = refLengths[skierCode] ?? 310;
  const diff = bootSoleLength - ref;

  // Adjust by ~0.5 DIN per 10mm deviation
  if (Math.abs(diff) < 10) return 0;
  return diff > 0 ? 0.5 : -0.5;
}

/**
 * Calculate recommended DIN setting per ISO 11088.
 * Returns a standard DIN value (0.75 - 12).
 */
export function calculateDin(input: DinInput): number {
  const { weight, height, bootSoleLength, age, abilityLevel } = input;

  const skierType = getSkierType(abilityLevel, age);
  const skierCode = getSkierCode(weight, height);

  const baseDin = DIN_TABLE[skierCode]?.[skierType - 1];

  // If null (e.g., code 0-1 with type 3), fall back to highest available
  const effectiveDin =
    baseDin ??
    DIN_TABLE[skierCode]?.filter((v): v is number => v !== null).pop() ??
    3.0;

  const adjustment = getSoleLengthAdjustment(bootSoleLength, skierCode);
  const finalDin = effectiveDin + adjustment;

  // Clamp to valid DIN range
  const validDinValues = [
    0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.5, 4.0,
    4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 10.0, 11.0, 12.0,
  ];

  // Find nearest valid DIN value
  let closest = validDinValues[0];
  let minDiff = Math.abs(finalDin - closest);
  for (const v of validDinValues) {
    const d = Math.abs(finalDin - v);
    if (d < minDiff) {
      minDiff = d;
      closest = v;
    }
  }

  return closest;
}
