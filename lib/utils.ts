import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function extractClaimLabel(key: string): string {
    // Match keys like 'sc_movement_unreliable_sentence' or 'bc_not_caused_by_human_sentence'
    const match = key.match(/^(sc|bc)_(.*)_sentence$/)
    if (!match) return key

    const raw = match[2] // e.g., 'movement_unreliable' or 'not_caused_by_human'

    // Turn snake_case into Title Case
    return raw
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function getClaimColor(key: string): string {
    if (key.includes("extreme_weather")) return "bg-green-100 text-green-800"
    if (key.includes("not_caused_by_human")) return "bg-blue-100 text-blue-800"
    if (key.includes("movement_unreliable")) return "bg-purple-100 text-purple-800"
    if (key.includes("warming")) return "bg-yellow-100 text-yellow-800"
    return "bg-gray-100 text-gray-800"
}

export function getFirstClaimSentence(claims: Record<string, string>): { text: string; color: string } | null {
    for (const [key, sentence] of Object.entries(claims)) {
        if (sentence) {
            return {
                text: sentence,
                color: getClaimColor(key),
            }
        }
    }
    return null
}

function toNamespace(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;
    return new Proxy(obj, {
      get(target, prop) {
        const value = target[prop as keyof typeof target];
        return typeof value === "object" ? toNamespace(value) : value;
      },
    });
  }