import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSimpleIconSlug(skillName: string): string {
  return skillName
    .toLowerCase()
    .replace(/\s+/g, '')          // remove spaces
    .replace(/\./g, '')           // remove dots
    .replace(/js$/, 'javascript'); // convert "js" to "javascript"
}
