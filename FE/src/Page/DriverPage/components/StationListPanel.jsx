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
  onBookStation
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
        
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Bộ lọc</span>
            <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            <Locate className="w-4 h-4" />
            <span className="text-sm">Gần tôi</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Sạc nhanh</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Có sẵn ngay</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Giá rẻ</span>
              </label>
            </div>
          </div>
        )}
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationListPanel;
