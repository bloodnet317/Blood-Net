/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';

// Pages (to be implemented)
import Home from './pages/Home';
import Find from './pages/Find';
import Latest from './pages/Latest';
import About from './pages/About';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import PublicProfile from './pages/PublicProfile';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [profileViewId, setProfileViewId] = useState<string | null>(null);
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Default theme is dark
    if (!document.documentElement.classList.contains('light')) {
      document.documentElement.classList.add('dark');
    }

    // Handle initial routing
    const path = window.location.pathname;
    if (path.startsWith('/profile/')) {
      const uid = path.split('/')[2];
      if (uid) {
        setProfileViewId(uid);
        setActiveTab('public-profile');
      }
    }
  }, []);

  // Handle Admin URL
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  if (isAdmin) {
    return <Admin />;
  }

  const renderPage = () => {
    if (activeTab === 'public-profile' && profileViewId) {
      return <PublicProfile uid={profileViewId} onBack={() => {
        setProfileViewId(null);
        setActiveTab('home');
        window.history.pushState({}, '', '/');
      }} />;
    }

    switch (activeTab) {
      case 'home': return <Home onSwitch={setActiveTab} />;
      case 'find': return <Find />;
      case 'latest': return <Latest />;
      case 'about': return <About />;
      case 'profile': return user ? <Profile /> : <Auth />;
      case 'login': return <Auth />;
      default: return <Home onSwitch={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-bg-text selection:bg-brand-red selection:text-white">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-red/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-red/5 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
