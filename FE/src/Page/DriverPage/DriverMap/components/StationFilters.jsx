import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, X, RotateCcw } from 'lucide-react';
import { setFilters, resetFilters } from '../../../../redux/station/stationSlice';

const StationFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.station);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== null && value !== 'all' && value !== 0
  ).length;

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        <Filter size={20} className="text-green-600" />
        <span className="font-medium text-gray-700">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-2 bg-white rounded-lg shadow-xl p-4 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Filter Stations</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Connector Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connector Type
              </label>
              <select
                value={filters.connectorType || ''}
                onChange={(e) =>
                  handleFilterChange('connectorType', e.target.value || null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="CCS">CCS (Combined Charging System)</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Type2">Type 2 (Mennekes)</option>
                <option value="Type1">Type 1 (J1772)</option>
                <option value="Tesla">Tesla Supercharger</option>
                <option value="GB/T">GB/T</option>
              </select>
            </div>

            {/* Power Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Power Level
              </label>
              <select
                value={filters.powerLevel || ''}
                onChange={(e) =>
                  handleFilterChange('powerLevel', e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Any Power</option>
                <option value="7">7 kW (Slow)</option>
                <option value="22">22 kW (Fast)</option>
                <option value="50">50 kW (Rapid)</option>
                <option value="150">150 kW (Ultra Rapid)</option>
                <option value="350">350 kW (Hyper)</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Stations</option>
                <option value="available">Available Now</option>
                <option value="busy">Busy</option>
              </select>
            </div>

            {/* Max Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Distance
              </label>
              <select
                value={filters.maxDistance || ''}
                onChange={(e) =>
                  handleFilterChange('maxDistance', e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Any Distance</option>
                <option value="1">Within 1 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) =>
                    handleFilterChange('minRating', parseFloat(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {filters.minRating.toFixed(1)} ⭐
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationFilters;
