import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const extractClaimTypes = (article: any): string[] => {
    return Object.keys(article)
        .filter(
            key =>
                (key.startsWith("bc_") || key.startsWith("sc_")) &&
                key.endsWith("_sentence")
        )
        .map(key => {
            const rawClaim = key.replace(/^(bc_|sc_)/, "").replace(/_sentence$/, "")
            return rawClaim
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
        })
}

export function getClaimColor(key: string): string {
    if (key.includes("extreme_weather")) return "bg-green-100 text-green-800"
    if (key.includes("not_caused_by_human")) return "bg-blue-100 text-blue-800"
    if (key.includes("movement_unreliable")) return "bg-purple-100 text-purple-800"
    if (key.includes("global_warming_not_bad")) return "bg-yellow-100 text-yellow-800"
    if (key.includes("climate_policies_harmful")) return "bg-red-100 text-red-800"
    if (key.includes("science_unreliable")) return "bg-pink-100 text-pink-800"
    if (key.includes("human_impacts_uncertain")) return "bg-orange-100 text-orange-800"
    if (key.includes("data_uncertainty")) return "bg-teal-100 text-teal-800"
    if (key.includes("natural_cycle")) return "bg-indigo-100 text-indigo-800"
    if (key.includes("too_costly")) return "bg-rose-100 text-rose-800"
    if (key.includes("positive_effects")) return "bg-lime-100 text-lime-800"
    if (key.includes("scientific_consensus_doubted")) return "bg-cyan-100 text-cyan-800"

    // fallback if no claims are available
    return "bg-gray-100 text-gray-800"
}

export const getClaimSentence = (article: any): string[] => {
    const claimKeys = Object.keys(article).filter(key =>
        key.endsWith('_sentence')
    );

    return claimKeys
        .map(key => article[key])
        .filter((sentence): sentence is string => typeof sentence === 'string' && sentence.trim() !== '');
};

function toNamespace(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;
    return new Proxy(obj, {
        get(target, prop) {
            const value = target[prop as keyof typeof target];
            return typeof value === "object" ? toNamespace(value) : value;
        },
    });
}

export function highlightClaimsInBody(body: string, claims: string[]): string {
    if (!body) return "";

    let highlightedBody = body;

    claims.forEach(claim => {
        const escapedClaim = claim.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&"); // escape RegEx
        const regex = new RegExp(escapedClaim, "gi");
        highlightedBody = highlightedBody.replace(
            regex,
            `<span class="underline">${claim}</span>`
        );
    });

    return highlightedBody;
}

