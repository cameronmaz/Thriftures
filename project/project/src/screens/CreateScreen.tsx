import { useState } from 'react';
import { Camera, MapPin, Image as ImageIcon, X, Users } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import './CreateScreen.css';

export default function CreateScreen() {
  const [postType, setPostType] = useState<'own' | 'report'>('own');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saleType, setSaleType] = useState('garageSales');
  const [images, setImages] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isNeighborhoodSale, setIsNeighborhoodSale] = useState(false);
  const [neighborhoodName, setNeighborhoodName] = useState('');

  // Only allow user-postable sale types (no stores or flea markets)
  const saleTypes = [
    { id: 'garageSales', name: 'Garage Sale', color: '#14B8A6' },
    { id: 'estateSales', name: 'Estate Sale', color: '#8B5CF6' },
    { id: 'other', name: 'Other Sale', color: '#6B7280' },
  ];

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !address.trim() || !startDate || !endDate) {
      alert('❌ Missing Information\n\nPlease fill in all required fields:\n• Title\n• Description\n• Location\n• Start Date\n• End Date');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('❌ Invalid Dates\n\nEnd date must be after start date.');
      return;
    }

    if (isNeighborhoodSale && !neighborhoodName.trim()) {
      alert('❌ Missing Neighborhood Name\n\nPlease enter the neighborhood sale name.');
      return;
    }

    if (postType === 'own') {
      const saleTypeText = isNeighborhoodSale ? 'neighborhood sale' : 'sale';
      alert(`🎉 Success!\n\nYour ${saleTypeText} has been posted successfully!\n\n📍 It will appear on the map within a few minutes\n🔔 Nearby users will be notified\n📊 You can track views in your profile${isNeighborhoodSale ? '\n🏘️ Other neighbors can join this sale' : ''}`);
    } else {
      alert(`📝 Sale Reported!\n\nThank you for reporting this sale!\n\n✅ Our team will review and verify the information\n📍 It will appear on the map once approved\n🏆 You've earned community points for helping others discover sales!`);
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setImages([]);
    setAddress('');
    setStartDate('');
    setEndDate('');
    setIsNeighborhoodSale(false);
    setNeighborhoodName('');
  };

  const addSampleImage = () => {
    const sampleImages = [
      'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg',
      'https://images.pexels.com/photos/3965557/pexels-photo-3965557.jpeg',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg',
      'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg',
    ];
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    if (images.length < 5) {
      setImages([...images, randomImage]);
    } else {
      alert('📸 Photo Limit\n\nYou can add up to 5 photos per sale.');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUseCurrentLocation = () => {
    setAddress('123 Main Street, San Francisco, CA 94102');
    alert('📍 Location Set\n\nUsing your current location:\n123 Main Street, San Francisco, CA 94102\n\nYou can edit this address if needed.');
  };

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="create-screen">
      {/* Universal Header */}
      <AppHeader 
        showBackButton={true}
        subtitle="Post a Sale"
        showNotifications={false}
        showPremium={false}
      />

      <div className="content">
        {/* Submit Button */}
        <div className="submit-section">
          <button className="submit-button" onClick={handleSubmit}>
            {postType === 'own' ? 'Post Sale' : 'Report Sale'}
          </button>
        </div>

        {/* Post Type Selection */}
        <div className="section">
          <h2 className="section-title">What are you doing?</h2>
          <div className="post-type-container">
            <button
              className={`post-type-button ${postType === 'own' ? 'active' : ''}`}
              onClick={() => setPostType('own')}
            >
              <div className="post-type-icon">🏠</div>
              <div className="post-type-content">
                <h3 className="post-type-title">Hosting My Own Sale</h3>
                <p className="post-type-description">I'm organizing a garage sale, estate sale, or other personal sale</p>
              </div>
            </button>
            
            <button
              className={`post-type-button ${postType === 'report' ? 'active' : ''}`}
              onClick={() => setPostType('report')}
            >
              <div className="post-type-icon">📍</div>
              <div className="post-type-content">
                <h3 className="post-type-title">Reporting a Sale</h3>
                <p className="post-type-description">I found a sale that others should know about</p>
              </div>
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="section">
          <div style={{ 
            backgroundColor: postType === 'own' ? '#ecfdf5' : '#fef3c7', 
            padding: '16px', 
            borderRadius: '12px', 
            marginBottom: '16px',
            border: postType === 'own' ? '1px solid #d1fae5' : '1px solid #fde68a'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: postType === 'own' ? '#065f46' : '#92400e', 
              margin: 0, 
              lineHeight: '1.4',
              fontFamily: 'Inter, sans-serif'
            }}>
              {postType === 'own' ? (
                <>📝 <strong>Post Your Personal Sale</strong><br/>
                Share your garage sale, estate sale, or other personal sales with the community. 
                This will appear in your profile and you can manage it.</>
              ) : (
                <>📍 <strong>Report a Sale You Found</strong><br/>
                Help the community by reporting sales you've discovered. Our team will verify 
                the information before it appears on the map.</>
              )}
            </p>
          </div>
        </div>

        {/* Sale Type */}
        <div className="section">
          <h2 className="section-title">Sale Type</h2>
          <div className="type-container">
            {saleTypes.map((type) => (
              <button
                key={type.id}
                className={`type-button ${saleType === type.id ? 'active' : ''}`}
                style={{
                  backgroundColor: saleType === type.id ? type.color : '#F3F4F6',
                  color: saleType === type.id ? '#FFFFFF' : '#374151'
                }}
                onClick={() => setSaleType(type.id)}
              >
                {type.name}
              </button>
            ))}
          </div>
          {saleType === 'other' && (
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginTop: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Use "Other Sale" for specialty sales like art supplies, books, tools, or unique collections.
            </p>
          )}
        </div>

        {/* Neighborhood Sale Option - Only for Garage Sales and Own Posts */}
        {saleType === 'garageSales' && postType === 'own' && (
          <div className="section">
            <h2 className="section-title">Neighborhood Sale</h2>
            <div style={{ 
              backgroundColor: '#fef3c7', 
              padding: '16px', 
              borderRadius: '12px', 
              marginBottom: '16px',
              border: '1px solid #fde68a'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="checkbox"
                  id="neighborhoodSale"
                  checked={isNeighborhoodSale}
                  onChange={(e) => setIsNeighborhoodSale(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    accentColor: '#14b8a6'
                  }}
                />
                <label 
                  htmlFor="neighborhoodSale"
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#92400e',
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Users size={20} color="#92400e" />
                  This is part of a neighborhood sale
                </label>
              </div>
              <p style={{ 
                fontSize: '14px', 
                color: '#92400e', 
                margin: 0, 
                lineHeight: '1.4',
                fontFamily: 'Inter, sans-serif'
              }}>
                🏘️ <strong>Neighborhood sales</strong> allow multiple families to coordinate their garage sales on the same day/weekend. Other neighbors can join your sale and shoppers can visit multiple sales in one trip!
              </p>
            </div>

            {isNeighborhoodSale && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '6px',
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Neighborhood Sale Name *
                </label>
                <input
                  className="input"
                  placeholder="e.g., Sunset District Weekend Sale, Oak Street Neighborhood Sale"
                  value={neighborhoodName}
                  onChange={(e) => setNeighborhoodName(e.target.value)}
                />
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginTop: '6px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  This name will help other neighbors find and join your sale
                </p>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div className="section">
          <h2 className="section-title">Title *</h2>
          <input
            className="input"
            placeholder={
              postType === 'report' ? 
                "e.g., Garage sale on Oak Street" :
                isNeighborhoodSale ? 
                  "e.g., Multi-family garage sale - Oak Street Neighborhood Sale" : 
                  "e.g., Multi-family garage sale with furniture"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="section">
          <h2 className="section-title">Description *</h2>
          <textarea
            className="input textarea"
            placeholder={
              postType === 'report' ? 
                "Describe what you saw at this sale..." :
                isNeighborhoodSale ? 
                  "Describe what you're selling and mention it's part of the neighborhood sale..." : 
                  "Describe what you're selling, special items, etc."
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Dates */}
        <div className="section">
          <h2 className="section-title">Sale Dates *</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '6px',
                color: '#374151',
                fontFamily: 'Inter, sans-serif'
              }}>
                Start Date
              </label>
              <input
                type="date"
                className="input"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '6px',
                color: '#374151',
                fontFamily: 'Inter, sans-serif'
              }}>
                End Date
              </label>
              <input
                type="date"
                className="input"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="section">
          <h2 className="section-title">Photos ({images.length}/5)</h2>
          <div className="image-actions">
            <button className="image-button" onClick={addSampleImage}>
              <Camera size={20} />
              <span>Take Photo</span>
            </button>
            <button className="image-button" onClick={addSampleImage}>
              <ImageIcon size={20} />
              <span>Choose Photo</span>
            </button>
          </div>
          {images.length > 0 && (
            <div className="image-grid">
              {images.map((image, index) => (
                <div key={index} className="image-container">
                  <img src={image} alt={`Sale item ${index + 1}`} className="image" />
                  <button 
                    className="remove-button" 
                    onClick={() => removeImage(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="section">
          <h2 className="section-title">Location *</h2>
          {postType === 'own' && (
            <button className="location-button" onClick={handleUseCurrentLocation}>
              <MapPin size={20} />
              <span>Use Current Location</span>
            </button>
          )}
          <input
            className="input"
            placeholder={postType === 'report' ? "Enter the sale's address or location" : "Enter address or approximate location"}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="bottom-spacing" />
      </div>
    </div>
  );
}