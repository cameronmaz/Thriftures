import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import SaleListItem from '../components/SaleListItem';
import SaleCard from '../components/SaleCard';
import { mockSales } from '../data/mockSales';
import { Sale } from '../types/Sale';
import './SavedScreen.css';

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState('saved');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Mock saved sales (in a real app, this would come from user's saved items)
  const savedSales = mockSales.slice(0, 4);
  const recentlyViewed = mockSales.slice(2, 6);

  const tabs = [
    { id: 'saved', name: 'Saved', count: savedSales.length },
    { id: 'recent', name: 'Recently Viewed', count: recentlyViewed.length },
  ];

  const currentSales = activeTab === 'saved' ? savedSales : recentlyViewed;

  const handleSaleClick = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const openNavigation = (sale: Sale) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${sale.latitude},${sale.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="saved-screen">
      {/* Universal Header */}
      <AppHeader 
        showSearch={true}
        subtitle="My Sales"
      />

      {/* Tabs */}
      <div className="tab-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      <div className="content">
        {currentSales.length > 0 ? (
          <>
            {activeTab === 'saved' && (
              <div className="info-card">
                <Heart size={20} color="#EF4444" />
                <p className="info-text">
                  Your saved sales are available offline and won't expire until the sale ends.
                </p>
              </div>
            )}
            
            <div className="sales-list">
              {currentSales.map((sale) => (
                <div key={sale.id} onClick={() => handleSaleClick(sale)}>
                  <SaleListItem 
                    sale={sale} 
                    showSaveButton={activeTab === 'saved'}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Heart size={48} color="#D1D5DB" />
            <h2 className="empty-title">
              {activeTab === 'saved' ? 'No Saved Sales' : 'No Recent Views'}
            </h2>
            <p className="empty-text">
              {activeTab === 'saved' 
                ? 'Start exploring and save sales you\'re interested in!'
                : 'Sales you view will appear here for easy access.'
              }
            </p>
          </div>
        )}

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
    </div>
  );
}