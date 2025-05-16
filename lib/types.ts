export interface Article {
    uri: string
    lang: string
    isDuplicate: boolean
    date: string
    time: string
    dateTime: string
    dateTimePub: string
    dataType: string
    sim: number
    url: string
    title: string
    body: string
    source: {
        uri: string
        dataType: string
        title: string
    }
    authors: {
        uri: string
        name: string
        type: string
        isAgency: boolean
    }[]
    image: string
    eventUri?: string
    sentiment: number
    relevance: number

    // Denialist claim sentences (may or may not exist in every article)
    sc_deny_causal_extreme_weather_sentence?: string
    bc_not_caused_by_human_sentence?: string
    sc_movement_unreliable_sentence?: string
    sc_downplay_warming_sentence?: string
    [key: `sc_${string}_sentence` | `bc_${string}_sentence`]: string | undefined
}