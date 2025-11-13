import React from 'react';
import { Search, Filter, ChevronDown, Locate } from 'lucide-react';
import StationCard from './StationCard';

const StationListPanel = ({ 
  stations, 
  selectedStation,
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  stationLoading,
  onStationSelect,
  onBookStation,
  userLocation
}) => {
  return (
    <div className="w-96 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm trạm sạc gần đây..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        </div>

      {/* Station List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Trạm sạc gần bạn ({stations.length})
            </h2>
            {stationLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            )}
          </div>
          
          <div className="space-y-3">
            {stations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isSelected={selectedStation?.id === station.id}
                onSelect={onStationSelect}
                onBook={onBookStation}
                userLocation={userLocation}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationListPanel;
