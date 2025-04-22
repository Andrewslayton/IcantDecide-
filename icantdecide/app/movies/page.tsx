"use client";

import { useState } from "react";
import styles from "./movies.module.css";
import { fetchMovies, TMDBMovie, genreMap, } from "./tmdb";

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

  const [paginationData, setPaginationData] = useState<{
    currentPage: number;
    totalPages: number;
    totalResults: number;
  }>({
    currentPage: 1,
    totalPages: 0,
    totalResults: 0,
  });

  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoviesData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const genreId = filters.genre ? genreMap[filters.genre] : undefined;
      const data = await fetchMovies(
        genreId,
        filters.rating,
        filters.date,
        page
      );

      setMovies(data.results);
      setPaginationData({
        currentPage: data.page,
        totalPages: data.total_pages,
        totalResults: data.total_results,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset pagination to page 1 when submitting a new search
    await fetchMoviesData(1);
  };

  const handleNextPage = () => {
    if (paginationData.currentPage < paginationData.totalPages) {
      fetchMoviesData(paginationData.currentPage + 1);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (paginationData.currentPage > 1) {
      fetchMoviesData(paginationData.currentPage - 1);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <h1 className={styles.title}>Movie Recommendations</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="genre">Genre:</label>
            <select
              id="genre"
              value={filters.genre}
              onChange={(e) =>
                setFilters({ ...filters, genre: e.target.value })
              }
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
            <label htmlFor="rating">Minimum Rating:</label>
            <div className={styles.ratingDisplay}>
              {Number(filters.rating).toFixed(1)}
            </div>
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
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                  alt={movie.title}
                  className={styles.moviePoster}
                />
              ) : (
                <div className={styles.noPoster}>No Poster</div>
              )}
              <div className={styles.movieInfo}>
                <h3>{movie.title}</h3>
                <div className={styles.movieMeta}>
                  <span className={styles.rating}>
                    {movie.vote_average.toFixed(1)}
                  </span>
                  <span className={styles.date}>
                    {new Date(movie.release_date).toLocaleDateString()}
                  </span>
                </div>
                <p className={styles.overview}>{movie.overview}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        {paginationData.totalPages > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={handlePrevPage}
              disabled={paginationData.currentPage === 1 || loading}
              className={styles.paginationButton}
            >
              ← Previous
            </button>

            <span className={styles.pageInfo}>
              Page {paginationData.currentPage} of {paginationData.totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={
                paginationData.currentPage === paginationData.totalPages ||
                loading
              }
              className={styles.paginationButton}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
