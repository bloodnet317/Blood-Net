import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Clock, Users, User, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const tabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'find', icon: Search, label: t('nav.find') },
    { id: 'latest', icon: Clock, label: t('nav.latest') },
    { id: 'about', icon: Users, label: t('nav.about') },
    { 
      id: user ? 'profile' : 'login', 
      icon: user ? User : LogIn, 
      label: user ? t('nav.profile') : t('nav.login') 
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
      <div className="glass rounded-[32px] p-1 flex items-center justify-around shadow-2xl border-white/5 h-16 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center p-1 transition-all duration-300 flex-1 ${
                isActive ? 'text-brand-red opacity-100' : 'text-bg-text opacity-20 hover:opacity-50'
              }`}
            >
              <Icon size={isActive ? 22 : 20} className={`relative z-10 transition-transform ${isActive ? 'scale-110 mb-0.5' : ''}`} />
              <span className={`text-[8px] whitespace-nowrap font-black uppercase tracking-tighter relative z-10 ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute -bottom-1 w-8 h-1 bg-brand-red rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  transition={{ type: 'spring', duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
