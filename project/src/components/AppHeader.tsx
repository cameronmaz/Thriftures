import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Crown, User, Filter, Search, ArrowLeft } from 'lucide-react';
import './AppHeader.css';

interface AppHeaderProps {
  showBackButton?: boolean;
  showFilter?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showPremium?: boolean;
  showProfile?: boolean;
  onFilterClick?: () => void;
  onSearchClick?: () => void;
  subtitle?: string;
}

export default function AppHeader({
  showBackButton = false,
  showFilter = false,
  showSearch = false,
  showNotifications = true,
  showPremium = true,
  showProfile = true,
  onFilterClick,
  onSearchClick,
  subtitle
}: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    if (subtitle) return subtitle;
    
    switch (location.pathname) {
      case '/map': return 'Find Sales Near You';
      case '/discover': return 'Discover Sales';
      case '/create': return 'Post a Sale';
      case '/saved': return 'My Sales';
      case '/profile': return 'Profile';
      case '/login': return 'Sign In';
      case '/signup': return 'Create Account';
      default: return 'Find Amazing Sales Near You';
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handlePremiumClick = () => {
    alert('🌟 Upgrade to Premium!\n\n✨ Instant notifications for new sales\n📍 Custom notification areas\n⚡ Priority support\n🎯 Advanced filters\n🏪 Store hours & contact info\n\nComing soon!');
  };

  const handleNotificationsClick = () => {
    alert('🔔 Notifications\n\nYou have 3 new sales in your area!\n\n• Estate Sale - 2 blocks away\n• Garage Sale - 0.5 miles\n• New Goodwill items - 1.2 miles');
  };

  const handleProfileClick = () => {
    if (location.pathname === '/profile') return;
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app-header">
      <div className="header-content">
        {/* Left Section */}
        <div className="header-left">
          {showBackButton && (
            <button className="header-button back-button\" onClick={handleBackClick}>
              <ArrowLeft size={24} />
            </button>
          )}
          
          {showFilter && (
            <button className="header-button" onClick={onFilterClick}>
              <Filter size={24} />
            </button>
          )}
          
          {showSearch && (
            <button className="header-button" onClick={onSearchClick}>
              <Search size={24} />
            </button>
          )}
        </div>

        {/* Center Section - Branding */}
        <div className="header-center">
          <div className="app-branding">
            <h1 className="app-title">Thriftures</h1>
            <p className="app-subtitle">{getPageTitle()}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="header-right">
          {!isAuthPage && (
            <>
              {showPremium && (
                <button className="premium-crown-button" onClick={handlePremiumClick}>
                  <Crown size={18} />
                </button>
              )}
              
              {showNotifications && (
                <button className="header-button" onClick={handleNotificationsClick}>
                  <Bell size={24} />
                </button>
              )}
              
              {showProfile && (
                <button className="header-button" onClick={handleProfileClick}>
                  <User size={24} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}