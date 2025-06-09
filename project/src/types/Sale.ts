export interface Sale {
  id: string;
  title: string;
  description: string;
  type: 'garageSales' | 'estateSales' | 'thriftStores' | 'fleaMarkets' | 'consignmentShops' | 'other';
  latitude: number;
  longitude: number;
  address: string;
  startDate: string;
  endDate: string;
  images?: string[];
  postedBy: string;
  postedAt: string;
  likes: number;
  comments: number;
  isUserPosted: boolean; // true for user posts, false for stores from Maps API
  
  // Store-specific fields (only for stores from Maps API)
  storeHours?: string;
  phone?: string;
  website?: string;
  rating?: number; // Google rating for stores
  
  // Neighborhood sale fields (only for garage sales)
  isNeighborhoodSale?: boolean;
  neighborhoodSaleName?: string;
}