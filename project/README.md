# Thriftures - Find Amazing Sales Near You

A React-based web application for discovering thrift stores, garage sales, estate sales, and other second-hand shopping opportunities using Google Maps integration.

## Features

- 🗺️ **Interactive Google Maps** - Real-time map with actual business locations
- 🏪 **Real Store Data** - Pulls thrift stores, consignment shops, and antique stores from Google Places API
- 📍 **User-Posted Sales** - Community-driven garage sales and estate sales
- 🔍 **Smart Search** - Find sales by location, items, or store type
- 💾 **Save Favorites** - Bookmark sales for later
- 📱 **Mobile-First Design** - Optimized for mobile browsing
- 🎯 **Advanced Filters** - Filter by sale type, distance, and more

## Google Maps Setup

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API (New)** - *Required for current functionality*
   - **Places API** - *Legacy API (optional for backward compatibility)*
   - **Geocoding API** (optional)
4. Create credentials (API Key)
5. Restrict your API key:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Select only the APIs you enabled

**Important**: Make sure to enable **Places API (New)** as the application uses newer Places API features that require this version. The legacy Places API alone will cause errors.

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google Maps API key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 3. Update HTML Template

Replace `YOUR_API_KEY` in `index.html` with your actual API key:

```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places&callback=initMap"></script>
```

## What the Google Maps Integration Does

### Real Business Data
- **Thrift Stores**: Goodwill, Salvation Army, Savers, etc.
- **Consignment Shops**: Crossroads Trading, Buffalo Exchange, etc.
- **Antique Stores**: Local antique malls and vintage shops
- **Specialty Stores**: Book stores, furniture stores, etc.

### Business Information
- Store names and addresses
- Phone numbers and websites
- Operating hours and current open/closed status
- Customer ratings and review counts
- Store photos (when available)

### Map Features
- Interactive Google Maps with real locations
- Custom markers for different business types
- User location detection and centering
- Click markers to view store details
- Get directions to any location

## API Costs

Google Maps APIs have usage-based pricing:
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API (New)**: $17 per 1,000 requests
- **Free tier**: $200 credit per month

For development and small-scale use, the free tier is usually sufficient.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Fallback Mode

If Google Maps API is not configured, the app falls back to:
- Mock data for demonstration
- Placeholder map with sample locations
- All other features remain functional

## Business Types Searched

The app searches for these types of businesses:
- Thrift stores and second-hand shops
- Consignment and clothing stores
- Antique stores and vintage shops
- Furniture and home goods stores
- Book stores and media shops
- Specialty stores (electronics, toys, etc.)

## Troubleshooting

### "Legacy API not enabled" Error
If you encounter an error about legacy APIs not being enabled:
1. Go to your Google Cloud Console
2. Navigate to "APIs & Services" > "Enabled APIs & Services"
3. Search for and enable "Places API (New)"
4. Ensure your API key has permissions for the new Places API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with real Google Maps API
5. Submit a pull request

## License

MIT License - see LICENSE file for details