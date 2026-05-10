import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Camera, ShieldCheck, Briefcase, Droplets, Calendar, 
  MapPin, User as UserIcon, Mail, Bell, Settings as SettingsIcon,
  Moon, Sun, Globe, Heart, Download, Share2, LogOut, ChevronRight, X, 
  ShieldAlert, Edit, Check, Copy, Link as LinkIcon, Smartphone, Venus, Mars, 
  FileText, Upload, Info
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { ref, update, push, set } from 'firebase/database';
import { mainProject } from '../lib/firebase';
import imageCompression from 'browser-image-compression';
import ProfileCard from '../components/ProfileCard';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [workInput, setWorkInput] = useState(user?.work || user?.occupation || '');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [showVerifyBloodModal, setShowVerifyBloodModal] = useState(false);
  const [showVerifyIdentityModal, setShowVerifyIdentityModal] = useState(false);
  const [bloodVerifyFile, setBloodVerifyFile] = useState<File | null>(null);
  const [identityFrontFile, setIdentityFrontFile] = useState<File | null>(null);
  const [identityRearFile, setIdentityRearFile] = useState<File | null>(null);
  const [isSubmittingBlood, setIsSubmittingBlood] = useState(false);
  const [isSubmittingIdentity, setIsSubmittingIdentity] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial theme check
    if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
       document.documentElement.classList.add('dark'); // Default dark theme
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'bn' ? 'en' : 'bn';
    i18n.changeLanguage(nextLng);
  };

  const handleUpdateWork = async () => {
    if (!user) return;
    try {
      await update(ref(mainProject.db, `users/${user.uid}`), {
        work: workInput,
        occupation: workInput
      });
      setIsEditingWork(false);
    } catch (error) {
      console.error('Error updating work:', error);
    }
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.2, // Compress significantly but keep visible
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Compression error:', error);
      return file;
    }
  };

  const handleBloodVerifySubmit = async () => {
    if (!user || !bloodVerifyFile) return;
    setIsSubmittingBlood(true);
    try {
      const compressed = await compressImage(bloodVerifyFile);
      // In a real app we'd upload to storage. Here we push metadata to DB.
      const verifyRef = ref(mainProject.db, 'verificationRequests');
      const newRequestRef = push(verifyRef);
      await set(newRequestRef, {
        userId: user.uid,
        userName: user.fullName,
        timestamp: Date.now(),
        status: 'pending',
        type: 'Blood Donation Document',
        details: 'Donor applied for blood donation verification'
      });
      
      // Update user local rest status if needed (medical rule: 4 months freeze)
      // This would normally happen after admin approval, but let's log it.
      
      setShowVerifyBloodModal(false);
      setBloodVerifyFile(null);
      alert('রক্তদান ভেরিফিকেশন আবেদন জমা হয়েছে! (Request submitted, wait for verification)');
    } catch (error) {
      console.error('Blood verification error:', error);
    } finally {
      setIsSubmittingBlood(false);
    }
  };

  const handleIdentityVerifySubmit = async () => {
    if (!user || !identityFrontFile || !identityRearFile) return;
    setIsSubmittingIdentity(true);
    try {
      const verifyRef = ref(mainProject.db, 'verificationRequests');
      const newRequestRef = push(verifyRef);
      await set(newRequestRef, {
        userId: user.uid,
        userName: user.fullName,
        timestamp: Date.now(),
        status: 'pending',
        type: 'Account Identity (NID/Passport)',
        details: 'Identity verification with Front and Rear images'
      });
      setShowVerifyIdentityModal(false);
      setIdentityFrontFile(null);
      setIdentityRearFile(null);
      alert('আপনার অ্যাকাউন্ট ভেরিফিকেশন আবেদন জমা হয়েছে! (Account verification submitted)');
    } catch (error) {
      console.error('Identity verification error:', error);
    } finally {
      setIsSubmittingIdentity(false);
    }
  };

  const notifications = [
    { id: '1', title: 'স্বাগতম!', message: 'ব্লাডনেটে আপনাকে স্বাগতম। আপনি একজন রক্তদাতা হিসেবে যুক্ত হয়েছেন।', type: 'info' },
    { id: '2', title: 'অ্যাকাউন্ট ভেরিফিকেশন', message: 'আপনার অ্যাকাউন্ট ভেরিফাই করতে এনআইডি আপলোড করুন।', type: 'alert' }
  ];

  if (!user) return null;

  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="px-4 pt-4 pb-32 space-y-6">
      {/* Profile Header - Compacted */}
      <div className="flex flex-col items-center gap-4 relative">
         <div className="relative group">
            <div className="w-20 h-20 rounded-[28px] overflow-hidden shadow-2xl ring-[3px] ring-bg-text/5 bg-bg-text/5 border border-bg-text/10">
               <img src={user.photoURL} alt={user.fullName} className="w-full h-full object-cover" />
            </div>
            <label className="absolute -bottom-1 -right-1 bg-brand-red text-white p-1.5 rounded-lg shadow-xl cursor-pointer hover:scale-110 transition-transform active:scale-95 border border-white/20">
               <Camera size={12} />
               <input type="file" className="hidden" accept="image/*" />
            </label>
         </div>

         <div className="text-center space-y-0">
            <div className="flex items-center justify-center gap-1">
               <h2 className="text-lg font-black text-bg-text italic tracking-tighter uppercase">{user.fullName || user.displayName}</h2>
               {user.isVerified ? (
                 <div className="bg-blue-500 text-white p-0.5 rounded-full"><Check size={10} className="stroke-[4]" /></div>
               ) : (
                 <span className="text-[6px] glass text-bg-text/40 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest italic">{t('profile.not_verified')}</span>
               )}
            </div>
            <p className="text-bg-text/30 font-black uppercase tracking-[0.2em] text-[7px] italic">Donor Profile • {user.uid?.substring(0, 8)}</p>
         </div>
      </div>

      {/* Stats Cards - Compacted */}
      <div className="grid grid-cols-2 gap-3">
         <div className="glass p-4 rounded-3xl flex flex-col items-center justify-center gap-1 border-bg-text/5 relative overflow-hidden">
            <div className="w-8 h-8 bg-brand-red/10 text-brand-red rounded-lg flex items-center justify-center ring-1 ring-brand-red/20 shadow-inner">
               <Heart size={14} fill="currentColor" />
            </div>
            <p className="text-[7px] text-bg-text/40 font-black uppercase tracking-widest">{t('profile.donation_count')}</p>
            <p className="text-sm font-black text-bg-text italic tracking-tighter">{user.donationCount} Times</p>
         </div>
         <div className="glass p-4 rounded-3xl flex flex-col items-center justify-center gap-1 border-bg-text/5 relative overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ring-bg-text/5 shadow-inner ${user.isAvailable ? 'bg-green-500/10 text-green-500' : 'glass text-bg-text/20'}`}>
               <Calendar size={14} />
            </div>
            <p className="text-[7px] text-bg-text/40 font-black uppercase tracking-widest font-mono">Status</p>
            <p className={`text-xs font-black italic tracking-tighter ${user.isAvailable ? 'text-green-500' : 'text-bg-text/40'}`}>{user.isAvailable ? 'Ready' : 'Rest'}</p>
         </div>
      </div>

      {/* Actions - New Row for specific features */}
      <div className="grid grid-cols-3 gap-2">
         {[
           { id: 'blood', label: 'Verify Blood', icon: Droplets, action: () => setShowVerifyBloodModal(true), color: 'text-brand-red' },
           { id: 'id', label: 'Verify ID', icon: ShieldCheck, action: () => setShowVerifyIdentityModal(true), color: 'text-blue-400' },
           { id: 'card', label: 'Digital Card', icon: Share2, action: () => setShowShareModal(true), color: 'text-bg-text/40' }
         ].map(action => (
           <button 
             key={action.id} 
             onClick={action.action}
             className="glass p-3 rounded-2xl flex flex-col items-center gap-1.5 border-bg-text/5 active:scale-95 transition-all text-bg-text/30 hover:text-bg-text"
           >
              <action.icon size={16} className={action.color} />
              <span className="text-[6px] font-black uppercase tracking-widest">{action.label}</span>
           </button>
         ))}
      </div>

      {/* Basic Info - Compacted */}
      <div className="glass rounded-[32px] p-5 space-y-3 border-bg-text/5 relative overflow-hidden">
         {/* Occupation/Work Section */}
         <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3 flex-1">
               <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-bg-text/30 border-bg-text/5 shadow-inner shrink-0">
                  <Briefcase size={14} />
               </div>
               <div className="flex-1">
                  <p className="text-[7px] text-bg-text/30 font-black uppercase tracking-[0.1em] mb-0.5">{t('profile.work')}</p>
                  {isEditingWork ? (
                    <div className="flex gap-2 items-center">
                       <input 
                         value={workInput}
                         onChange={(e) => setWorkInput(e.target.value)}
                         className="bg-bg-text/5 border border-bg-text/10 rounded-lg px-2 py-1 text-bg-text text-[10px] font-bold w-full outline-none focus:border-brand-red/50"
                         autoFocus
                       />
                       <button onClick={handleUpdateWork} className="p-1 px-2 bg-green-500/20 text-green-500 rounded-lg text-[8px] font-black italic">Save</button>
                    </div>
                  ) : (
                    <p className="font-black text-bg-text text-xs tracking-tight italic truncate">
                       {user.work || user.occupation || t('profile.add_work')}
                    </p>
                  )}
               </div>
            </div>
            {!isEditingWork && (
               <button 
                 onClick={() => setIsEditingWork(true)}
                 className="p-2 text-bg-text/20 hover:text-brand-red transition-colors"
                >
                  <Edit size={12} />
               </button>
            )}
         </div>

         <div className="flex items-center gap-3">
            <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-brand-red border-bg-text/5 shadow-inner">
               <Droplets size={14} />
            </div>
            <div>
               <p className="text-[7px] text-brand-red font-black uppercase tracking-[0.1em] mb-0.5">{t('find.blood_group')}</p>
               <p className="font-black text-lg text-bg-text tracking-tighter italic leading-none">{user.bloodGroup}</p>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-bg-text/30 border-bg-text/5 shadow-inner">
               <MapPin size={14} />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[7px] text-bg-text/30 font-black uppercase tracking-[0.1em] mb-0.5">Location</p>
               <p className="font-black text-bg-text text-xs tracking-tight italic truncate">{user.district || user.address}</p>
            </div>
         </div>
      </div>

      {/* Notifications - Compacted */}
      <div className="space-y-3 px-1">
         <div className="flex items-center justify-between">
            <h3 className="font-black text-xs flex items-center gap-2 uppercase tracking-widest text-bg-text italic">
               <div className="w-0.5 h-4 bg-brand-red rounded-full" />
               Alerts
            </h3>
         </div>
         <div className="space-y-2">
            {notifications.map(n => (
               <div key={n.id} className="glass p-3 rounded-2xl flex gap-3 items-start relative overflow-hidden border-white/5 active:scale-[0.99] transition-all">
                  <div className={`mt-1.5 h-1 w-1 rounded-full flex-shrink-0 animate-pulse ${n.type === 'alert' ? 'bg-brand-red' : 'bg-blue-500'}`} />
                  <div className="space-y-0.5">
                     <h4 className="font-black text-[10px] text-bg-text tracking-tight italic uppercase">{n.title}</h4>
                     <p className="text-[8px] text-bg-text/20 leading-tight font-bold italic">{n.message}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
         <button 
           onClick={() => setShowSettings(true)}
           className="flex-1 py-4 glass border-bg-text/5 rounded-2xl flex items-center justify-center gap-2 text-bg-text/40 active:scale-95 transition-all"
         >
            <SettingsIcon size={16} />
            <span className="font-black text-[8px] tracking-[0.2em] uppercase">Set Preferences</span>
         </button>
         <button 
           onClick={logout}
           className="w-14 h-14 glass border-bg-text/5 rounded-2xl flex items-center justify-center text-brand-red/50 active:scale-95 transition-all"
         >
            <LogOut size={18} />
         </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
         {showSettings && (
            <div className="fixed inset-0 z-[60] flex items-end">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setShowSettings(false)}
                 className="absolute inset-0 bg-black/90 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                 className="relative w-full glass bg-bg-dark rounded-t-[40px] p-6 space-y-6 border-t border-white/10 shadow-2xl"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                        <h3 className="text-lg font-black text-bg-text italic uppercase tracking-tighter">সিস্টেম সেটিংস</h3>
                        <p className="text-bg-text/20 text-[6px] font-black uppercase tracking-[0.4em] mt-0.5">Configuration Preferences</p>
                     </div>
                     <button onClick={() => setShowSettings(false)} className="p-2 glass rounded-full text-bg-text/40 active:scale-95 transition-all"><X size={16} /></button>
                  </div>
                  
                  <div className="space-y-2">
                     {[
                       { id: 'theme', icon: isDarkMode ? <Sun size={16} /> : <Moon size={16} />, label: 'Switch Visual Theme', sub: isDarkMode ? 'Light enabled' : 'Dark active', action: toggleTheme, color: 'text-orange-400' },
                       { id: 'lang', icon: <Globe size={16} />, label: 'Change Language', sub: i18n.language === 'bn' ? 'বাংলা সিলেক্টেড' : 'English selected', action: toggleLanguage, color: 'text-blue-500' },
                     ].map((item) => (
                       <button key={item.id} onClick={item.action} className="w-full p-4 rounded-2xl flex items-center justify-between glass border-white/5 active:scale-[0.98] transition-all">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 glass rounded-xl shadow-inner ${item.color}`}>
                               {item.icon}
                            </div>
                            <div className="text-left">
                               <p className="font-black text-bg-text text-xs tracking-tight italic">{item.label}</p>
                               <p className="text-[7px] text-bg-text/20 font-black uppercase tracking-widest">{item.sub}</p>
                            </div>
                         </div>
                         <div className="p-1 glass rounded-full text-bg-text/10">
                            <ChevronRight size={12} />
                         </div>
                       </button>
                     ))}
                  </div>
                  <div className="text-center opacity-20 pb-4">
                     <p className="text-[6px] text-bg-text font-black uppercase tracking-[0.3em]">Build 2.0 • Unreal Studio</p>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Verify Blood Donation Modal */}
      <AnimatePresence>
         {showVerifyBloodModal && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowVerifyBloodModal(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 w-full max-w-sm glass rounded-[36px] p-6 space-y-5 border-white/10 max-h-[90vh] overflow-y-auto"
              >
                 <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-brand-red/10 text-brand-red rounded-2xl mx-auto flex items-center justify-center shadow-inner mb-1">
                       <Droplets size={28} />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">রক্তদান ভেরিফিকেশন</h3>
                    <p className="text-[9px] text-white/30 font-bold leading-relaxed italic">You can apply anytime no matter if failed.</p>
                 </div>

                 {!user.isAvailable ? (
                    <div className="bg-brand-red/10 p-4 rounded-2xl border border-brand-red/20 text-center">
                       <ShieldAlert className="mx-auto mb-2 text-brand-red" size={20} />
                       <p className="text-[10px] text-brand-red font-black uppercase italic tracking-widest">Currently on Rest</p>
                       <p className="text-[8px] text-brand-red/60 mt-1">Medical Rule: Wait for your recovery period to apply.</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="glass border-dashed border-2 border-white/5 rounded-2xl p-6 flex flex-col items-center gap-2 relative cursor-pointer hover:bg-white/5 transition-colors group">
                          <input 
                            type="file" 
                            onChange={(e) => setBloodVerifyFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                          />
                          {bloodVerifyFile ? (
                            <div className="flex flex-col items-center gap-2">
                               <div className="p-2 bg-green-500/10 text-green-500 rounded-xl"><Check size={20} /></div>
                               <p className="text-[9px] text-white font-black italic truncate max-w-[200px]">{bloodVerifyFile.name}</p>
                            </div>
                          ) : (
                            <>
                               <div className="p-2 bg-white/5 text-white/10 rounded-xl group-hover:text-brand-red transition-colors"><Upload size={20} /></div>
                               <p className="text-[8px] text-white/20 font-black uppercase tracking-widest text-center">Submit Blood Text Document<br/><span className="text-[6px] opacity-40">(Automatic 80% Compression)</span></p>
                            </>
                          )}
                       </div>

                       <div className="glass p-4 rounded-2xl border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-white/40">
                             <Info size={12} />
                             <p className="text-[8px] font-black uppercase tracking-widest">Guideline Section</p>
                          </div>
                          <ul className="text-[8px] text-white/20 space-y-1 font-bold italic list-disc pl-3">
                             <li>Clear Image Upload</li>
                             <li>Admin will detect verification data</li>
                             <li>Inappropriate documents will be rejected</li>
                             <li>Provide hospital blood check report</li>
                             <li>You will be frozen for 4 months post donation</li>
                          </ul>
                       </div>

                       <button 
                         onClick={handleBloodVerifySubmit}
                         disabled={!bloodVerifyFile || isSubmittingBlood}
                         className={`w-full py-4 rounded-xl font-black transition-all shadow-xl uppercase tracking-widest text-[10px] italic ${bloodVerifyFile ? 'bg-brand-red text-white shadow-brand-red/20 active:scale-95' : 'bg-white/5 text-white/5 cursor-not-allowed'}`}
                       >
                          {isSubmittingBlood ? 'প্রসেসিং...' : 'রক্তদান নথি জমা দিন'}
                       </button>
                    </div>
                 )}
                 <button onClick={() => setShowVerifyBloodModal(false)} className="w-full text-white/10 font-black text-[8px] uppercase tracking-widest italic pt-2">Cancel Process</button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Verify Identity Modal */}
      <AnimatePresence>
         {showVerifyIdentityModal && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowVerifyIdentityModal(false)}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 w-full max-w-sm glass rounded-[36px] p-6 space-y-5 border-white/10 max-h-[90vh] overflow-y-auto"
              >
                 <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl mx-auto flex items-center justify-center shadow-inner mb-1">
                       <ShieldCheck size={28} />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">অ্যাকাউন্ট ভেরিফিকেশন</h3>
                    <p className="text-[9px] text-white/30 font-bold leading-relaxed italic">Upload Your NID / Passport / Driving License</p>
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="glass border-dashed border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 relative cursor-pointer hover:bg-white/5 transition-colors">
                       <input type="file" onChange={(e) => setIdentityFrontFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       <div className={`p-2 rounded-lg ${identityFrontFile ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/10'}`}>
                          <Upload size={14} />
                       </div>
                       <p className="text-[6px] text-white/40 font-black uppercase tracking-widest text-center">{identityFrontFile ? identityFrontFile.name.substring(0, 10) + '...' : 'Front Part'}</p>
                    </div>
                    <div className="glass border-dashed border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 relative cursor-pointer hover:bg-white/5 transition-colors">
                       <input type="file" onChange={(e) => setIdentityRearFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                       <div className={`p-2 rounded-lg ${identityRearFile ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/10'}`}>
                          <Upload size={14} />
                       </div>
                       <p className="text-[6px] text-white/40 font-black uppercase tracking-widest text-center">{identityRearFile ? identityRearFile.name.substring(0, 10) + '...' : 'Rear Part'}</p>
                    </div>
                 </div>

                 <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex gap-2 items-start">
                    <Info size={12} className="text-blue-400 shrink-0" />
                    <p className="text-[8px] text-blue-400/60 font-bold italic">Admin will verify and confirm your identity soon. Notifications will alert you upon completion.</p>
                 </div>

                 <button 
                   onClick={handleIdentityVerifySubmit}
                   disabled={!identityFrontFile || !identityRearFile || isSubmittingIdentity}
                   className={`w-full py-4 rounded-xl font-black transition-all shadow-xl uppercase tracking-widest text-[10px] italic ${identityFrontFile && identityRearFile ? 'bg-blue-600 text-white shadow-blue-600/20 active:scale-95' : 'bg-white/5 text-white/5 cursor-not-allowed'}`}
                 >
                    {isSubmittingIdentity ? 'প্রসেসিং...' : 'এনআইডি জমা দিন'}
                 </button>
                 <button onClick={() => setShowVerifyIdentityModal(false)} className="w-full text-white/10 font-black text-[8px] uppercase tracking-widest italic pt-2">Cancel Process</button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
      {/* Million Dollar Share Card Modal - Improved scrolling for mobile */}
      <AnimatePresence>
         {showShareModal && (
            <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-4 py-10 bg-black/95 backdrop-blur-xl">
                <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   onClick={() => setShowShareModal(false)}
                   className="absolute inset-0"
                />
                <div className="relative z-10 w-full flex justify-center">
                   <ProfileCard user={user} onClose={() => setShowShareModal(false)} />
                </div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
