import axios from 'axios'
import type { Artwork, ArtworkResponse } from '../types/artwork'

const API_BASE_URL = 'https://api.artic.edu/api/v1'

class ArtworkService {
  async getArtworks(page: number = 1, limit = 12) {
    const response = await axios.get<ArtworkResponse>(`${API_BASE_URL}/artworks`, {
      params: {
        page,
        limit,
        fields: 'id,title,place_of_origin,artist_display,inscriptions,date_start,date_end'
      }
    })

    const artworks: Artwork[] = response.data.data.map(item => ({
      id: item.id,
      title: item.title ?? null,
      place_of_origin: item.place_of_origin ?? null,
      artist_display: item.artist_display ?? null,
      inscriptions: item.inscriptions ?? null,
      date_start: item.date_start ?? null,
      date_end: item.date_end ?? null
    }))

    return {
      artworks,
      pagination: {
        total: response.data.pagination.total,
        currentPage: response.data.pagination.current_page,
        totalPages: response.data.pagination.total_pages
      }
    }
  }
}

export const artworkService = new ArtworkService()
