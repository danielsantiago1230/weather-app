'use client';

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  Suspense
} from 'react';
import { fetchWeatherData, CityKey, CITIES, WeatherData } from './utils/weather';
import WeatherCard from './components/WeatherCard';
import CitySelector from './components/CitySelector';
import ErrorBoundary from './components/ErrorBoundary';

// Loading fallback with skeleton UI
const WeatherLoadingFallback = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full mx-auto animate-pulse"
    data-testid="suspense-loading">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
  </div>
);

export default function Home() {
  // State management
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityKey>('Ottawa');

  // Use refs to track mounted state and prevent memory leaks
  const isMounted = useRef(true);

  // Set up cleanup on component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch weather data when the selected city changes
  useEffect(() => {
    // Create an abort controller for cancelling the fetch request if component unmounts
    const abortController = new AbortController();

    const getWeatherData = async () => {
      if (!isMounted.current) return;

      try {
        setLoading(true);
        setError(null);

        const data = await fetchWeatherData(selectedCity);

        // Only update state if the component is still mounted
        if (isMounted.current && !abortController.signal.aborted) {
          setWeatherData(data);
        }
      } catch (err) {
        // Only update error state if the component is still mounted
        if (isMounted.current && !abortController.signal.aborted) {
          setError(`Failed to fetch weather data for ${selectedCity}`);
          console.error(err);
        }
      } finally {
        // Only update loading state if the component is still mounted
        if (isMounted.current && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    getWeatherData();

    // Refresh weather data every 30 minutes (only if the component remains mounted)
    const intervalId = setInterval(getWeatherData, 30 * 60 * 1000);

    // Cleanup function to cancel pending requests and clear the interval
    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, [selectedCity]);

  // Memoize the city change handler to prevent unnecessary re-renders
  const handleCityChange = useCallback((city: CityKey) => {
    setSelectedCity(city);
  }, []);

  // Memoize the location to prevent unnecessary re-renders
  const locationLabel = useMemo(() =>
    CITIES[selectedCity].label,
    [selectedCity]
  );

  // Handle retry after error
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Force refetch by toggling and then restoring the selected city
    const currentCity = selectedCity;
    const alternateCity = Object.keys(CITIES).find(city => city !== currentCity) as CityKey;
    setSelectedCity(alternateCity);
    setTimeout(() => setSelectedCity(currentCity), 100);
  }, [selectedCity]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gray-100 dark:bg-gray-900"
      data-testid="weather-app">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold">Weather App</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Check the current weather conditions in major cities
        </p>
      </header>

      <CitySelector
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
      />

      <ErrorBoundary onReset={handleRetry}>
        {error ? (
          <div className="mt-4 mb-2 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              aria-label="Retry fetching weather data"
            >
              Retry
            </button>
          </div>
        ) : (
          <Suspense fallback={<WeatherLoadingFallback />}>
            <WeatherCard
              data={weatherData}
              loading={loading}
              error={null}
              location={locationLabel}
            />
          </Suspense>
        )}
      </ErrorBoundary>
    </div>
  );
}
