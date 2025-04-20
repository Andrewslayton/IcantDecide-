"use client";

import { useState } from "react";
import styles from "./shows.module.css";

interface ShowFilters {
  genre: string;
  rating: string;
  startDate: string;
}

interface Show {
  id: number;
  title: string;
  genre: string;
  rating: number;
  startDate: string;
  overview: string;
}

export default function Shows() {
  const [filters, setFilters] = useState<ShowFilters>({
    genre: "",
    rating: "",
    startDate: "",
  });

  const [shows, setShows] = useState<Show[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would implement API call to get shows
    console.log("Filters:", filters);
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
            <option value="drama">Drama</option>
            <option value="comedy">Comedy</option>
            <option value="thriller">Thriller</option>
            <option value="scifi">Sci-Fi</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="rating">Minimum Rating:</label>
          <input
            type="number"
            id="rating"
            min="1"
            max="10"
            step="0.1"
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="startDate">Started After:</label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
        </div>

        <button type="submit">Get Recommendations</button>
      </form>

      <div className={styles.results}>
        {shows.map((show) => (
          <div key={show.id} className={styles.showCard}>
            <h3>{show.title}</h3>
            <p>Rating: {show.rating}/10</p>
            <p>Genre: {show.genre}</p>
            <p>First Aired: {new Date(show.startDate).toLocaleDateString()}</p>
            <p>{show.overview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
