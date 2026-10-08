import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTrafficLightColor(value: number, invertLogic: boolean = false): string {
  if (value === 0) return "";
  
  const isPositive = invertLogic ? value < 0 : value > 0;
  const isNegative = invertLogic ? value > 0 : value < 0;
  
  if (isPositive) {
    return "text-emerald-600 dark:text-emerald-400";
  } else if (isNegative) {
    return "text-red-600 dark:text-red-400";
  }
  return "";
}

export function getTrafficLightBgColor(value: number, invertLogic: boolean = false): string {
  if (value === 0) return "";
  
  const isPositive = invertLogic ? value < 0 : value > 0;
  const isNegative = invertLogic ? value > 0 : value < 0;
  
  if (isPositive) {
    return "bg-emerald-50 dark:bg-emerald-950/30";
  } else if (isNegative) {
    return "bg-red-50 dark:bg-red-950/30";
  }
  return "";
}
