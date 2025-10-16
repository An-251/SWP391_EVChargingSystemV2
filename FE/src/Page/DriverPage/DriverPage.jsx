import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Route } from 'lucide-react';
import { message } from 'antd';

import { logoutUser } from '../../redux/auth/authSlice';
import { fetchStations, setSelectedStation as setReduxSelectedStation } from '../../redux/station/stationSlice';

import DriverHeader from './components/DriverHeader';
import StationListPanel from './components/StationListPanel';
import DriverMap from './DriverMap';
import useUserLocation from './hooks/useUserLocation';
import useChargingStations from './hooks/useChargingStations';

const DriverPage = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { stations: rawStations, loading: stationLoading } = useSelector((state) => state.station);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [selectedStation, setSelectedStation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Custom hooks
  const { userLocation } = useUserLocation();
  const chargingStations = useChargingStations(rawStations, userLocation);

  // Fetch stations from API on mount
  useEffect(() => {
    dispatch(fetchStations());
  }, [dispatch]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Filter stations by search query
  const filteredStations = chargingStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleStationSelect = (station) => {
    setSelectedStation(station);
    dispatch(setReduxSelectedStation(station));
  };

  const handleRefreshStations = () => {
    dispatch(fetchStations());
    message.success('Đang cập nhật danh sách trạm sạc...');
  };

  const handleBookStation = (station) => {
    // Handle booking logic here
    alert(`Đang đặt trạm ${station.name}...`);
  };

  const handleNavigateToProfile = () => {
    navigate('/driver/profile');
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      message.success('Đăng xuất thành công!');
      navigate('/auth/login');
    } catch (error) {
      message.warning('Đăng xuất thành công!');
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DriverHeader
        user={user}
        stationLoading={stationLoading}
        authLoading={authLoading}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        onRefreshStations={handleRefreshStations}
        onNavigateToProfile={handleNavigateToProfile}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex">
        <StationListPanel
          stations={filteredStations}
          selectedStation={selectedStation}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          stationLoading={stationLoading}
          onStationSelect={handleStationSelect}
          onBookStation={handleBookStation}
        />

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <DriverMap 
              stations={chargingStations}
              selectedStation={selectedStation}
              userLocation={userLocation}
              onStationSelect={handleStationSelect}
            />
          </div>
          
          {/* Floating Action Button */}
          <div className="absolute bottom-6 right-6">
            <button className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center">
              <Route className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;
