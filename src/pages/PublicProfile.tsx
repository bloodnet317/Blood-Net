import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, get } from 'firebase/database';
import { mainProject } from '../lib/firebase';
import ProfileCard from '../components/ProfileCard';
import { User } from '../types';
import { Droplets, ChevronLeft } from 'lucide-react';

interface PublicProfileProps {
  uid: string;
  onBack: () => void;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ uid, onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = ref(mainProject.db, `users/${uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUser({ ...snapshot.val(), uid });
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching public profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg-dark">
        <div className="w-10 h-10 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin" />
        <p className="text-[10px] text-bg-text/20 font-black uppercase tracking-widest italic">Decrypting Digital Identity...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 bg-bg-dark">
        <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-brand-red/20">
          <Droplets size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-bg-text italic tracking-tighter uppercase">Profile Not Found</h2>
          <p className="text-[10px] text-bg-text/20 font-bold italic">The requested identity does not exist in our digital network.</p>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 glass rounded-2xl text-brand-red font-black text-xs uppercase tracking-widest italic active:scale-95 transition-all border-bg-text/5"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center px-4 py-8 relative">
      <div className="w-full max-w-sm flex items-center justify-between mb-8 px-2 relative z-10">
        <button 
          onClick={onBack}
          className="p-3 glass rounded-2xl text-bg-text/40 active:scale-95 transition-all border-bg-text/5"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-end">
          <p className="text-[8px] text-bg-text/20 font-black uppercase tracking-[0.3em]">Viewing Identity</p>
          <p className="text-[10px] text-brand-red font-black uppercase italic tracking-widest">Public Access</p>
        </div>
      </div>

      <div className="w-full flex justify-center pb-20">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProfileCard user={user} />
        </motion.div>
      </div>

      {/* Decorative Glows */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-0">
         <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-red/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default PublicProfile;
