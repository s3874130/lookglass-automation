import { ChartConfig } from "@/components/ui/chart"

export const CLAIM_OPTIONS = {
    sc: [
        "cold_event_denial", "deny_extreme_weather", "deny_causal_extreme_weather",
        "natural_variations", "past_climate_reference", "species_adapt",
        "downplay_warming", "policies_negative", "policies_ineffective",
        "policies_difficult", "low_support_policies", "clean_energy_unreliable",
        "climate_science_unrel", "no_consensus", "movement_unreliable", "hoax_conspiracy"
    ],
    bc: [
        "gw_not_happening", "not_caused_by_human", "impacts_not_bad",
        "solutions_wont_work", "science_movement_unrel", "individual_action"
    ]
}

export const CLAIM_COLORS: Record<string, string> = {
    "cold_event_denial": "#6366f1",
    "deny_extreme_weather": "#818cf8",
    "deny_causal_extreme_weather": "#a5b4fc",
    "natural_variations": "#fbbf24",
    "past_climate_reference": "#34d399",
    "species_adapt": "#10b981",
    "downplay_warming": "#06b6d4",
    "policies_negative": "#f97316",
    "policies_ineffective": "#22c55e",
    "policies_difficult": "#facc15",
    "low_support_policies": "#f43f5e",
    "clean_energy_unreliable": "#8b5cf6",
    "climate_science_unrel": "#ec4899",
    "no_consensus": "#14b8a6",
    "movement_unreliable": "#eab308",
    "hoax_conspiracy": "#f472b6",
    "gw_not_happening": "#e11d48",
    "not_caused_by_human": "#0ea5e9",
    "impacts_not_bad": "#a3e635",
    "solutions_wont_work": "#9333ea",
    "science_movement_unrel": "#38bdf8",
    "individual_action": "#84cc16",
    "other": "#d1d5db"
}

export const chartData = [
    { month: "2000", desktop: 186, mobile: 80 },
    { month: "2004", desktop: 305, mobile: 200 },
    { month: "2008", desktop: 237, mobile: 120 },
    { month: "2012", desktop: 73, mobile: 190 },
    { month: "2018", desktop: 209, mobile: 130 },
    { month: "2025", desktop: 214, mobile: 140 },
]

export const TOPICS = [
    "All", "Technology", "Politics", "Science", "Health", "Business", "Entertainment"
]

export const chartConfig = {
    desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
    mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig