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
  user_ratings_total?: number;
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
  photos?: {
    photo_reference: string;
    height: number;
    width: number;
  }[];
  distance?: number; 
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface PlacesResponse {
  results: Place[];
  next_page_token?: string;
  status: string;
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
    radius: "8045", // Default to ~5 miles (8045 meters)
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 3958.8; // Earth's radius in miles
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

  const fetchPlaces = async (pagetoken?: string) => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser");
    }

    return new Promise<{data: PlacesResponse, location: UserLocation}>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const userLoc = { lat: latitude, lng: longitude };
          
          let url = `/api/places?type=${filters.type}&radius=${filters.radius}&lat=${latitude}&lng=${longitude}`;
          if (pagetoken) {
            url += `&pagetoken=${pagetoken}`;
          }
          
          const response = await fetch(url);
          
          if (!response.ok) {
            reject(new Error("Failed to fetch places"));
            return;
          }
          
          const data: PlacesResponse = await response.json();
          resolve({data, location: userLoc});
        },
        // (err) => {
        //   reject(new Error("Unable to get your location"));
        // }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setNextPageToken(null);

    try {
      const {data, location} = await fetchPlaces();
      setUserLocation(location);
      
      const placesWithDistance = data.results.map((place: Place) => ({
        ...place,
        distance: calculateDistance(
          location.lat,
          location.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
      }));
      
      setPlaces(placesWithDistance);
      setNextPageToken(data.next_page_token || null);
      setHasNextPage(!!data.next_page_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (!nextPageToken) return;
    
    setLoading(true);
    try {
      // Google requires a small delay when using next_page_token
      setTimeout(async () => {
        const {data, location} = await fetchPlaces(nextPageToken);
        
        const placesWithDistance = data.results.map((place: Place) => ({
          ...place,
          distance: calculateDistance(
            location.lat,
            location.lng,
            place.geometry.location.lat,
            place.geometry.location.lng
          ),
        }));
        
        setPlaces(placesWithDistance);
        setNextPageToken(data.next_page_token || null);
        setHasNextPage(!!data.next_page_token);
        setCurrentPage(currentPage + 1);
        setLoading(false);
        
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1000); // Google often needs a short delay for the next_page_token to be valid
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    // Unfortunately, Google Places API doesn't support going back directly
    // You would need to cache previous results or start over
    // For simplicity, we're just disabling the back button when on page 1
  };

  const openGoogleMaps = (place: Place) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${place.geometry.location.lat},${place.geometry.location.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentContainer}>
        <h1 className={styles.title}>Find Activities Nearby</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="type">Activity Type:</label>
            <select
              id="type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              required
              className={styles.select}
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
              Search Radius: 
            </label>
            <div className={styles.radiusDisplay}>
              {(Number(filters.radius) / 1609).toFixed(1)} mi
            </div>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                id="radius"
                min="804.5"
                max="80467"
                step="804.5"
                value={filters.radius}
                onChange={(e) =>
                  setFilters({ ...filters, radius: e.target.value })
                }
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>0.5mi</span>
                <span>50mi</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Searching..." : "Find Activities"}
          </button>
        </form>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.results}>
          {places.map((place) => (
            <div key={place.place_id} className={styles.placeCard}>
              <div className={styles.placeContent}>
                <div className={styles.placeHeader}>
                  <h3>{place.name}</h3>
                  <span className={styles.distance}>
                    {place.distance?.toFixed(1)} mi
                  </span>
                </div>
                <p className={styles.vicinity}>{place.vicinity}</p>
                {place.rating && (
                  <div className={styles.rating}>
                    {place.rating.toFixed(1)}
                    {place.user_ratings_total && (
                      <span className={styles.ratingCount}>
                        ({place.user_ratings_total} reviews)
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => openGoogleMaps(place)}
                  className={styles.directionsButton}
                >
                  Get Directions
                </button>
              </div>
              {place.photos?.[0] && (
                <div className={styles.placeImageContainer}>
                  <img
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`}
                    alt={place.name}
                    className={styles.placeImage}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        {places.length > 0 && (
          <div className={styles.pagination}>
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1 || loading}
              className={styles.paginationButton}
            >
              ← Previous
            </button>
            
            <span className={styles.pageInfo}>
              Page {currentPage}
            </span>
            
            <button 
              onClick={handleNextPage} 
              disabled={!hasNextPage || loading}
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