import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, ShieldCheck, Flag, ExternalLink, Filter, X, Check, Briefcase, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GoogleAd from '../components/GoogleAd';
import { User } from '../types';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { mainProject } from '../lib/firebase';
import ProfileCard from '../components/ProfileCard';

const Find: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [donors, setDonors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const donorsRef = ref(mainProject.db, 'users');
    const donorsQuery = query(donorsRef, limitToLast(100)); // Limit for performance

    const unsubscribe = onValue(donorsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const donorsList = Object.entries(data).map(([uid, val]: [string, any]) => ({
          ...val,
          uid
        } as User));
        setDonors(donorsList.filter(d => d.isDonor));
      } else {
        setDonors([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredDonors = donors.filter(donor => {
    const matchesGroup = !selectedGroup || donor.bloodGroup === selectedGroup;
    const matchesSearch = !searchQuery || 
      donor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* Search Bar - Compacted */}
      <div className="glass flex items-center p-3 rounded-2xl gap-3 shadow-xl border-white/5">
        <Search className="text-bg-text/40" size={20} />
        <input 
          type="text" 
          placeholder={t('find.search_placeholder')}
          className="bg-transparent border-none outline-none flex-1 text-base text-bg-text placeholder:text-bg-text/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="h-6 w-[1px] bg-bg-text/20" />
        <Filter className="text-brand-red" size={20} />
      </div>

      {/* Blood Group Select - Improved Layout */}
      <div className="grid grid-cols-4 gap-2">
        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
            className={`flex-shrink-0 py-2 rounded-xl border transition-all font-black text-xs ${
              selectedGroup === group 
                ? 'bg-brand-red text-white border-brand-red scale-105 shadow-lg shadow-brand-red/30' 
                : 'glass text-bg-text/60 border-white/5 active:scale-95'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
            <p className="text-bg-text/40 text-[10px] font-black uppercase tracking-[0.4em]">Searching for life savers...</p>
          </div>
        ) : filteredDonors.length > 0 ? (
          filteredDonors.map((donor, idx) => (
            <React.Fragment key={donor.uid}>
              <motion.div
                layoutId={donor.uid}
                onClick={() => setSelectedUser(donor)}
                className="glass p-5 rounded-[32px] flex flex-col gap-4 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer border-white/5 hover:border-white/10 group bg-white/[0.02]"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[24px] overflow-hidden shadow-2xl ring-2 ring-white/10 bg-white/5 transform group-hover:scale-105 transition-transform duration-500">
                      <img 
                        src={donor.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donor.uid}`} 
                        alt={donor.fullName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    {donor.isVerified && (
                      <div className="absolute -right-1 -bottom-1 bg-blue-500 text-white p-1 rounded-xl border-2 border-bg-dark shadow-xl">
                        <Check size={10} className="stroke-[4]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-black text-base truncate text-bg-text italic tracking-tight uppercase">{donor.fullName}</h4>
                      <div className="bg-brand-red text-white px-3 py-1 rounded-xl text-sm font-black shadow-lg shadow-brand-red/20 italic transform group-hover:rotate-2 transition-transform">
                        {donor.bloodGroup}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[9px] text-bg-text/60 font-bold mb-2">
                      <MapPin size={10} className="text-brand-red" />
                      <span className="truncate">{donor.district || donor.address}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                       <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-text/5 rounded-lg border border-white/5 pr-3 shadow-inner">
                          <Briefcase size={10} className="text-brand-red opacity-60" />
                          <span className="text-[9px] font-black uppercase text-bg-text/60 italic tracking-tight">{donor.work || donor.occupation || 'Life Saver'}</span>
                       </div>
                       <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-text/5 rounded-lg border border-white/5 pr-3 shadow-inner">
                          <UserIcon size={10} className="text-blue-500 opacity-60" />
                          <span className="text-[9px] font-black uppercase text-bg-text/60 italic tracking-tight">{donor.gender === 'male' ? t('common.male') || 'Male' : donor.gender === 'female' ? t('common.female') || 'Female' : 'Gender'}</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                   <div className="flex items-center gap-3">
                      {donor.isAvailable ? (
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-green-500">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          Ready to Donate
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-bg-text/40">
                          <div className="w-1.5 h-1.5 bg-bg-text/30 rounded-full" />
                          On Rest
                        </div>
                      )}
                   </div>
                   <div className="flex items-center gap-2">
                      {!donor.isVerified && (
                        <span className="text-[7px] text-brand-red font-black uppercase tracking-widest italic mr-2 opacity-50">Unverified Identity</span>
                      )}
                      <div className="w-9 h-9 glass bg-brand-red/10 flex items-center justify-center rounded-xl text-brand-red shadow-inner group-hover:scale-110 transition-transform">
                        <Phone size={16} />
                      </div>
                   </div>
                </div>
              </motion.div>
              {(idx + 1) % 4 === 0 && (
                <div key={`ad-wrapper-${idx}`} className="py-2">
                  <GoogleAd />
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 glass rounded-[40px] border-white/5 italic">
            <Search size={40} className="text-bg-text/20" />
            <p className="text-bg-text/40 text-[11px] font-black uppercase tracking-[0.2em] text-center px-10 leading-relaxed">
              কোনো রক্তদাতা খুঁজে পাওয়া যায়নি। <br /> আপনার অনুসন্ধান পরিবর্তন করে পুনরায় চেষ্টা করুন
            </p>
          </div>
        )}
      </div>

      <GoogleAd />

      {/* User Details Modal - Improved scrolling for mobile */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0"
            />
            <div className="relative z-10 w-full flex justify-center">
              <ProfileCard 
                user={selectedUser} 
                onClose={() => setSelectedUser(null)} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Find;
