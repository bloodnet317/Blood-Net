import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LogIn, Droplets, Camera, CheckCircle, ArrowRight, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ref, set, update } from 'firebase/database';
import { mainProject } from '../lib/firebase';
import imageCompression from 'browser-image-compression';

const Auth: React.FC = () => {
  const { t } = useTranslation();
  const { login, user, loading: authLoading, error: authError, clearError } = useAuth();
  const [step, setStep] = useState<'login' | 'joining'>('login');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => clearError(), 8000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    occupation: '',
    bloodGroup: '',
    address: '',
    division: '',
    district: '',
    upazilla: '',
    mobile: ''
  });

  useEffect(() => {
    if (user && step === 'login') {
      // If user exists and is already authed, they might need to complete registration
      // Or they are just logging in.
      setStep('joining');
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName || '',
        mobile: user.mobile || ''
      }));
    }
  }, [user]);

  const handleJoin = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = ref(mainProject.db, `users/${user.uid}`);
      await update(userRef, {
        ...formData,
        isDonor: true,
        isVerified: false,
        isAvailable: true,
        joinedAt: Date.now(),
        donationCount: 0,
        photoURL: user.photoURL
      });
      // reload or redirect will happen via AuthContext state change if needed
      window.location.reload(); 
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'login') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 space-y-10">
        <div className="flex flex-col items-center gap-6">
           <motion.div 
             initial={{ scale: 0.5, rotate: -45 }}
             animate={{ scale: 1, rotate: 0 }}
             className="w-24 h-24 bg-brand-red rounded-[32px] flex items-center justify-center shadow-2xl shadow-brand-red/40 relative group"
           >
             <div className="absolute inset-0 bg-white/20 rounded-[32px] blur-2xl group-hover:blur-3xl transition-all opacity-50" />
             <Droplets className="text-white relative z-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]" size={48} />
           </motion.div>
           <div className="text-center space-y-2">
             <h2 className="text-4xl font-black tracking-tighter text-bg-text italic uppercase">ব্লাডনেট</h2>
             <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">Connecting Life | Unreal Studio</p>
           </div>
        </div>

        <AnimatePresence>
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-sm glass border-brand-red/30 p-4 rounded-2xl text-center"
            >
              <p className="text-brand-red text-xs font-bold leading-relaxed">{authError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-sm space-y-5">
           <button 
             onClick={login}
             disabled={authLoading}
             className="w-full glass p-5 rounded-[28px] flex items-center justify-center gap-4 border-bg-text/5 active:scale-[0.98] transition-all hover:bg-bg-text/5 group shadow-2xl"
           >
              <div className="p-2.5 bg-white rounded-xl shadow-xl group-hover:rotate-12 transition-transform">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              </div>
              <span className="font-black text-bg-text text-base tracking-tight">{authLoading ? 'Loading...' : t('common.login_google')}</span>
           </button>
           <div className="px-4 text-center">
             <p className="text-[9px] text-bg-text/20 uppercase tracking-[0.2em] font-black leading-relaxed">
               লগইন করার মাধ্যমে আপনি আমাদের <span className="text-bg-text/40 underline">শর্তাবলী</span> মেনে নিচ্ছেন
             </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 pb-32 space-y-8">
       <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-bg-text italic tracking-tighter">ভার্চুয়াল নিবন্ধন</h2>
          <p className="text-bg-text/30 text-[9px] font-black uppercase tracking-[0.3em] italic">Official Donor Digital Identity Portal</p>
       </div>

       <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[9px] font-black text-brand-red uppercase tracking-[0.2em] pl-4">সম্পূর্ণ নাম (Official Name)</label>
             <input 
               type="text"
               placeholder="যেমন: আরফুল ইসলাম"
               className="w-full glass p-5 rounded-2xl border-bg-text/5 outline-none focus:ring-2 focus:ring-brand-red/20 transition-all text-bg-text font-bold placeholder:text-bg-text/30"
               value={formData.fullName}
               onChange={e => setFormData({...formData, fullName: e.target.value})}
             />
          </div>

          <div className="space-y-2">
             <label className="text-[9px] font-black text-bg-text/40 uppercase tracking-[0.2em] pl-4">মোবাইল নম্বর</label>
             <input 
               type="tel"
               placeholder="01XXXXXXXXX"
               className="w-full glass p-5 rounded-2xl border-bg-text/5 outline-none text-bg-text font-bold placeholder:text-bg-text/30"
               value={formData.mobile}
               onChange={e => setFormData({...formData, mobile: e.target.value})}
             />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-bg-text/40 uppercase tracking-[0.2em] pl-4">লিঙ্গ</label>
                <select 
                  className="w-full glass p-5 rounded-2xl border-bg-text/5 outline-none appearance-none text-bg-text font-bold text-sm"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value as any})}
                >
                  <option value="male" className="bg-bg-dark">পুরুষ</option>
                  <option value="female" className="bg-bg-dark">মহিলা</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-brand-red uppercase tracking-[0.2em] pl-4">রক্তের গ্রুপ</label>
                <select 
                  className="w-full glass p-5 rounded-2xl border-bg-text/5 outline-none appearance-none text-brand-red font-black text-lg text-center"
                  value={formData.bloodGroup}
                  onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                >
                  <option value="" className="bg-bg-dark">?</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                    <option key={g} value={g} className="bg-bg-dark">{g}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3 px-2">
               <div className="w-1 h-5 bg-brand-red rounded-full" />
               <h4 className="text-lg font-black text-bg-text italic tracking-tighter">ঠিকানা ও অবস্থান</h4>
             </div>
             <div className="space-y-3">
                <input 
                   placeholder="বিভাগ (যেমন: চট্টগ্রাম)"
                   className="w-full glass p-5 rounded-2xl border-white/5 outline-none text-white font-bold placeholder:text-white/10 text-sm"
                   onChange={e => setFormData({...formData, division: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    placeholder="জেলা"
                    className="w-full glass p-5 rounded-2xl border-white/5 outline-none text-white font-bold placeholder:text-white/10 text-sm"
                    onChange={e => setFormData({...formData, district: e.target.value})}
                  />
                  <input 
                    placeholder="উপজেলা"
                    className="w-full glass p-5 rounded-2xl border-white/5 outline-none text-white font-bold placeholder:text-white/10 text-sm"
                    onChange={e => setFormData({...formData, upazilla: e.target.value})}
                  />
                </div>
                <input 
                  placeholder="বিস্তারিত ঠিকানা"
                  className="w-full glass p-5 rounded-2xl border-white/5 outline-none text-white font-bold placeholder:text-white/10 text-sm"
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
             </div>
          </div>

          <button 
             onClick={handleJoin}
             disabled={loading}
             className={`w-full py-5 rounded-[2rem] font-black text-base shadow-2xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${
               loading ? 'glass text-white/20 cursor-not-allowed border-white/5' : 'bg-brand-red text-white shadow-brand-red/30 active:scale-[0.98] hover:shadow-brand-red/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
             }`}
          >
             {loading ? <div className="w-6 h-6 border-4 border-white/10 border-t-brand-red rounded-full animate-spin" /> : (
                <>
                  নিবন্ধন সম্পন্ন করুন
                  <ArrowRight size={20} />
                </>
             )}
          </button>

          <button 
            onClick={() => setStep('login')}
            className="w-full text-bg-text/20 font-black text-[9px] tracking-[0.4em] uppercase py-4 hover:text-bg-text transition-colors italic"
          >
            ফিরে যান (Back)
          </button>
       </div>
    </div>
  );
};

export default Auth;
