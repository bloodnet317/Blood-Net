import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Heart, Shield, Users, ArrowRight, Droplets } from 'lucide-react';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { mainProject } from '../lib/firebase';
import { User } from '../types';
import GoogleAd from '../components/GoogleAd';

interface HomeProps {
  onSwitch: (tab: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSwitch }) => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const [topDonors, setTopDonors] = React.useState<User[]>([]);

  React.useEffect(() => {
    const donorsRef = ref(mainProject.db, 'users');
    const donorsQuery = query(donorsRef, limitToLast(2)); // Just a preview

    const unsubscribe = onValue(donorsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const donorsList = Object.entries(data).map(([uid, val]: [string, any]) => ({
          ...val,
          uid
        } as User));
        setTopDonors(donorsList.filter(d => d.isDonor));
      } else {
        setTopDonors([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="px-4 pt-4 pb-20 space-y-6"
    >
      {/* Header & Logo - Compacted */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center blood-glow shadow-lg shadow-brand-red/20">
            <Droplets className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-bg-text">
            {t('home.title').substring(0, 4)}<span className="text-brand-red">{t('home.title').substring(4)}</span>
          </h1>
        </div>
      </div>

      {/* Hero Section - Compacted */}
      <motion.div variants={itemVariants} className="relative glass p-6 rounded-[32px] overflow-hidden min-h-[200px] flex flex-col justify-center border-white/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-black leading-none italic tracking-tighter text-bg-text">
            {t('home.find_donors').split('রক্তদাতা')[0]} <br />
            <span className="text-brand-red">রক্তদাতা</span> {t('home.find_donors').split('রক্তদাতা')[1]}
          </h2>
          <div className="flex gap-2 p-1.5 glass rounded-[20px] max-w-sm shadow-2xl border-white/5">
            <input 
              type="text" 
              placeholder={t('find.search_placeholder').substring(0, 20)} 
              className="flex-1 bg-transparent border-none outline-none px-3 text-bg-text placeholder:text-bg-text/10 text-xs font-bold"
            />
            <button 
              onClick={() => onSwitch('find')}
              className="bg-brand-red hover:bg-brand-red-dark text-white px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg shadow-brand-red/20 active:scale-95 uppercase tracking-widest"
            >
              {t('nav.find')}
            </button>
          </div>
        </div>
      </motion.div>

      <GoogleAd />

      {/* Target & Join Dual Section - Compacted */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="glass p-5 rounded-[28px] flex flex-col justify-between min-h-[120px] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-2xl rounded-full -mr-10 -mt-10" />
          <span className="text-[8px] font-black text-bg-text/30 uppercase tracking-[0.3em] relative z-10 italic">Target 2026</span>
          <h3 className="text-base font-black leading-tight text-bg-text italic tracking-tighter relative z-10">
            {t('home.target').split('১ মিলিয়ন')[0]} ১ মিলিয়ন <br />
            <span className="text-brand-red">{t('home.target').split('লক্ষ্যমাত্রা')[1] || 'লক্ষ্যমাত্রা'}</span>
          </h3>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2 relative z-10">
             <div className="w-3/4 h-full bg-brand-red shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          </div>
        </motion.div>

        <motion.div 
          onClick={() => onSwitch('profile')}
          variants={itemVariants} 
          className="glass-red p-5 rounded-[28px] flex flex-col justify-between cursor-pointer group active:scale-[0.98] transition-all min-h-[120px] border-brand-red/10"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-brand-red rounded-lg shadow-lg ring-2 ring-brand-red/10"><Heart className="text-white" size={14} fill="white" /></div>
            <div className="flex items-center gap-1">
               <div className="w-1 h-1 bg-brand-red rounded-full animate-pulse" />
               <span className="text-[7px] font-black text-brand-red uppercase tracking-widest italic">JOIN</span>
            </div>
          </div>
          <h3 className="text-base font-black leading-tight text-bg-text italic tracking-tighter transition-colors group-hover:text-brand-red">
            {t('home.join_donor').split('নিবন্ধন')[0]} <br /> {t('home.join_donor').split('নিবন্ধন')[1] || 'নিবন্ধন করুন'}
          </h3>
        </motion.div>
      </div>

      {/* Top Donors Snippet - Compacted */}
      <motion.div variants={itemVariants} className="glass rounded-[32px] p-5 space-y-4 border-white/5">
        <div className="flex justify-between items-center px-1">
           <h4 className="font-black text-[10px] uppercase tracking-widest text-bg-text/40 italic">সক্রিয় দাতা</h4>
           <button onClick={() => onSwitch('find')} className="text-[8px] text-brand-red font-black uppercase tracking-[0.2em] cursor-pointer italic">{t('common.all')}</button>
        </div>
        <div className="space-y-2">
           {topDonors.length > 0 ? topDonors.map((donor, i) => (
             <div key={donor.uid} className="p-3 glass rounded-2xl flex items-center gap-3 border-white/5 relative overflow-hidden group active:scale-[0.99] transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-sm font-black text-brand-red border border-brand-red/20 shadow-inner italic">
                  {donor.bloodGroup}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="font-black text-xs text-bg-text tracking-tight truncate italic">{donor.fullName}</p>
                   <p className="text-[8px] text-bg-text/40 font-black uppercase tracking-widest truncate">{donor.address} • {donor.isVerified ? 'VERIFIED' : 'PENDING'}</p>
                </div>
                <div className="text-right">
                   <div className={`w-1.5 h-1.5 rounded-full mx-auto ${donor.isAvailable ? 'bg-green-500' : 'bg-bg-text/20'}`} />
                </div>
             </div>
           )) : (
             <p className="text-[10px] text-bg-text/30 text-center py-4 font-black italic tracking-widest">{t('common.searching')}</p>
           )}
        </div>
      </motion.div>

      <div className="p-5 glass border-bg-text/5 rounded-[28px] text-center space-y-2">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-bg-text/40">Connected by</p>
        <h4 className="text-lg font-black tracking-[0.2em] italic text-bg-text">UNREAL STUDIO</h4>
      </div>
    </motion.div>
  );
};

export default Home;
