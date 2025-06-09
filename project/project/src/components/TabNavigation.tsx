import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Search, Plus, Heart, User } from 'lucide-react';
import './TabNavigation.css';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'map', path: '/map', label: 'Map', icon: MapPin },
  { id: 'discover', path: '/discover', label: 'Discover', icon: Search },
  { id: 'create', path: '/create', label: 'Post Sale', icon: Plus },
  { id: 'saved', path: '/saved', label: 'Saved', icon: Heart },
  { id: 'profile', path: '/profile', label: 'Profile', icon: User },
];

export default function TabNavigation({ onTabChange }: TabNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabPress = (tab: typeof tabs[0]) => {
    onTabChange(tab.id);
    navigate(tab.path);
  };

  const currentPath = location.pathname;

  return (
    <div className="tab-navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPath === tab.path;
        
        return (
          <button
            key={tab.id}
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={() => handleTabPress(tab)}
          >
            <Icon size={24} className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}