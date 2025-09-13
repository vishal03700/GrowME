export interface Artwork {
  id: number
  title: string | null
  place_of_origin: string | null
  artist_display: string | null
  inscriptions: string | null
  date_start: number | null
  date_end: number | null
}

export interface ArtworkApiItem {
  id: number
  title?: string | null
  place_of_origin?: string | null
  artist_display?: string | null
  inscriptions?: string | null
  date_start?: number | null
  date_end?: number | null
}

export interface ArtworkResponse {
  data: ArtworkApiItem[]
  pagination: {
    total: number
    limit: number
    offset: number
    total_pages: number
    current_page: number
  }
  info?: {
    license_text?: string
    license_links?: string[]
    version?: string
  }
}
