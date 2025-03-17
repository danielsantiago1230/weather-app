import React, { memo, useMemo } from 'react';
import { WeatherData } from '../utils/weather';

// Map weather codes to readable conditions and corresponding icons
// Move this outside component to prevent recreation on each render
const weatherCodeMap: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Clear sky', icon: '☀️' },
    1: { condition: 'Mainly clear', icon: '🌤️' },
    2: { condition: 'Partly cloudy', icon: '⛅' },
    3: { condition: 'Overcast', icon: '☁️' },
    45: { condition: 'Fog', icon: '🌫️' },
    48: { condition: 'Depositing rime fog', icon: '🌫️' },
    51: { condition: 'Light drizzle', icon: '🌦️' },
    53: { condition: 'Moderate drizzle', icon: '🌧️' },
    55: { condition: 'Dense drizzle', icon: '🌧️' },
    61: { condition: 'Slight rain', icon: '🌦️' },
    63: { condition: 'Moderate rain', icon: '🌧️' },
    65: { condition: 'Heavy rain', icon: '🌧️' },
    71: { condition: 'Slight snow fall', icon: '🌨️' },
    73: { condition: 'Moderate snow fall', icon: '🌨️' },
    75: { condition: 'Heavy snow fall', icon: '❄️' },
    80: { condition: 'Slight rain showers', icon: '🌦️' },
    81: { condition: 'Moderate rain showers', icon: '🌧️' },
    82: { condition: 'Violent rain showers', icon: '⛈️' },
    95: { condition: 'Thunderstorm', icon: '⛈️' },
    96: { condition: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { condition: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

// Default weather info for fallback
const defaultWeatherInfo = { condition: 'Unknown', icon: '❓' };

interface WeatherCardProps {
    data: WeatherData | null;
    loading: boolean;
    error: string | null;
    location: string;
}

// Loading state UI component
const LoadingState = memo(() => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full mx-auto animate-pulse" data-testid="weather-loading">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
));

// Error state UI component
const ErrorState = memo(({ error }: { error: string }) => (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full mx-auto text-center"
        role="alert"
        aria-live="assertive"
        data-testid="weather-error">
        <div className="text-red-500 text-xl">Error: {error}</div>
        <div className="mt-4">Please try again later</div>
    </div>
));

// Weather display UI component
const WeatherDisplay = memo(({ data, location }: { data: WeatherData; location: string }) => {
    // Use useMemo to avoid recalculating these values on every render
    const { weatherInfo, highTemp, lowTemp, currentTemp } = useMemo(() => {
        const weatherCode = data.current.weather_code;
        return {
            weatherInfo: weatherCodeMap[weatherCode] || defaultWeatherInfo,
            highTemp: Math.round(data.daily.temperature_2m_max[0]),
            lowTemp: Math.round(data.daily.temperature_2m_min[0]),
            currentTemp: Math.round(data.current.temperature_2m)
        };
    }, [data]);

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md w-full mx-auto"
            data-testid="weather-display">
            <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">{location}</h2>

                <div className="text-7xl mb-2" role="img" aria-label={weatherInfo.condition}>
                    {weatherInfo.icon}
                </div>

                <div className="text-4xl font-bold mb-2">
                    {currentTemp}°C
                </div>

                <div className="text-xl mb-4">{weatherInfo.condition}</div>

                <div className="flex gap-4">
                    <div className="text-lg">
                        H: {highTemp}°C
                    </div>
                    <div className="text-lg">
                        L: {lowTemp}°C
                    </div>
                </div>
            </div>
        </div>
    );
});

// Give named components for better debugging in React DevTools
LoadingState.displayName = 'LoadingState';
ErrorState.displayName = 'ErrorState';
WeatherDisplay.displayName = 'WeatherDisplay';

// Main WeatherCard component
const WeatherCard: React.FC<WeatherCardProps> = ({ data, loading, error, location }) => {
    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} />;
    }

    if (!data) {
        return null;
    }

    return <WeatherDisplay data={data} location={location} />;
};

// Export memoized component to prevent unnecessary re-renders
export default memo(WeatherCard);