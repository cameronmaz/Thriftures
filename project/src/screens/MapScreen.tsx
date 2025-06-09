import React, { useState, useEffect, useRef } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import SaleCard from '../components/SaleCard';
import SaleFilter from '../components/SaleFilter';
import { mockUserSales } from '../data/mockSales';
import { googleMapsService, GooglePlace } from '../services/googleMapsService';
import { convertGooglePlaceToSale } from '../utils/placeConverter';
import { Sale } from '../types/Sale';
import './MapScreen.css';

export default function MapScreen() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [googlePlaces, setGooglePlaces] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchStatus, setSearchStatus] = useState<string>('Initializing...');
  const [activeFilters, setActiveFilters] = useState({
    garageSales: true,
    estateSales: true,
    thriftStores: true,
    fleaMarkets: true,
    consignmentShops: true,
    other: true,
  });

  // Combine user-posted sales with Google Places
  const allSales = [...mockUserSales, ...googlePlaces];
  
  // Apply filters to all sales
  const filteredSales = allSales.filter(sale => {
    return activeFilters[sale.type as keyof typeof activeFilters];
  });

  useEffect(() => {
    // Wait for component to fully mount before initializing
    const initTimer = setTimeout(() => {
      initializeGoogleMaps();
    }, 100);

    return () => clearTimeout(initTimer);
  }, []);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  };

  // Add markers for filtered sales
  const addMarkersToMap = () => {
    if (!mapInitialized || !googleMapsService.getMap()) return;

    console.log('Adding markers for filtered sales:', filteredSales.length);
    
    // Clear existing markers first
    clearMarkers();

    // Add markers for each filtered sale
    filteredSales.forEach(sale => {
      const marker = new google.maps.Marker({
        position: { lat: sale.latitude, lng: sale.longitude },
        map: googleMapsService.getMap(),
        title: sale.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: sale.isUserPosted ? 12 : 10,
          fillColor: getMarkerColor(sale.type),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: sale.isUserPosted ? 100 : 50,
      });

      marker.addListener('click', () => {
        setSelectedSale(sale);
      });

      markersRef.current.push(marker);
    });

    console.log(`Added ${markersRef.current.length} markers to map`);
  };

  // Re-render markers when filters change
  useEffect(() => {
    if (mapInitialized) {
      console.log('Filters changed, updating markers...');
      addMarkersToMap();
    }
  }, [activeFilters, allSales, mapInitialized]);

  const initializeGoogleMaps = async () => {
    try {
      console.log('Attempting to initialize Google Maps...');
      setSearchStatus('Initializing Google Maps...');
      
      // Check if map container exists with more detailed logging
      if (!mapRef.current) {
        console.error(`Map container not found (attempt ${retryCount + 1})`);
        
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          console.log(`Retrying in 1 second... (attempt ${retryCount + 2})`);
          setTimeout(() => {
            initializeGoogleMaps();
          }, 1000);
          return;
        } else {
          console.error('Max retries reached, falling back to placeholder map');
          setError('Unable to initialize map container. Using fallback mode.');
          setIsLoading(false);
          return;
        }
      }

      console.log('Map container found successfully!');
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      
      // Check if API key is configured
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'your_actual_api_key_here' || apiKey === 'your_google_maps_api_key_here') {
        console.warn('Google Maps API key not configured, using fallback mode');
        setError('Google Maps API key not configured. Showing all available sales.');
        setSearchStatus('Using fallback data...');
        
        // Still show user-posted sales and fallback stores
        const fallbackStores = await googleMapsService.searchNearbyThriftStores(15000); // Increased radius
        const salesFromPlaces: Sale[] = [];
        
        for (const place of fallbackStores) {
          try {
            const details = await googleMapsService.getPlaceDetails(place.place_id);
            const sale = convertGooglePlaceToSale(place, details);
            salesFromPlaces.push(sale);
          } catch (error) {
            console.warn('Failed to get details for fallback place:', place.name);
            const sale = convertGooglePlaceToSale(place);
            salesFromPlaces.push(sale);
          }
        }
        
        setGooglePlaces(salesFromPlaces);
        setIsLoading(false);
        return;
      }

      // Initialize the map
      setSearchStatus('Loading map...');
      await googleMapsService.initializeMap(mapRef.current);
      setMapInitialized(true);
      console.log('Google Maps initialized successfully');

      // Search for nearby thrift stores and similar businesses with larger radius
      setSearchStatus('Searching for nearby stores...');
      console.log('Searching for nearby places...');
      try {
        const places = await googleMapsService.searchNearbyThriftStores(15000); // Increased from 8km to 15km
        console.log(`Found ${places.length} places`);
        
        if (places.length === 0) {
          setSearchStatus('No stores found nearby - showing user sales only');
          console.warn('No places found, but continuing with user-posted sales');
        } else {
          setSearchStatus(`Found ${places.length} stores nearby`);
        }
        
        // Convert Google Places to Sale objects
        const salesFromPlaces: Sale[] = [];
        
        // Process more places with better error handling
        for (let i = 0; i < Math.min(places.length, 20); i++) { // Increased from 10 to 20
          const place = places[i];
          try {
            // Get detailed information for each place
            const details = await googleMapsService.getPlaceDetails(place.place_id);
            const sale = convertGooglePlaceToSale(place, details);
            salesFromPlaces.push(sale);
            
            // Small delay to avoid rate limits
            if (i < places.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 150)); // Reduced delay
            }
          } catch (error) {
            console.warn('Failed to get details for place:', place.name, error);
            // Still add the place with basic info
            const sale = convertGooglePlaceToSale(place);
            salesFromPlaces.push(sale);
          }
        }
        
        setGooglePlaces(salesFromPlaces);
        setSearchStatus(`Loaded ${salesFromPlaces.length} stores successfully`);
        
        // Add markers for all sales after loading
        setTimeout(() => {
          addMarkersToMap();
        }, 500);
        
      } catch (searchError) {
        console.warn('Failed to search for places:', searchError);
        setSearchStatus('Store search failed - showing user sales only');
        
        // Continue without Google Places data but show appropriate message
        if (searchError instanceof Error) {
          if (searchError.message.includes('quota')) {
            setError('Google Places API quota exceeded. Showing user-posted sales only.');
          } else if (searchError.message.includes('denied')) {
            setError('Google Places API access denied. Please check API key permissions.');
          } else {
            setError('Unable to load nearby stores. Showing user-posted sales only.');
          }
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setSearchStatus('Map initialization failed');
      setIsLoading(false);
    }
  };

  const handleMarkerPress = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const openNavigation = (sale: Sale) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${sale.latitude},${sale.longitude}`;
    window.open(url, '_blank');
  };

  const handleAddSaleClick = () => {
    navigate('/create');
  };

  const handleRecenterClick = () => {
    if (mapInitialized) {
      googleMapsService.recenterMap();
    } else {
      alert('📍 Recentering Map\n\nReturning to your current location...');
    }
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'garageSales': return '#14B8A6';
      case 'estateSales': return '#8B5CF6';
      case 'thriftStores': return '#F97316';
      case 'fleaMarkets': return '#EF4444';
      case 'consignmentShops': return '#3B82F6';
      case 'other': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getMarkerIcon = (sale: Sale): string => {
    if (!sale.isUserPosted) {
      return '🏪'; // Store icon for businesses
    }
    return '📍'; // Pin for user-posted sales
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    setSearchStatus('Retrying...');
    setTimeout(() => {
      initializeGoogleMaps();
    }, 100);
  };

  const handleFiltersChange = (newFilters: typeof activeFilters) => {
    console.log('Filters changed:', newFilters);
    setActiveFilters(newFilters);
  };

  return (
    <div className="map-screen">
      {/* Universal Header */}
      <AppHeader 
        showFilter={true}
        onFilterClick={() => setShowFilters(true)}
      />

      {/* Map Container */}
      <div className="map-container">
        {/* Google Maps Container - Always render */}
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '400px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: mapInitialized ? 10 : 1,
            visibility: mapInitialized ? 'visible' : 'hidden'
          }} 
        />

        {/* Loading/Error/Fallback Overlay */}
        {(!mapInitialized || isLoading || error) && (
          <div className="map-placeholder\" style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5
          }}>
            <div className="map-grid"></div>
            
            {/* Loading State */}
            {isLoading && !error && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                zIndex: 10,
                maxWidth: '300px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  {retryCount > 0 ? `Retrying... (${retryCount}/3)` : 'Loading Map'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  {searchStatus}
                </div>
                <div style={{
                  width: '200px',
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: '60px',
                    height: '100%',
                    backgroundColor: '#14b8a6',
                    borderRadius: '2px',
                    animation: 'loading 2s ease-in-out infinite'
                  }} />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                maxWidth: '80%',
                zIndex: 10,
                border: '2px solid #f59e0b'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                  Map Notice
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '16px', color: '#6b7280' }}>
                  {error}
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '16px', color: '#059669', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '8px' }}>
                  ✅ All user-posted sales are still available!<br/>
                  📍 {filteredSales.length} total sales shown (filtered)
                </div>
                <button 
                  onClick={handleRetry}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#14b8a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Retry Map Loading
                </button>
              </div>
            )}

            {/* Fallback for when Google Maps fails to load */}
            {!isLoading && !mapInitialized && (
              <>
                {/* User Location */}
                <div className="user-location">
                  <div className="user-dot"></div>
                  <div className="radius-circle"></div>
                </div>

                {/* Fallback Sale Markers - Show FILTERED sales with correct colors */}
                {filteredSales.slice(0, 15).map((sale, index) => (
                  <div
                    key={sale.id}
                    className="sale-marker"
                    style={{
                      backgroundColor: getMarkerColor(sale.type),
                      left: `${15 + (index * 6)}%`,
                      top: `${25 + (index * 4)}%`,
                      border: sale.isUserPosted ? 'none' : '2px solid #ffffff',
                      fontSize: sale.isUserPosted ? '16px' : '14px',
                      padding: sale.isUserPosted ? '6px 8px' : '4px 6px',
                    }}
                    onClick={() => handleMarkerPress(sale)}
                  >
                    {getMarkerIcon(sale)}
                  </div>
                ))}

                {/* Status Notice */}
                <div style={{
                  position: 'absolute',
                  bottom: '140px',
                  left: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(20, 184, 166, 0.9)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  📍 Showing {filteredSales.length} filtered sales - Click markers to view details
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bottom-controls">
        <button className="recenter-button" onClick={handleRecenterClick}>
          <MapPin size={24} />
        </button>

        <button className="add-button" onClick={handleAddSaleClick}>
          <Plus size={28} />
        </button>
      </div>

      {/* Sale Card Modal */}
      {selectedSale && (
        <SaleCard
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
          onNavigate={() => openNavigation(selectedSale)}
        />
      )}

      {/* Filter Modal */}
      {showFilters && (
        <SaleFilter
          filters={activeFilters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100px); }
          50% { transform: translateX(200px); }
          100% { transform: translateX(-100px); }
        }
      `}</style>
    </div>
  );
}