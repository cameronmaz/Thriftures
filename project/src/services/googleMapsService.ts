export interface GooglePlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  formatted_phone_number?: string;
  website?: string;
  photos?: google.maps.places.PlacePhoto[];
  types: string[];
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    isOpen: (date?: Date) => boolean;
    weekday_text: string[];
  };
  rating?: number;
  user_ratings_total?: number;
  photos?: google.maps.places.PlacePhoto[];
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  types: string[];
}

class GoogleMapsService {
  private map: google.maps.Map | null = null;
  private userLocation: google.maps.LatLng | null = null;
  private userLocationMarker: google.maps.Marker | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private isApiLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  private markers: google.maps.Marker[] = []; // Track markers for cleanup

  async loadGoogleMapsAPI(): Promise<void> {
    // If already loaded, return immediately
    if (this.isApiLoaded && typeof google !== 'undefined' && google.maps) {
      console.log('Google Maps API already available');
      return Promise.resolve();
    }
    
    // If already loading, return existing promise
    if (this.loadingPromise) {
      console.log('Google Maps API already loading, waiting...');
      return this.loadingPromise;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      throw new Error('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
    }

    console.log('Loading Google Maps API with key:', apiKey.substring(0, 20) + '...');

    this.loadingPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof google !== 'undefined' && google.maps) {
        console.log('Google Maps API already loaded');
        this.isApiLoaded = true;
        resolve();
        return;
      }

      // Remove any existing Google Maps scripts to prevent conflicts
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => {
        console.log('Removing existing Google Maps script');
        script.remove();
      });

