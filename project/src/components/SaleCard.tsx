import React, { useState } from 'react';
import { X, MapPin, Calendar, Navigation, Heart, MessageSquare, Star, User, Share, Clock, Phone, Globe, Users, Expand, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sale } from '../types/Sale';
import './SaleCard.css';

interface SaleCardProps {
  sale: Sale;
  onClose: () => void;
  onNavigate: () => void;
}

export default function SaleCard({ sale, onClose, onNavigate }: SaleCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(sale.likes);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getSaleTypeColor = (type: string): string => {
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

  const getSaleTypeName = (type: string): string => {
    switch (type) {
      case 'garageSales': return 'Garage Sale';
      case 'estateSales': return 'Estate Sale';
      case 'thriftStores': return 'Thrift Store';
      case 'fleaMarkets': return 'Flea Market';
      case 'consignmentShops': return 'Consignment Shop';
      case 'other': return 'Other Sale';
      default: return 'Sale';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    alert(isSaved ? '💔 Removed from saved sales' : '❤️ Saved to your collection!');
  };

  const handleComment = () => {
    if (sale.isUserPosted) {
      alert('💬 Comments\n\nThis would open the comments section where you can:\n• Ask questions about items\n• Get more details\n• Connect with the seller');
    } else {
      alert('💬 Store Reviews\n\nThis would show customer reviews and ratings for this store.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: sale.title,
        text: sale.description,
        url: window.location.href,
      });
    } else {
      alert('📤 Share Sale\n\nShare this sale with friends:\n• Copy link\n• Send via text\n• Post on social media\n\nFeature coming soon!');
    }
  };

  const handlePhoneCall = () => {
    if (sale.phone) {
      window.open(`tel:${sale.phone}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (sale.website) {
      window.open(sale.website, '_blank');
    }
  };

  const handleNeighborhoodSaleInfo = () => {
    alert(`🏘️ Neighborhood Sale\n\n"${sale.neighborhoodSaleName}"\n\nThis garage sale is part of a coordinated neighborhood event! Multiple families are participating, so you can visit several sales in the same area.\n\n📍 Look for other sales with the same neighborhood name\n🗓️ All happening on the same dates\n🚶‍♀️ Perfect for walking between sales`);
  };

  const handleImageClick = () => {
    if (sale.images && sale.images.length > 0) {
      setCurrentImageIndex(0);
      setShowImageViewer(true);
    }
  };

  const handleImageViewerClose = () => {
    setShowImageViewer(false);
  };

  const handlePrevImage = () => {
    if (sale.images && sale.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? sale.images!.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (sale.images && sale.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === sale.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <div className="sale-card-overlay" onClick={onClose}>
        <div className="sale-card" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="card-header">
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
            <button className="save-button" onClick={handleSave}>
              <Heart size={24} color="#EF4444" fill={isSaved ? "#EF4444" : "none"} />
            </button>
          </div>

          <div className="card-content">
            {/* IMAGES WITH PROPER PADDING AND EXPANSION */}
            {sale.images && sale.images.length > 0 && (
              <div className="image-container\" onClick={handleImageClick}>
                <div className={`images-grid ${sale.images.length === 1 ? 'single-image' : 'multiple-images'}`}>
                  {sale.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image} alt={`${sale.title} ${index + 1}`} className="card-image" />
                    </div>
                  ))}
                </div>
                
                {/* Show image counter if more than 1 image */}
                {sale.images.length > 1 && (
                  <div className="image-counter">
                    {sale.images.length > 3 ? `3+ photos` : `${sale.images.length} photos`}
                  </div>
                )}

                {/* Expand icon to indicate clickable */}
                <div className="expand-overlay">
                  <Expand size={16} />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="content-container">
              {/* Sale Type Badge */}
              <div 
                className="type-badge"
                style={{ backgroundColor: getSaleTypeColor(sale.type) }}
              >
                {getSaleTypeName(sale.type)}
                {!sale.isUserPosted && <span style={{ marginLeft: '4px' }}>📍</span>}
              </div>

              {/* Neighborhood Sale Badge */}
              {sale.isNeighborhoodSale && (
                <div 
                  className="type-badge"
                  style={{ 
                    backgroundColor: '#F59E0B', 
                    marginTop: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={handleNeighborhoodSaleInfo}
                >
                  <Users size={14} style={{ marginRight: '4px' }} />
                  {sale.neighborhoodSaleName}
                </div>
              )}

              {/* Title and Description */}
              <h1 className="card-title">{sale.title}</h1>
              <p className="card-description">{sale.description}</p>

              {/* Details */}
              <div className="details-container">
                {sale.isUserPosted ? (
                  <div className="detail-item">
                    <Calendar size={20} color="#8B5CF6" />
                    <span className="detail-text">
                      {formatDate(sale.startDate)} - {formatDate(sale.endDate)}
                    </span>
                  </div>
                ) : (
                  <div className="detail-item">
                    <Clock size={20} color="#8B5CF6" />
                    <span className="detail-text">{sale.storeHours}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <MapPin size={20} color="#F97316" />
                  <span className="detail-text">{sale.address}</span>
                </div>

                {/* Store-specific details */}
                {!sale.isUserPosted && sale.phone && (
                  <div className="detail-item">
                    <Phone size={20} color="#3B82F6" />
                    <span className="detail-text">{sale.phone}</span>
                  </div>
                )}

                {/* Store Rating - Only show for stores */}
                {!sale.isUserPosted && (
                  <div className="detail-item">
                    <Star size={20} color="#F59E0B" />
                    <span className="detail-text">
                      {sale.rating ? `${sale.rating} stars` : '4.5 stars'} • {sale.comments} reviews
                    </span>
                  </div>
                )}
              </div>

              {/* User Info - Only show for user-posted sales */}
              {sale.isUserPosted && (
                <div className="user-container">
                  <div className="user-avatar">
                    <User size={20} color="#FFFFFF" />
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{sale.postedBy}</h3>
                    <div className="user-rating">
                      <Star size={14} color="#F59E0B" fill="#F59E0B" />
                      <span className="rating-text">4.8 • Verified Seller</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions - Only show for user-posted sales */}
              {sale.isUserPosted && (
                <div className="actions-container">
                  <button className="comment-button" onClick={handleComment}>
                    <MessageSquare size={20} color="#6B7280" />
                    <span className="comment-text">{sale.comments} Comments</span>
                  </button>
                  
                  <button className="like-button" onClick={handleLike}>
                    <Heart size={20} color="#EF4444" fill={isLiked ? "#EF4444" : "none"} />
                    <span className="like-text">{likeCount} Likes</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bottom-actions">
            <button className="navigation-button" onClick={onNavigate}>
              <Navigation size={20} />
              <span>Get Directions</span>
            </button>
            
            {!sale.isUserPosted && sale.phone && (
              <button className="share-button" onClick={handlePhoneCall}>
                <Phone size={20} />
              </button>
            )}
            
            {!sale.isUserPosted && sale.website && (
              <button className="share-button" onClick={handleWebsite}>
                <Globe size={20} />
              </button>
            )}
            
            <button className="share-button" onClick={handleShare}>
              <Share size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* IMAGE VIEWER MODAL */}
      {showImageViewer && sale.images && sale.images.length > 0 && (
        <div className="image-viewer-overlay" onClick={handleImageViewerClose}>
          <div className="image-viewer" onClick={(e) => e.stopPropagation()}>
            <div className="image-viewer-header">
              <h3 className="image-viewer-title">
                {sale.title} ({currentImageIndex + 1} of {sale.images.length})
              </h3>
              <button className="image-viewer-close" onClick={handleImageViewerClose}>
                <X size={24} />
              </button>
            </div>
            
            <div className="image-viewer-content">
              <img 
                src={sale.images[currentImageIndex]} 
                alt={`${sale.title} ${currentImageIndex + 1}`}
                className="image-viewer-main"
              />
              
              {/* Navigation arrows for multiple images */}
              {sale.images.length > 1 && (
                <>
                  <button className="image-viewer-nav prev\" onClick={handlePrevImage}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="image-viewer-nav next" onClick={handleNextImage}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails for multiple images */}
            {sale.images.length > 1 && (
              <div className="image-viewer-thumbnails">
                {sale.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`image-viewer-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}