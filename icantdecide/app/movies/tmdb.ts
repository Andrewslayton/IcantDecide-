
import dotenv from "dotenv"; 

dotenv.config(); 
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";


export interface TMDBMovie {
  id: number;
  title: string;
  genre_ids: number[];
  vote_average: number;
  release_date: string;
  overview: string;
  poster_path: string | null;
}

export interface MovieSearchResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export const fetchMovies = async (
  genre?: string,
  rating?: string,
  date?: string
): Promise<TMDBMovie[]> => {
  try {
    let url = `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc`;

    if (genre) {
      url += `&with_genres=${genre}`;
    }
    if (rating) {
      url += `&vote_average.gte=${rating}`;
    }
    if (date) {
      url += `&primary_release_date.gte=${date}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch movies");
    }

    const data: MovieSearchResponse = await response.json();
    return data.results.slice(0, 5); // Return only 5 movies
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
};

export const genreMap: Record<string, string> = {
  action: "28",
  comedy: "35",
  drama: "18",
  horror: "27",
  romance: "10749",
  scifi: "878",
};
