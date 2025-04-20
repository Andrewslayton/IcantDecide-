"use client";

import { useState } from "react";
import styles from "./activities.module.css";

interface ActivityFilters {
  type: string;
  radius: string;
}

interface Place {
  name: string;
  vicinity: string;
  rating?: number;
  types: string[];
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  distance?: number; 
}

interface UserLocation {
  lat: number;
  lng: number;
}

const activityTypes = {
  bar: "Bar",
  cafe: "Cafe",
  museum: "Museum",
  restaurant: "Restaurant",
  shopping_mall: "Mall",
};

export default function Activities() {
  const [filters, setFilters] = useState<ActivityFilters>({
    type: "",
    radius: "5000", // Default to 5km
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          const response = await fetch(
            `/api/places?type=${filters.type}&radius=${filters.radius}&lat=${latitude}&lng=${longitude}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch places");
          }

          const data = await response.json();

          const placesWithDistance = data.results.map((place: Place) => {
            const distance = calculateDistance(
              latitude,
              longitude,
              place.geometry.location.lat,
              place.geometry.location.lng
            );
            return { ...place, distance };
          });

          setPlaces(placesWithDistance);
          setLoading(false);
        },
        () => {
          setError("Unable to get your location");
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const openGoogleMaps = (place: Place) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${place.geometry.location.lat},${place.geometry.location.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className={styles.container}>
      <h1>Find Activities Nearby</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="type">Activity Type:</label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            required
          >
            <option value="">Select Type</option>
            {Object.entries(activityTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="radius">
            Search Radius: {(Number(filters.radius) / 1000).toFixed(1)}km
          </label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              id="radius"
              min="1000"
              max="50000"
              step="1000"
              value={filters.radius}
              onChange={(e) =>
                setFilters({ ...filters, radius: e.target.value })
              }
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>1km</span>
              <span>50km</span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Activities"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.results}>
        {places.map((place) => (
          <div key={place.place_id} className={styles.placeCard}>
            <div className={styles.placeHeader}>
              <h3>{place.name}</h3>
              <span className={styles.distance}>
                {place.distance?.toFixed(1)} km
              </span>
            </div>
            <p>{place.vicinity}</p>
            {place.rating && <p>Rating: {place.rating}/5</p>}
            <button
              onClick={() => openGoogleMaps(place)}
              className={styles.directionsButton}
            >
              Get Directions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
