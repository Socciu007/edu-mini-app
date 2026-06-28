export const GRADES = [10, 11, 12] as const
export type Grade = (typeof GRADES)[number]
