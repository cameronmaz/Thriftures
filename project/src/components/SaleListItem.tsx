import React from 'react';
import { MapPin, Calendar, Heart, MessageSquare, Star, User } from 'lucide-react';
import { Sale } from '../types/Sale';
import './SaleListItem.css';

interface SaleListItemProps {
  sale: Sale;
  showSaveButton?: boolean;
}

export default function SaleListItem({ sale, showSaveButton = false }: SaleListItemProps) {
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

  return (
    <div className="sale-list-item">
      {/* Image */}
      {sale.images && sale.images.length > 0 ? (
        <img src={sale.images[0]} alt={sale.title} className="sale-image" />
      ) : (
        <div className="placeholder-image">
          <span className="placeholder-text">No Image</span>
        </div>
      )}

      <div className="sale-content">
        {/* Header */}
        <div className="sale-header">
          <div 
            className="type-badge"
            style={{ backgroundColor: getSaleTypeColor(sale.type) }}
          >
            {getSaleTypeName(sale.type)}
            {!sale.isUserPosted && <span style={{ marginLeft: '2px' }}>📍</span>}
          </div>
          {showSaveButton && (
            <button className="save-button">
              <Heart size={20} color="#EF4444" fill="#EF4444" />
            </button>
          )}
        </div>

        {/* Title and Description */}
        <h3 className="sale-title">{sale.title}</h3>
        <p className="sale-description">{sale.description}</p>

        {/* Details */}
        <div className="sale-details">
          {sale.isUserPosted ? (
            <div className="detail-item">
              <Calendar size={16} color="#8B5CF6" />
              <span className="detail-text">{formatDate(sale.startDate)}</span>
            </div>
          ) : (
            <div className="detail-item">
              <span className="detail-text" style={{ color: '#8B5CF6', fontWeight: '600' }}>
                {sale.storeHours?.split(',')[0] || 'Open Daily'}
              </span>
            </div>
          )}
        </div>

        <div className="detail-item">
          <MapPin size={16} color="#F97316" />
          <span className="detail-text location">{sale.address}</span>
        </div>

        {/* Footer */}
        <div className="sale-footer">
          {/* Only show user info for user-posted sales */}
          {sale.isUserPosted ? (
            <div className="user-info">
              <div className="user-avatar">
                <User size={12} color="#FFFFFF" />
              </div>
              <span className="user-name">{sale.postedBy}</span>
              <div className="rating">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <span className="rating-text">4.8</span>
              </div>
            </div>
          ) : (
            <div className="user-info">
              <div className="user-avatar" style={{ backgroundColor: getSaleTypeColor(sale.type) }}>
                <Star size={12} color="#FFFFFF" />
              </div>
              <span className="user-name">Business</span>
              <div className="rating">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <span className="rating-text">{sale.rating ? sale.rating.toFixed(1) : '4.5'}</span>
              </div>
            </div>
          )}

          <div className="actions">
            <div className="action-item">
              <Heart size={16} color="#EF4444" />
              <span className="action-text">{sale.likes}</span>
            </div>
            <div className="action-item">
              <MessageSquare size={16} color="#6B7280" />
              <span className="action-text">{sale.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}