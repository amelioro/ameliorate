import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// eslint-disable-next-line functional/functional-parameters
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export * from "./isCustomNodeSelected";
export * from "./isTextSelected";
