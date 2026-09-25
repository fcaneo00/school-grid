export const HOUR_SLOT_VALUES = [1, 2, 3, 4, 5, 6] as const

export type HourSlot = typeof HOUR_SLOT_VALUES[number]
