import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TabNavigation from './components/TabNavigation';
import MapScreen from './screens/MapScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import CreateScreen from './screens/CreateScreen';
import SavedScreen from './screens/SavedScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';

function App() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="app">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/map\" replace />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/discover" element={<DiscoverScreen />} />
            <Route path="/create" element={<CreateScreen />} />
            <Route path="/saved" element={<SavedScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/login" element={<AuthScreen mode="login" />} />
            <Route path="/signup" element={<AuthScreen mode="signup" />} />
          </Routes>
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </Router>
  );
}

export default App;