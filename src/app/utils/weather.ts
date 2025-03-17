// City coordinates with more strongly-typed constant values
export const CITIES = {
    'Ottawa': {
        latitude: 45.4215,
        longitude: -75.6972,
        label: 'Ottawa, Canada'
    },
    'Bogota': {
        latitude: 4.7110,
        longitude: -74.0721,
        label: 'Bogota, Colombia'
    },
    'Buenos Aires': {
        latitude: -34.6037,
        longitude: -58.3816,
        label: 'Buenos Aires, Argentina'
    }
} as const;

export type CityKey = keyof typeof CITIES;

// Weather data interface for better type safety
export interface WeatherData {
    current: {
        temperature_2m: number;
        weather_code: number;
        time: string;
    };
    daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        time: string[];
    };
}

// Custom error class for API errors
export class WeatherApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'WeatherApiError';
        this.status = status;
    }
}

// Cache strategy: store recent data with timestamps
const weatherCache: Record<CityKey, { data: WeatherData; timestamp: number }> = {} as Record<CityKey, { data: WeatherData; timestamp: number }>;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Fetches weather data from the Open-Meteo API for a specific city
 * with intelligent caching for better performance
 *
 * @param city - The city to fetch weather data for
 * @param options - Optional configuration (skipCache to force fresh data)
 * @returns A promise that resolves to weather data
 */
export async function fetchWeatherData(
    city: CityKey,
    options: { skipCache?: boolean } = {}
): Promise<WeatherData> {
    // Check cache first unless explicitly skipped
    const now = Date.now();
    const cachedData = weatherCache[city];

    if (!options.skipCache &&
        cachedData &&
        now - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.data;
    }

    try {
        const { latitude, longitude } = CITIES[city];

        // Using URLSearchParams for safer URL construction
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            current: 'temperature_2m,weather_code',
            daily: 'temperature_2m_max,temperature_2m_min',
            timezone: 'auto',
            forecast_days: '1'
        });

        const API_URL = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

        // Use simple no-store cache option for client components
        const response = await fetch(API_URL, {
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new WeatherApiError(
                response.status,
                `Weather API error: ${response.status} - ${errorText}`
            );
        }

        const data = await response.json() as WeatherData;

        // Update cache
        weatherCache[city] = { data, timestamp: now };

        return data;
    } catch (error) {
        console.error(`Error fetching weather data for ${city}:`, error);

        // Re-throw custom error or original error
        if (error instanceof WeatherApiError) {
            throw error;
        }

        // Wrap other errors
        throw new Error(`Failed to fetch weather data: ${(error as Error).message}`);
    }
}