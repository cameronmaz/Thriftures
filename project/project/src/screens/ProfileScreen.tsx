import { User, Crown, MapPin, Bell, Shield, HelpCircle, Settings, ChevronRight, Star, Heart, MessageSquare, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import './ProfileScreen.css';

export default function ProfileScreen() {
  const navigate = useNavigate();

  const handlePremiumUpgrade = () => {
    alert('🌟 Upgrade to Premium!\n\n✨ Benefits:\n• Instant notifications for new sales\n• Custom notification areas\n• Priority support\n• Advanced filters\n• No ads\n\n💰 Only $4.99/month\n\nComing soon!');
  };

  const handleNotificationAreas = () => {
    alert('📍 Notification Areas\n\nSet up custom areas where you want to be notified about new sales:\n\n• Home (2km radius)\n• Work (1km radius)\n• Mom\'s House (3km radius)\n\nFeature coming soon!');
  };

  const handleNotificationSettings = () => {
    alert('🔔 Notification Settings\n\nCurrent settings:\n• Push notifications: ON\n• Email alerts: OFF\n• In-app notifications: ON\n• Sale reminders: ON\n\nCustomize in settings!');
  };

  const handlePrivacySecurity = () => {
    alert('🔒 Privacy & Security\n\n• Account is secure\n• Two-factor authentication: OFF\n• Data sharing: Minimal\n• Location sharing: App only\n\nManage your privacy settings here.');
  };

  const handleHelpSupport = () => {
    alert('❓ Help & Support\n\n📚 Frequently Asked Questions\n📧 Contact Support\n💬 Live Chat (Premium)\n📖 User Guide\n\nWe\'re here to help!');
  };

  const handleAppSettings = () => {
    alert('⚙️ App Settings\n\n• Dark mode: OFF\n• Notifications: ON\n• Location services: ON\n• Auto-refresh: 5 minutes\n• Distance units: Kilometers\n\nCustomize your experience!');
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      alert('👋 Signed out successfully!\n\nYou can sign back in anytime to access your saved sales and preferences.');
      navigate('/map');
    }
  };

  const handleCreateSale = () => {
    navigate('/create');
  };

  const handleViewMySales = () => {
    alert('📊 My Posted Sales\n\n🏠 Multi-Family Garage Sale\n   • 24 views, 3 saves\n   • Jan 20-21\n\n🎨 Art Supply Sale\n   • 12 views, 1 save\n   • Jan 28-29\n\nFull management coming soon!');
  };

  const menuItems = [
    {
      icon: Crown,
      title: 'Upgrade to Premium',
      subtitle: 'Get instant notifications & more',
      color: '#F59E0B',
      action: handlePremiumUpgrade,
    },
    {
      icon: MapPin,
      title: 'Notification Areas',
      subtitle: 'Manage your alert zones',
      color: '#14B8A6',
      action: handleNotificationAreas,
    },
    {
      icon: Bell,
      title: 'Notification Settings',
      subtitle: 'Push, email & in-app alerts',
      color: '#8B5CF6',
      action: handleNotificationSettings,
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Account security settings',
      color: '#EF4444',
      action: handlePrivacySecurity,
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'FAQs and contact support',
      color: '#3B82F6',
      action: handleHelpSupport,
    },
    {
      icon: Settings,
      title: 'App Settings',
      subtitle: 'General app preferences',
      color: '#6B7280',
      action: handleAppSettings,
    },
  ];

  return (
    <div className="profile-screen">
      <div className="content">
        {/* Universal Header */}
        <AppHeader 
          showBackButton={true}
          subtitle="Profile"
          showNotifications={false}
          showPremium={false}
          showProfile={false}
        />

        {/* Profile Info */}
        <div className="profile-info">
          <div className="avatar-container">
            <User size={40} color="#FFFFFF" />
          </div>
          <h1 className="user-name">Sarah Johnson</h1>
          <p className="user-email">sarah.johnson@email.com</p>
          
          {/* User Stats */}
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Sales Posted</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="rating-container">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <span className="stat-number">4.8</span>
              </div>
              <span className="stat-label">Trust Rating</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">47</span>
              <span className="stat-label">Sales Saved</span>
            </div>
          </div>
        </div>

        {/* My Sales Section */}
        <div className="section">
          <h2 className="section-title">My Sales</h2>
          <div className="my-sales-actions">
            <button className="action-card create-sale" onClick={handleCreateSale}>
              <div className="action-icon">
                <Plus size={24} color="#14B8A6" />
              </div>
              <div className="action-content">
                <h3 className="action-title">Post New Sale</h3>
                <p className="action-subtitle">Create a garage sale or estate sale</p>
              </div>
            </button>
            
            <button className="action-card view-sales" onClick={handleViewMySales}>
              <div className="action-icon">
                <MapPin size={24} color="#8B5CF6" />
              </div>
              <div className="action-content">
                <h3 className="action-title">Manage My Sales</h3>
                <p className="action-subtitle">View and edit your posted sales</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <Heart size={20} color="#EF4444" />
              <div className="activity-content">
                <p className="activity-text">Saved "Estate Sale in Millfield"</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <MessageSquare size={20} color="#14B8A6" />
              <div className="activity-content">
                <p className="activity-text">Commented on "Garage Sale Weekend"</p>
                <p className="activity-time">1 day ago</p>
              </div>
            </div>
            <div className="activity-item">
              <MapPin size={20} color="#8B5CF6" />
              <div className="activity-content">
                <p className="activity-text">Posted "Multi-Family Sale"</p>
                <p className="activity-time">3 days ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="section">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="menu-item"
                onClick={item.action}
              >
                <div className="menu-icon" style={{ backgroundColor: `${item.color}20` }}>
                  <Icon size={24} color={item.color} />
                </div>
                <div className="menu-content">
                  <h3 className="menu-title">{item.title}</h3>
                  <p className="menu-subtitle">{item.subtitle}</p>
                </div>
                <ChevronRight size={20} color="#9CA3AF" />
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        <button className="sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>

        <div className="bottom-spacing" />
      </div>
    </div>
  );
}