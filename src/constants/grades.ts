export const GRADES = [10, 11, 12] as const;
export type Grade = typeof GRADES[number];

export function isGrade(n: number): n is Grade {
  return (GRADES as readonly number[]).includes(n);
}
