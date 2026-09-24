export const WEEKDAY_VALUES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

export type Weekday = typeof WEEKDAY_VALUES[number]
