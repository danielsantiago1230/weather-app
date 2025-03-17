import React, { memo, useCallback } from 'react';
import { CITIES, CityKey } from '../utils/weather';

interface CitySelectorProps {
    selectedCity: CityKey;
    onCityChange: (city: CityKey) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ selectedCity, onCityChange }) => {
    // Pre-generate city keys for optimization
    const cityKeys = Object.keys(CITIES) as Array<CityKey>;

    // Create a reusable button renderer using useCallback to optimize render performance
    const renderCityButton = useCallback((cityKey: CityKey) => {
        const isSelected = selectedCity === cityKey;

        return (
            <button
                key={cityKey}
                className={`px-4 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                onClick={() => onCityChange(cityKey)}
                aria-pressed={isSelected}
                aria-label={`Show weather for ${CITIES[cityKey].label}`}
                data-testid={`city-button-${cityKey}`} // Adding test ID for easier testing
            >
                {cityKey}
            </button>
        );
    }, [selectedCity, onCityChange]);

    return (
        <div className="mb-6" role="group" aria-label="City selection">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {cityKeys.map(renderCityButton)}
            </div>
        </div>
    );
};

// Export memoized component to prevent unnecessary re-renders
// This is especially important since it will be rendered on every parent re-render
export default memo(CitySelector);