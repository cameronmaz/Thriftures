import React, { useState, useEffect } from 'react';
import { Clock, Heart, Store, MapPin } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import SaleListItem from '../components/SaleListItem';
import SaleFilter from '../components/SaleFilter';
import SaleCard from '../components/SaleCard';
import { mockUserSales } from '../data/mockSales';
import { googleMapsService } from '../services/googleMapsService';
import { convertGooglePlaceToSale } from '../utils/placeConverter';
import { Sale } from '../types/Sale';
import './DiscoverScreen.css';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [googlePlaces, setGooglePlaces] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const categories = [
    { id: 'all', name: 'All Sales', color: '#6B7280' },
    { id: 'userPosted', name: 'Personal Sales', color: '#14B8A6' },
    { id: 'stores', name: 'Stores', color: '#8B5CF6' },
    { id: 'garageSales', name: 'Garage Sales', color: '#14B8A6' },
    { id: 'estateSales', name: 'Estate Sales', color: '#8B5CF6' },
    { id: 'other', name: 'Other Sales', color: '#6B7280' },
  ];

  useEffect(() => {
    // Load Google Places data when component mounts
    loadGooglePlaces();
  }, []);

  const loadGooglePlaces = async () => {
    try {
      // Check if API key is configured
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        console.warn('Google Maps API key not configured, skipping store data');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Initialize Google Maps service (hidden map for data only)
      const hiddenMapElement = document.createElement('div');
      hiddenMapElement.style.display = 'none';
      document.body.appendChild(hiddenMapElement);
      
      try {
        await googleMapsService.initializeMap(hiddenMapElement);
        
        // Search for nearby places with enhanced error handling
        const places = await googleMapsService.searchNearbyThriftStores(12000); // 12km radius
        
        if (places.length === 0) {
          console.warn('No places found, but this is not an error');
          setError('No stores found in your area. Try expanding your search or check back later.');
          setGooglePlaces([]);
          return;
        }
        
        // Convert to Sale objects (limit to avoid quota issues)
        const salesFromPlaces: Sale[] = [];
        for (let i = 0; i < Math.min(places.length, 5); i++) { // Reduced to 5 to minimize API calls
          const place = places[i];
          try {
            const details = await googleMapsService.getPlaceDetails(place.place_id);
            const sale = convertGooglePlaceToSale(place, details);
            salesFromPlaces.push(sale);
            
            // Delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch (error) {
            console.warn('Failed to get details for place:', place.name);
            const sale = convertGooglePlaceToSale(place);
            salesFromPlaces.push(sale);
          }
        }
        
        setGooglePlaces(salesFromPlaces);
        console.log(`Successfully loaded ${salesFromPlaces.length} stores`);
      } finally {
        // Clean up hidden element
        document.body.removeChild(hiddenMapElement);
      }
    } catch (error) {
      console.error('Failed to load Google Places:', error);
      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          setError('Google Places API quota exceeded. Showing user-posted sales only.');
        } else if (error.message.includes('denied')) {
          setError('Unable to access store data. Showing user-posted sales only.');
        } else {
          setError('Failed to load store data. Showing user-posted sales only.');
        }
      } else {
        setError('Failed to load store data. Showing user-posted sales only.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSales = allSales.filter(sale => {
    const matchesSearch = sale.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory === 'userPosted') {
      matchesCategory = sale.isUserPosted;
    } else if (selectedCategory === 'stores') {
      matchesCategory = !sale.isUserPosted;
    } else if (selectedCategory !== 'all') {
      matchesCategory = sale.type === selectedCategory;
    }
    
    const matchesFilter = activeFilters[sale.type as keyof typeof activeFilters];
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const recentSales = mockUserSales.filter(sale => {
    const saleDate = new Date(sale.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - saleDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  });

  const upcomingSales = mockUserSales.filter(sale => {
    const saleDate = new Date(sale.startDate);
    const now = new Date();
    return saleDate > now;
  });

  const nearbyStores = googlePlaces.slice(0, 3);

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const openNavigation = (sale: Sale) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${sale.latitude},${sale.longitude}`;
    window.open(url, '_blank');
  };

  const handleFiltersChange = (newFilters: typeof activeFilters) => {
    console.log('Discover filters changed:', newFilters);
    setActiveFilters(newFilters);
  };

  return (
    <div className="discover-screen">
      {/* Universal Header */}
      <AppHeader 
        showFilter={true}
        showSearch={true}
        onFilterClick={() => setShowFilters(true)}
      />

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search sales, items, locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="categories-container">
        <div className="categories-scroll">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : '#F3F4F6',
                color: selectedCategory === category.id ? '#FFFFFF' : '#374151'
              }}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="content">
        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            🔍 Loading nearby stores...
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#059669',
            fontSize: '14px',
            backgroundColor: '#ecfdf5',
            margin: '16px 20px',
            borderRadius: '8px',
            border: '1px solid #d1fae5'
          }}>
            ℹ️ {error}
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#065f46' }}>
              ✅ {mockUserSales.length} user-posted sales are still available!
            </div>
          </div>
        )}

        {/* Recent Sales */}
        {recentSales.length > 0 && selectedCategory === 'all' && (
          <div className="section">
            <div className="section-header">
              <Clock size={20} color="#F97316" />
              <h2 className="section-title">Happening Now</h2>
            </div>
            {recentSales.slice(0, 3).map((sale) => (
              <div key={sale.id} onClick={() => handleSaleClick(sale)}>
                <SaleListItem sale={sale} />
              </div>
            ))}
          </div>
        )}

        {/* Nearby Stores */}
        {nearbyStores.length > 0 && (selectedCategory === 'all' || selectedCategory === 'stores') && (
          <div className="section">
            <div className="section-header">
              <Store size={20} color="#8B5CF6" />
              <h2 className="section-title">Nearby Stores & Markets</h2>
            </div>
            {nearbyStores.map((store) => (
              <div key={store.id} onClick={() => handleSaleClick(store)}>
                <SaleListItem sale={store} />
              </div>
            ))}
          </div>
        )}

        {/* Upcoming Sales */}
        {upcomingSales.length > 0 && (selectedCategory === 'all' || selectedCategory === 'userPosted') && (
          <div className="section">
            <div className="section-header">
              <MapPin size={20} color="#14B8A6" />
              <h2 className="section-title">Upcoming Personal Sales</h2>
            </div>
            {upcomingSales.map((sale) => (
              <div key={sale.id} onClick={() => handleSaleClick(sale)}>
                <SaleListItem sale={sale} />
              </div>
            ))}
          </div>
        )}

        {/* All Sales */}
        <div className="section">
          <div className="section-header">
            <Heart size={20} color="#EF4444" />
            <h2 className="section-title">
              {selectedCategory === 'userPosted' ? 'Personal Sales' : 
               selectedCategory === 'stores' ? 'All Stores & Markets' : 'All Sales Near You'}
            </h2>
          </div>
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <div key={sale.id} onClick={() => handleSaleClick(sale)}>
                <SaleListItem sale={sale} />
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No sales found
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {searchQuery ? 
                  `No sales match "${searchQuery}". Try a different search term.` :
                  'No sales match your current filters. Try adjusting your filters or check back later.'
                }
              </div>
            </div>
          )}
        </div>

        <div className="bottom-spacing" />
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
    </div>
  );
}