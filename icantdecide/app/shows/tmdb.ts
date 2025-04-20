import dotenv from "dotenv";

dotenv.config();
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBShow {
  id: number;
  name: string; // Changed from title to name for TV shows
  genre_ids: number[];
  vote_average: number;
  first_air_date: string; // Changed from release_date for TV shows
  overview: string;
  poster_path: string | null;
}

export interface ShowSearchResponse {
  results: TMDBShow[];
  total_pages: number;
  total_results: number;
}

export const fetchShows = async (
  genre?: string,
  rating?: string,
  startDate?: string
): Promise<TMDBShow[]> => {
  try {
    let url = `${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc`;

    if (genre) {
      url += `&with_genres=${genre}`;
    }
    if (rating) {
      url += `&vote_average.gte=${rating}`;
    }
    if (startDate) {
      url += `&first_air_date.gte=${startDate}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch TV shows");
    }

    const data: ShowSearchResponse = await response.json();
    return data.results.slice(0, 5); // Return only 5 shows
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return [];
  }
};

// TV Show genres are different from movie genres
export const genreMap: Record<string, string> = {
  action: "10759", // Action & Adventure
  animation: "16",
  comedy: "35",
  crime: "80",
  documentary: "99",
  drama: "18",
  family: "10751",
  kids: "10762",
  mystery: "9648",
  reality: "10764",
  scifi: "10765", // Sci-Fi & Fantasy
  soap: "10766",
  talk: "10767",
  war: "10768",
  western: "37",
};
