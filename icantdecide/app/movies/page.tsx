"use client";

import { useState } from "react";
import styles from "./movies.module.css";
import { fetchMovies, TMDBMovie, genreMap } from "./tmdb";

interface MovieFilters {
  genre: string;
  rating: string;
  date: string;
}

export default function Movies() {
  const [filters, setFilters] = useState<MovieFilters>({
    genre: "",
    rating: "5", // Default to middle value
    date: "",
  });

  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const genreId = filters.genre ? genreMap[filters.genre] : undefined;
      const results = await fetchMovies(genreId, filters.rating, filters.date);
      setMovies(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Movie Recommendations</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="genre">Genre:</label>
          <select
            id="genre"
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="">Any Genre</option>
            {Object.keys(genreMap).map((genre) => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="rating">
            Minimum Rating: {Number(filters.rating).toFixed(1)}
          </label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              id="rating"
              min="1"
              max="10"
              step="0.1"
              value={filters.rating}
              onChange={(e) =>
                setFilters({ ...filters, rating: e.target.value })
              }
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="date">Release Date After:</label>
          <input
            type="date"
            id="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.results}>
        {movies.map((movie) => (
          <div key={movie.id} className={styles.movieCard}>
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className={styles.moviePoster}
              />
            )}
            <div className={styles.movieInfo}>
              <h3>{movie.title}</h3>
              <p>Rating: {movie.vote_average.toFixed(1)}/10</p>
              <p>
                Release Date:{" "}
                {new Date(movie.release_date).toLocaleDateString()}
              </p>
              <p className={styles.overview}>{movie.overview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
