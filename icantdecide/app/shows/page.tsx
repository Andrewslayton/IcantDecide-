"use client";

import { useState } from "react";
import styles from "./shows.module.css";
import { fetchShows, TMDBShow, genreMap } from "./tmdb";

interface ShowFilters {
  genre: string;
  rating: string;
  startDate: string;
}

export default function Shows() {
  const [filters, setFilters] = useState<ShowFilters>({
    genre: "",
    rating: "5", // Default to middle value
    startDate: "",
  });

  const [shows, setShows] = useState<TMDBShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const genreId = filters.genre ? genreMap[filters.genre] : undefined;
      const results = await fetchShows(
        genreId,
        filters.rating,
        filters.startDate
      );
      setShows(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>TV Show Recommendations</h1>

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
          <label htmlFor="startDate">First Aired After:</label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.results}>
        {shows.map((show) => (
          <div key={show.id} className={styles.showCard}>
            {show.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w200${show.poster_path}`}
                alt={show.name}
                className={styles.showPoster}
              />
            )}
            <div className={styles.showInfo}>
              <h3>{show.name}</h3>
              <p>Rating: {show.vote_average.toFixed(1)}/10</p>
              <p>
                First Aired:{" "}
                {new Date(show.first_air_date).toLocaleDateString()}
              </p>
              <p className={styles.overview}>{show.overview}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
