import { GooglePlace, PlaceDetails } from '../services/googleMapsService';
import { Sale } from '../types/Sale';

export function convertGooglePlaceToSale(place: GooglePlace, details?: PlaceDetails): Sale {
  const saleType = determineSaleType(place.types, place.name);
  const storeHours = details?.opening_hours?.weekday_text?.join(', ') || 'Hours not available';
  
  return {
    id: `google_${place.place_id}`,
    title: place.name,
    description: generateDescription(place, details),
    type: saleType,
    latitude: place.geometry.location.lat(),
    longitude: place.geometry.location.lng(),
    address: details?.formatted_address || place.vicinity,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    images: extractImages(place.photos || details?.photos),
    postedBy: place.name,
    postedAt: new Date().toISOString(),
    likes: Math.floor((place.rating || 4) * 20), // Convert rating to likes
    comments: place.user_ratings_total || 50, // Use actual review count
    isUserPosted: false,
    storeHours: storeHours,
    phone: details?.formatted_phone_number,
    website: details?.website,
    rating: place.rating || 4.5, // Add the actual Google rating
  };
}

function determineSaleType(types: string[], name: string): Sale['type'] {
  const nameAndTypes = [...types, name.toLowerCase()].join(' ');
  
  // Check for thrift stores first (most common)
  if (nameAndTypes.includes('thrift') || 
      nameAndTypes.includes('goodwill') || 
      nameAndTypes.includes('salvation army') ||
      nameAndTypes.includes('savers') ||
      nameAndTypes.includes('value village') ||
      nameAndTypes.includes('community thrift')) {
    return 'thriftStores';
  }
  
  // Check for consignment shops
  if (nameAndTypes.includes('consignment') ||
      nameAndTypes.includes('crossroads') ||
      nameAndTypes.includes('buffalo exchange') ||
      nameAndTypes.includes('platos closet') ||
      (types.includes('clothing_store') && 
       (nameAndTypes.includes('second hand') || nameAndTypes.includes('used')))) {
    return 'consignmentShops';
  }
  
  // Check for antique stores and vintage shops
  if (nameAndTypes.includes('antique') ||
      nameAndTypes.includes('vintage') ||
      nameAndTypes.includes('collectible')) {
    return 'other'; // We'll use 'other' for antique stores
  }
  
  // Check for flea markets
  if (nameAndTypes.includes('flea market') ||
      nameAndTypes.includes('farmers market') ||
      nameAndTypes.includes('swap meet')) {
    return 'fleaMarkets';
  }
  
  // Check for furniture stores that might be thrift-like
  if (types.includes('furniture_store') && 
      (nameAndTypes.includes('used') || nameAndTypes.includes('second hand'))) {
    return 'thriftStores';
  }
  
  // Check for general clothing stores that might be consignment
  if (types.includes('clothing_store')) {
    return 'consignmentShops';
  }
  
  // Check for home goods stores
  if (types.includes('home_goods_store') || types.includes('furniture_store')) {
    return 'thriftStores'; // Most furniture/home goods stores in this context are thrift-like
  }
  
  // Default to thrift stores for general stores
  return 'thriftStores';
}

function generateDescription(place: GooglePlace, details?: PlaceDetails): string {
  const rating = place.rating ? `${place.rating} stars` : 'No rating';
  const reviewCount = place.user_ratings_total ? `${place.user_ratings_total} reviews` : 'No reviews';
  
  let openStatus = 'Hours vary';
  
  // Use the new isOpen() method instead of deprecated open_now
  try {
    if (details?.opening_hours?.isOpen) {
      openStatus = details.opening_hours.isOpen() ? 'Currently open' : 'Currently closed';
    }
  } catch (error) {
    // If isOpen() method fails, fall back to default
    openStatus = 'Hours vary';
  }
  
  let description = `${rating} • ${reviewCount} • ${openStatus}`;
  
  // Add business type specific description
  const types = place.types.join(' ');
  if (types.includes('clothing_store')) {
    description += '\n\nSpecializing in clothing, shoes, and accessories.';
  } else if (types.includes('furniture_store')) {
    description += '\n\nFurniture, home decor, and household items.';
  } else if (types.includes('book_store')) {
    description += '\n\nBooks, media, and educational materials.';
  } else {
    description += '\n\nGeneral merchandise, clothing, household items, and more.';
  }
  
  return description;
}

function extractImages(photos?: any[]): string[] {
  if (!photos || photos.length === 0) {
    return [];
  }
  
  // Get up to 3 photos
  return photos.slice(0, 3).map(photo => 
    photo.getUrl({ maxWidth: 600, maxHeight: 400 })
  );
}