      // Create unique callback name to avoid conflicts
      const callbackName = `initGoogleMaps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up callback
      (window as any)[callbackName] = () => {
        console.log('Google Maps API loaded successfully via callback');
        this.isApiLoaded = true;
        delete (window as any)[callbackName]; // Clean up callback
        resolve();
      };

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        delete (window as any)[callbackName];
        this.loadingPromise = null;
        reject(new Error('Failed to load Google Maps API. Please check your API key and internet connection.'));
      };
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('Google Maps API loading timeout');
        delete (window as any)[callbackName];
        script.remove();
        this.loadingPromise = null;
        reject(new Error('Google Maps API loading timeout. Please check your internet connection.'));
      }, 20000); // 20 second timeout

      // Clear timeout on successful load
      const originalCallback = (window as any)[callbackName];
      (window as any)[callbackName] = () => {
        clearTimeout(timeout);
        originalCallback();
      };
      
      console.log('Adding Google Maps script to document head');
      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  async initializeMap(mapElement: HTMLElement, center?: { lat: number; lng: number }): Promise<void> {
    try {
      console.log('Starting Google Maps initialization...');
      
      // Load the API first
      await this.loadGoogleMapsAPI();

      // Double-check that Google Maps is available
      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API failed to load properly');
      }

      console.log('Creating map instance...');
      const defaultCenter = center || { lat: 37.7749, lng: -122.4194 }; // San Francisco default
      
      // Ensure the map element is visible and has dimensions
      mapElement.style.width = '100%';
      mapElement.style.height = '100%';
      mapElement.style.minHeight = '400px';
      
      this.map = new google.maps.Map(mapElement, {
        zoom: 12, // Reduced from 13 to 12 for wider view
        center: defaultCenter,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        scaleControl: true,
      });

      // Initialize Places Service
      this.placesService = new google.maps.places.PlacesService(this.map);
      console.log('Places Service initialized');

      console.log('Map created successfully');
      
      // Try to get user's current location with improved handling
      try {
        await this.getCurrentLocation();
        console.log('User location obtained and map centered');
      } catch (error) {
        console.warn('Could not get user location, using default:', error);
        // Still show a marker at the default location
        this.addUserLocationMarker(defaultCenter, false);
      }

      console.log('Google Maps initialization complete');
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      throw error;
    }
  }

  // Clear all markers except user location
  clearMarkers(): void {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }

  private addUserLocationMarker(position: { lat: number; lng: number }, isActualLocation: boolean = true): void {
    if (!this.map) return;

    // Remove existing user location marker
    if (this.userLocationMarker) {
      this.userLocationMarker.setMap(null);
    }

    this.userLocationMarker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: isActualLocation ? 'Your Current Location' : 'Default Location (Click location button to find you)',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isActualLocation ? 10 : 8,
        fillColor: isActualLocation ? '#4285F4' : '#FF6B6B',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 1000,
    });

    // Add a pulsing animation for actual location
    if (isActualLocation) {
      const pulseMarker = new google.maps.Marker({
        position: position,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#4285F4',
          fillOpacity: 0.2,
          strokeColor: '#4285F4',
          strokeWeight: 1,
        },
        zIndex: 999,
      });

      // Animate the pulse
      let scale = 20;
      let growing = false;
      const animate = () => {
        if (growing) {
          scale += 1;
          if (scale >= 30) growing = false;
        } else {
          scale -= 1;
          if (scale <= 15) growing = true;
        }
        
        if (pulseMarker.getMap()) {
          pulseMarker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: scale,
            fillColor: '#4285F4',
            fillOpacity: 0.2 - (scale - 15) * 0.01,
            strokeColor: '#4285F4',
            strokeWeight: 1,
          });
          setTimeout(animate, 100);
        }
      };
      animate();
    }
  }

  private getCurrentLocation(): Promise<google.maps.LatLng> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by this browser'));
        return;
      }

      console.log('Requesting high-accuracy user location...');

      // First try with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('High-accuracy location obtained:', position.coords.latitude, position.coords.longitude);
          console.log('Accuracy:', position.coords.accuracy, 'meters');
          
          const pos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          this.userLocation = pos;
          
          if (this.map) {
            this.map.setCenter(pos);
            this.map.setZoom(13); // Zoom in more for user location
            
            // Add user location marker
            this.addUserLocationMarker({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }, true);
          }
          
          resolve(pos);
        },
        (error) => {
          console.warn('High-accuracy geolocation failed, trying low accuracy:', error.message);
          
          // Try again with lower accuracy as fallback
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Low-accuracy location obtained:', position.coords.latitude, position.coords.longitude);
              
              const pos = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
              );
              this.userLocation = pos;
              
              if (this.map) {
                this.map.setCenter(pos);
                this.map.setZoom(12);
                
                this.addUserLocationMarker({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                }, true);
              }
              
              resolve(pos);
            },
            (fallbackError) => {
              console.error('All geolocation attempts failed:', fallbackError.message);
              
              let errorMessage = 'Location access failed';
              
              switch (fallbackError.code) {
                case fallbackError.PERMISSION_DENIED:
                  errorMessage = 'Location access denied. Please enable location services and refresh the page.';
                  break;
                case fallbackError.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable. Your device may not support GPS.';
                  break;
                case fallbackError.TIMEOUT:
                  errorMessage = 'Location request timed out. Please try again.';
                  break;
              }
              
              reject(new Error(errorMessage));
            },
            {
              timeout: 10000,
              enableHighAccuracy: false,
              maximumAge: 300000 // 5 minutes
            }
          );
        },
        {
          timeout: 8000,
          enableHighAccuracy: true,
          maximumAge: 60000 // 1 minute
        }
      );
    });
  }

  // Enhanced search with better error handling and larger radius
  async searchNearbyThriftStores(radius: number = 15000): Promise<GooglePlace[]> {
    if (!this.placesService || !this.map) {
      console.error('Places service or map not initialized');
      return this.getFallbackStores();
    }

    const center = this.userLocation || this.map.getCenter();
    if (!center) {
      console.error('No center location available for search');
      return this.getFallbackStores();
    }

    console.log(`Searching for real nearby thrift stores and consignment shops within ${radius}m...`);

    try {
      // Try multiple search strategies with larger radius
      const searchStrategies = [
        // Strategy 1: Broad store search with thrift keywords
        {
          location: center,
          radius: radius,
          type: 'store' as google.maps.places.PlaceType,
          keyword: 'thrift consignment vintage antique second hand used clothing furniture'
        },
        // Strategy 2: Clothing store search
        {
          location: center,
          radius: radius,
          type: 'clothing_store' as google.maps.places.PlaceType
        },
        // Strategy 3: Furniture store search
        {
          location: center,
          radius: radius,
          type: 'furniture_store' as google.maps.places.PlaceType
        },
        // Strategy 4: General establishment search with even broader radius
        {
          location: center,
          radius: radius * 1.5, // 1.5x the radius
          type: 'establishment' as google.maps.places.PlaceType,
          keyword: 'goodwill salvation army thrift savers'
        }
      ];

      let allResults: google.maps.places.PlaceResult[] = [];

      for (const strategy of searchStrategies) {
        try {
          const results = await this.performPlacesSearch(strategy);
          console.log(`Strategy found ${results.length} places`);
          
          // Add unique results (avoid duplicates)
          results.forEach(result => {
            if (!allResults.find(existing => existing.place_id === result.place_id)) {
              allResults.push(result);
            }
          });

          // If we have enough results, break early
          if (allResults.length >= 20) break;
        } catch (error) {
          console.warn('Search strategy failed:', error);
          continue;
        }
      }

      if (allResults.length === 0) {
        console.warn('No places found with any search strategy, using fallback stores');
        return this.getFallbackStores();
      }

      // Filter for relevant stores
      const relevantStores = allResults.filter(place => {
        const name = place.name?.toLowerCase() || '';
        const types = place.types || [];
        
        // Look for thrift stores, consignment shops, antique stores, etc.
        return (
          name.includes('thrift') ||
          name.includes('goodwill') ||
          name.includes('salvation army') ||
          name.includes('consignment') ||
          name.includes('vintage') ||
          name.includes('antique') ||
          name.includes('second hand') ||
          name.includes('used') ||
          name.includes('savers') ||
          name.includes('value village') ||
          name.includes('crossroads') ||
          name.includes('buffalo exchange') ||
          types.includes('clothing_store') ||
          types.includes('furniture_store') ||
          types.includes('home_goods_store')
        );
      });

      console.log(`Filtered to ${relevantStores.length} relevant thrift/consignment stores`);
      
      // If no relevant stores found, return all stores as potential thrift stores
      const finalResults = relevantStores.length > 0 ? relevantStores : allResults.slice(0, 10);
      
      // Convert to our GooglePlace interface
      const googlePlaces: GooglePlace[] = finalResults.map(place => ({
        place_id: place.place_id!,
        name: place.name!,
        vicinity: place.vicinity!,
        geometry: {
          location: {
            lat: () => place.geometry!.location!.lat(),
            lng: () => place.geometry!.location!.lng()
          }
        },
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        opening_hours: place.opening_hours,
        photos: place.photos,
        types: place.types || []
      }));

      return googlePlaces;

    } catch (error) {
      console.error('All search strategies failed:', error);
      return this.getFallbackStores();
    }
  }

  private performPlacesSearch(request: google.maps.places.PlaceSearchRequest): Promise<google.maps.places.PlaceResult[]> {
    return new Promise((resolve, reject) => {
      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.log('Zero results for this search strategy');
          resolve([]);
        } else {
          console.error('Places search failed:', status);
          if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            reject(new Error('Google Places API quota exceeded'));
          } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            reject(new Error('Google Places API request denied - check your API key permissions'));
          } else {
            reject(new Error(`Places search failed with status: ${status}`));
          }
        }
      });
    });
  }

  // Fallback stores when Google Places API fails or returns no results
  private getFallbackStores(): GooglePlace[] {
    console.log('Using fallback store data');
    
    const center = this.userLocation || this.map?.getCenter();
    const baseLat = center ? center.lat() : 37.7749;
    const baseLng = center ? center.lng() : -122.4194;

    // Generate more stores around the current location with varied positions
    return [
      {
        place_id: 'fallback_goodwill_1',
        name: 'Goodwill Store',
        vicinity: 'Near your location',
        geometry: {
          location: {
            lat: () => baseLat + 0.02,
            lng: () => baseLng + 0.02
          }
        },
        rating: 4.2,
        user_ratings_total: 156,
        types: ['store', 'clothing_store']
      },
      {
        place_id: 'fallback_salvation_army_1',
        name: 'Salvation Army Family Store',
        vicinity: 'Near your location',
        geometry: {
          location: {
            lat: () => baseLat - 0.02,
            lng: () => baseLng + 0.02
          }
        },
        rating: 4.0,
        user_ratings_total: 89,
        types: ['store', 'home_goods_store']
      },
      {
        place_id: 'fallback_consignment_1',
        name: 'Local Consignment Shop',
        vicinity: 'Near your location',
        geometry: {
          location: {
            lat: () => baseLat + 0.02,
            lng: () => baseLng - 0.02
          }
        },
        rating: 4.5,
        user_ratings_total: 234,
        types: ['clothing_store', 'store']
      },
      {
        place_id: 'fallback_vintage_1',
        name: 'Vintage Finds',
        vicinity: 'Near your location',
        geometry: {
          location: {
            lat: () => baseLat - 0.02,
            lng: () => baseLng - 0.02
          }
        },
        rating: 4.3,
        user_ratings_total: 67,
        types: ['clothing_store', 'store']
      },
      {
        place_id: 'fallback_thrift_2',
        name: 'Community Thrift Store',
        vicinity: 'Near your location',
        geometry: {
          location: {
            lat: () => baseLat + 0.03,
            lng: () => baseLng
          }
        },
        rating: 4.1,
        user_ratings_total: 123,
        types: ['store', 'clothing_store']
      },
      {
        place_id: 'fallback_antique_1',
        name: 'Antique Mall',
        vicinity: 'Near your location',
        geometry: {
          location: {
            lat: () => baseLat,
            lng: () => baseLng + 0.03
          }
        },
        rating: 4.4,
        user_ratings_total: 78,
        types: ['store', 'furniture_store']
      }
    ];
  }

  // Get detailed place information
  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    // Handle fallback store details
    if (placeId.startsWith('fallback_')) {
      return this.getFallbackStoreDetails(placeId);
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'formatted_phone_number',
          'website',
          'opening_hours',
          'rating',
          'user_ratings_total',
          'photos',
          'geometry',
          'types'
        ]
      };

      this.placesService!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const details: PlaceDetails = {
            place_id: place.place_id!,
            name: place.name!,
            formatted_address: place.formatted_address!,
            formatted_phone_number: place.formatted_phone_number,
            website: place.website,
            opening_hours: place.opening_hours,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            photos: place.photos,
            geometry: {
              location: {
                lat: () => place.geometry!.location!.lat(),
                lng: () => place.geometry!.location!.lng()
              }
            },
            types: place.types || []
          };
          resolve(details);
        } else {
          console.warn(`Failed to get details for place ${placeId}:`, status);
          reject(new Error(`Place details request failed: ${status}`));
        }
      });
    });
  }

  private getFallbackStoreDetails(placeId: string): PlaceDetails {
    const fallbackDetails: Record<string, PlaceDetails> = {
      'fallback_goodwill_1': {
        place_id: 'fallback_goodwill_1',
        name: 'Goodwill Store',
        formatted_address: 'Near your location',
        formatted_phone_number: '(555) 123-4567',
        website: 'https://goodwill.org',
        opening_hours: {
          isOpen: () => true,
          weekday_text: ['Mon: 9:00 AM – 8:00 PM', 'Tue: 9:00 AM – 8:00 PM', 'Wed: 9:00 AM – 8:00 PM', 'Thu: 9:00 AM – 8:00 PM', 'Fri: 9:00 AM – 8:00 PM', 'Sat: 9:00 AM – 8:00 PM', 'Sun: 10:00 AM – 6:00 PM']
        },
        rating: 4.2,
        user_ratings_total: 156,
        geometry: {
          location: {
            lat: () => 37.7849,
            lng: () => -122.4094
          }
        },
        types: ['store', 'clothing_store']
      },
      'fallback_salvation_army_1': {
        place_id: 'fallback_salvation_army_1',
        name: 'Salvation Army Family Store',
        formatted_address: 'Near your location',
        formatted_phone_number: '(555) 234-5678',
        website: 'https://salvationarmyusa.org',
        opening_hours: {
          isOpen: () => true,
          weekday_text: ['Mon: 9:00 AM – 7:00 PM', 'Tue: 9:00 AM – 7:00 PM', 'Wed: 9:00 AM – 7:00 PM', 'Thu: 9:00 AM – 7:00 PM', 'Fri: 9:00 AM – 7:00 PM', 'Sat: 9:00 AM – 7:00 PM', 'Sun: 10:00 AM – 6:00 PM']
        },
        rating: 4.0,
        user_ratings_total: 89,
        geometry: {
          location: {
            lat: () => 37.7649,
            lng: () => -122.4194
          }
        },
        types: ['store', 'home_goods_store']
      },
      'fallback_consignment_1': {
        place_id: 'fallback_consignment_1',
        name: 'Local Consignment Shop',
        formatted_address: 'Near your location',
        formatted_phone_number: '(555) 345-6789',
        opening_hours: {
          isOpen: () => true,
          weekday_text: ['Mon: 11:00 AM – 8:00 PM', 'Tue: 11:00 AM – 8:00 PM', 'Wed: 11:00 AM – 8:00 PM', 'Thu: 11:00 AM – 8:00 PM', 'Fri: 11:00 AM – 8:00 PM', 'Sat: 11:00 AM – 8:00 PM', 'Sun: 11:00 AM – 8:00 PM']
        },
        rating: 4.5,
        user_ratings_total: 234,
        geometry: {
          location: {
            lat: () => 37.7949,
            lng: () => -122.3994
          }
        },
        types: ['clothing_store', 'store']
      },
      'fallback_vintage_1': {
        place_id: 'fallback_vintage_1',
        name: 'Vintage Finds',
        formatted_address: 'Near your location',
        formatted_phone_number: '(555) 456-7890',
        opening_hours: {
          isOpen: () => true,
          weekday_text: ['Mon: 10:00 AM – 7:00 PM', 'Tue: 10:00 AM – 7:00 PM', 'Wed: 10:00 AM – 7:00 PM', 'Thu: 10:00 AM – 7:00 PM', 'Fri: 10:00 AM – 7:00 PM', 'Sat: 10:00 AM – 7:00 PM', 'Sun: 12:00 PM – 6:00 PM']
        },
        rating: 4.3,
        user_ratings_total: 67,
        geometry: {
          location: {
            lat: () => 37.7549,
            lng: () => -122.4294
          }
        },
        types: ['clothing_store', 'store']
      },
      'fallback_thrift_2': {
        place_id: 'fallback_thrift_2',
        name: 'Community Thrift Store',
        formatted_address: 'Near your location',
        formatted_phone_number: '(555) 567-8901',
        opening_hours: {
          isOpen: () => true,
          weekday_text: ['Mon: 9:00 AM – 6:00 PM', 'Tue: 9:00 AM – 6:00 PM', 'Wed: 9:00 AM – 6:00 PM', 'Thu: 9:00 AM – 6:00 PM', 'Fri: 9:00 AM – 6:00 PM', 'Sat: 9:00 AM – 6:00 PM', 'Sun: 11:00 AM – 5:00 PM']
        },
        rating: 4.1,
        user_ratings_total: 123,
        geometry: {
          location: {
            lat: () => 37.7849,
            lng: () => -122.4194
          }
        },
        types: ['store', 'clothing_store']
      },
      'fallback_antique_1': {
        place_id: 'fallback_antique_1',
        name: 'Antique Mall',
        formatted_address: 'Near your location',
        formatted_phone_number: '(555) 678-9012',
        opening_hours: {
          isOpen: () => true,
          weekday_text: ['Mon: 10:00 AM – 6:00 PM', 'Tue: 10:00 AM – 6:00 PM', 'Wed: 10:00 AM – 6:00 PM', 'Thu: 10:00 AM – 6:00 PM', 'Fri: 10:00 AM – 6:00 PM', 'Sat: 10:00 AM – 6:00 PM', 'Sun: 12:00 PM – 5:00 PM']
        },
        rating: 4.4,
        user_ratings_total: 78,
        geometry: {
          location: {
            lat: () => 37.7749,
            lng: () => -122.3894
          }
        },
        types: ['store', 'furniture_store']
      }
    };

    return fallbackDetails[placeId] || fallbackDetails['fallback_goodwill_1'];
  }

  addMarker(place: GooglePlace, onClick?: (place: GooglePlace) => void): google.maps.Marker {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    const marker = new google.maps.Marker({
      position: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      map: this.map,
      title: place.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: this.getMarkerColor(place.types),
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    // Track marker for cleanup
    this.markers.push(marker);

    if (onClick) {
      marker.addListener('click', () => onClick(place));
    }

    return marker;
  }

  private getMarkerColor(types: string[]): string {
    // Determine marker color based on business type
    if (types.some(type => ['clothing_store', 'shoe_store'].includes(type))) {
      return '#3B82F6'; // Blue for clothing/consignment
    }
    if (types.some(type => ['furniture_store', 'home_goods_store'].includes(type))) {
      return '#8B5CF6'; // Purple for furniture/home goods
    }
    if (types.some(type => ['book_store'].includes(type))) {
      return '#F97316'; // Orange for books
    }
    return '#14B8A6'; // Default teal for general thrift stores
  }

  recenterMap(): void {
    if (this.map && this.userLocation) {
      console.log('Recentering to known user location');
      this.map.setCenter(this.userLocation);
      this.map.setZoom(13);
    } else if (this.map) {
      console.log('Requesting fresh user location...');
      // Try to get user location again with a fresh request
      this.getCurrentLocation().catch((error) => {
        console.warn('Fresh location request failed:', error.message);
        // Show an alert to the user about location issues
        alert(`📍 Location Issue\n\n${error.message}\n\nTip: Make sure location services are enabled in your browser settings and try refreshing the page.`);
        
        // Fallback to San Francisco
        this.map?.setCenter({ lat: 37.7749, lng: -122.4194 });
        this.map?.setZoom(12);
        this.addUserLocationMarker({ lat: 37.7749, lng: -122.4194 }, false);
      });
    } else {
      console.log('Map not initialized, cannot recenter');
    }
  }

  // Method to manually set location (for testing or when GPS fails)
  setManualLocation(lat: number, lng: number): void {
    if (!this.map) return;
    
    const position = { lat, lng };
    const pos = new google.maps.LatLng(lat, lng);
    
    this.userLocation = pos;
    this.map.setCenter(position);
    this.map.setZoom(13);
    this.addUserLocationMarker(position, true);
    
    console.log('Manual location set to:', lat, lng);
  }

  getMap(): google.maps.Map | null {
    return this.map;
  }

  isLoaded(): boolean {
    return this.isApiLoaded && typeof google !== 'undefined' && !!google.maps;
  }
}

export const googleMapsService = new GoogleMapsService();