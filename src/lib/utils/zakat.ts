export function calculateZakat(totalWealth: number, nisabValue: number): number {
  if (totalWealth < nisabValue) return 0
  return totalWealth * 0.025
}

export function calculateNisabFromGold(
  goldPricePerGram: number,
  goldGrams = 85,
): number {
  return goldPricePerGram * goldGrams
}

export function calculateNisabFromSilver(
  silverPricePerGram: number,
  silverGrams = 595,
): number {
  return silverPricePerGram * silverGrams
}

export function calculateZakatAlFitr(
  members: number,
  amountPerPerson: number,
): number {
  return Math.max(1, members) * amountPerPerson
}

/** Approximate per-person fitr amounts. Currencies without an entry are hidden in UI. */
export const ZAKAT_AL_FITR_AMOUNTS: Record<string, number> = {
  USD: 15,
  EUR: 14,
  GBP: 12,
  SAR: 25,
  AED: 25,
  EGP: 50,
  PKR: 1500,
  MYR: 7,
  IDR: 45000,
  TRY: 130,
  INR: 350,
}
