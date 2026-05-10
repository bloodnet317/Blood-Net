import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Heart, Users, Shield, Target, Phone, Mail, MessageCircle, Star, 
  Award, Code, Droplets, ExternalLink, Globe, Layout, Smartphone, HelpCircle, FileText, Lock, X
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { mainProject } from '../lib/firebase';
import GoogleAd from '../components/GoogleAd';
import UnrealLogo from '../components/UnrealLogo';

const LEGAL_DOCS = {
  terms: {
    title: 'Terms & Conditions',
    content: `1. ACCEPTANCE OF TERMS
By accessing or using Bloodnet BDM, you agree to be bound by these Terms of Service.

2. ELIGIBILITY
You must be at least 18 years of age to register as a donor. By creating an account, you represent that you meet all health criteria for blood donation.

3. IDENTITY VERIFICATION
Users are required to provide authentic identity documents. Unreal Studio reserves the right to suspend accounts that provide fraudulent information.

4. HEALTH DISCLAIMER
Bloodnet BDM is a connectivity platform. We do not provide medical advice. Consult with healthcare professionals before and after donation.

5. LIMITATION OF LIABILITY
Unreal Studio and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from the use of the platform.`
  },
  privacy: {
    title: 'Privacy Policy',
    content: `1. DATA COLLECTION
We collect your full name, blood group, geolocation (with permission), and contact information for the sole purpose of lifesaving connectivity.

2. STORAGE & SECURITY
Your data is protected by industry-standard encryption protocols. Medical documents uploaded for verification are strictly handled by authorized personnel.

3. THIRD-PARTY DISCLOSURE
We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.

4. COOKIES
Our platform uses minimal cookies to enhance performance and maintain your authentication state securely.`
  },
  security: {
    title: 'Security Protocols',
    content: `1. ENCRYPTION STANDARDS
All communication between your device and our servers is secured using TLS 1.3 encryption.

2. FIREBASE INFRASTRUCTURE
We leverage Google's secure Firebase environment for database management, ensuring 99.9% uptime and world-class physical security.

3. AUTHENTICATION
Identity is managed via secure Google Auth protocols, providing a seamless and highly secure login experience.

4. AUDIT LOGS
Every administrative action within the Bloodnet ecosystem is logged and monitored for maximum transparency.`
  }
};

const About: React.FC = () => {
  const { t } = useTranslation();
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [selectedLegal, setSelectedLegal] = useState<keyof typeof LEGAL_DOCS | null>(null);

  useEffect(() => {
    const sponsorsRef = ref(mainProject.db, 'sponsors');
    const unsubscribe = onValue(sponsorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSponsors(Object.values(data));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="px-4 pt-4 space-y-12 pb-32 overflow-hidden">
      {/* Hero Section */}
      <section className="space-y-6 text-center py-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-brand-red rounded-3xl mx-auto flex items-center justify-center blood-glow mb-6 ring-4 ring-white/5"
        >
          <Droplets size={40} className="text-white" />
        </motion.div>
        <div className="space-y-2">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-black tracking-tighter text-bg-text uppercase italic leading-none"
          >
            {t('about.story').split(' ')[0]} <span className="text-brand-red">{t('about.story').split(' ')[1] || 'গল্প'}</span>
          </motion.h2>
          <p className="text-bg-text/40 font-black uppercase tracking-[0.4em] text-[10px] italic">
            Revolutionizing Blood Donation | Unreal Studio
          </p>
        </div>
      </section>

      {/* Detailed Story Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-red rounded-full" />
          <h3 className="text-xl font-black text-bg-text italic uppercase tracking-tighter">{t('about.journey')}</h3>
        </div>
        <div className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-red/5 rounded-full blur-[80px]" />
          <p className="text-bg-text/60 leading-relaxed text-sm font-bold italic relative z-10">
            {t('about.journey_text')}
          </p>
          <div className="grid grid-cols-2 gap-4">
             <div className="glass p-4 rounded-3xl border-white/5 space-y-1 text-center">
                <p className="text-brand-red font-black text-2xl italic tracking-tighter">১০০%</p>
                <p className="text-[8px] text-bg-text/20 font-black uppercase tracking-widest leading-tight">Digital Transparency</p>
             </div>
             <div className="glass p-4 rounded-3xl border-white/5 space-y-1 text-center">
                <p className="text-blue-500 font-black text-2xl italic tracking-tighter">Realtime</p>
                <p className="text-[8px] text-bg-text/20 font-black uppercase tracking-widest leading-tight">Connectivity Logic</p>
             </div>
          </div>
        </div>
      </section>

      <GoogleAd />

      {/* Collaborators */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-red rounded-full" />
          <h3 className="text-xl font-black text-bg-text italic uppercase tracking-tighter">Collaborators</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
           {[
             { name: 'Red Cross Team', role: 'Medical Support', img: 'https://images.unsplash.com/photo-1576091160550-217359f42f8c?w=400&q=80' },
             { name: 'Local Volunteers', role: 'Ground Control', img: 'https://images.unsplash.com/photo-1559027615-cd7607dfd399?w=400&q=80' }
           ].map((collab, i) => (
             <div key={i} className="glass rounded-[32px] overflow-hidden border-white/5 space-y-4 p-4 text-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-2xl ring-2 ring-white/5">
                   <img src={collab.img} alt={collab.name} className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="font-black text-bg-text text-xs italic">{collab.name}</p>
                   <p className="text-[8px] text-bg-text/40 font-black uppercase tracking-[0.2em]">{collab.role}</p>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-red rounded-full" />
          <h3 className="text-xl font-black text-bg-text italic uppercase tracking-tighter">Our Sponsors</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-4 px-4">
           {sponsors.length > 0 ? sponsors.map((sponsor, i) => (
             <a 
               key={i} 
               href={sponsor.link} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex-shrink-0 w-48 aspect-video glass rounded-[28px] overflow-hidden border-white/5 relative group p-1"
             >
                {sponsor.type === 'iframe' ? (
                  <div className="w-full h-full pointer-events-none opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-125">
                     <iframe src={sponsor.imageUrl} className="w-full h-full" frameBorder="0" />
                  </div>
                ) : (
                  <img src={sponsor.imageUrl} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" alt={sponsor.title} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 to-transparent flex items-end p-4">
                   <p className="text-[10px] font-black text-white italic truncate">{sponsor.title}</p>
                </div>
             </a>
           )) : (
             <div className="text-bg-text/10 text-[9px] font-black uppercase tracking-widest italic py-10 w-full text-center">No Active Sponsors Listed</div>
           )}
        </div>
      </section>

      {/* Special Credit */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-red rounded-full" />
          <h3 className="text-xl font-black text-bg-text italic uppercase tracking-tighter">Special Credit</h3>
        </div>
        <div className="glass p-6 rounded-[40px] flex items-center gap-6 border-white/5 relative overflow-hidden group active:scale-95 transition-all cursor-pointer">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] group-hover:bg-brand-red/10 transition-colors" />
           <div className="w-20 h-20 rounded-[2rem] overflow-hidden ring-4 ring-white/5 bg-white/5 shrink-0 shadow-2xl relative z-10">
              <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=creator" alt="Creator" className="w-full h-full object-cover" />
           </div>
           <div className="relative z-10">
              <h4 className="text-lg font-black text-bg-text italic tracking-tighter">Unreal Architect</h4>
              <p className="text-[9px] text-bg-text/40 font-black uppercase tracking-widest mb-2">Systems & Visionary</p>
              <div className="flex gap-2">
                 <div className="p-1.5 glass rounded-lg text-bg-text/40"><Globe size={14} /></div>
                 <div className="p-1.5 glass rounded-lg text-bg-text/40"><LinkIcon size={14} /></div>
              </div>
           </div>
        </div>
      </section>

      {/* Global Unreal Studio Section */}
      <section className="relative overflow-hidden rounded-[50px] glass-red p-12 text-center space-y-8 border-brand-red/10 group shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent -z-10" />
         <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
              className="w-24 h-24 bg-white shadow-[0_20px_60px_rgba(239,68,68,0.4)] rounded-[2.5rem] flex items-center justify-center relative overflow-hidden p-2"
            >
               <UnrealLogo size={80} />
               <div className="absolute inset-0 bg-brand-red/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div className="space-y-2">
               <h4 className="text-4xl font-black tracking-tighter uppercase text-white italic whitespace-nowrap">Unreal Studio</h4>
               <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-brand-red/20" />
                  <p className="text-brand-red font-black text-[10px] tracking-[0.6em] pr-[-0.6em] leading-none mb-4 whitespace-nowrap uppercase">Innovation Beyond Reality</p>
                  <div className="h-px w-8 bg-brand-red/20" />
               </div>
            </div>
         </div>
         <button className="relative z-10 glass border-brand-red/20 px-8 py-4 rounded-3xl text-brand-red font-black text-xs uppercase tracking-widest italic hover:bg-brand-red hover:text-white transition-all shadow-xl whitespace-nowrap">
            Launch Protocol
         </button>
      </section>

      {/* Support Sections */}
      <div className="grid grid-cols-1 gap-6">
         {/* Be Our Sponsor */}
         <div className="glass p-8 rounded-[40px] border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-red/5 rounded-full blur-[80px]" />
            <div className="space-y-1">
               <h4 className="text-2xl font-black text-bg-text italic tracking-tighter">স্পন্সর হোন (Be a Sponsor)</h4>
               <p className="text-[9px] text-bg-text/40 font-black uppercase tracking-[0.3em]">Join Digital Lifeline</p>
            </div>
            <div className="space-y-3">
               <a href="tel:0123456789" className="flex items-center gap-4 group">
                  <div className="p-3 glass rounded-2xl text-bg-text/10 group-hover:text-brand-red transition-colors"><Phone size={20} /></div>
                  <span className="font-black text-bg-text italic tracking-tight">018 000 000 00</span>
               </a>
               <a href="mailto:contact@bloodnet.app" className="flex items-center gap-4 group">
                  <div className="p-3 glass rounded-2xl text-bg-text/10 group-hover:text-brand-red transition-colors"><Mail size={20} /></div>
                  <span className="font-black text-bg-text italic tracking-tight">sponsor@bloodnet.app</span>
               </a>
               <a href="https://wa.me/88018" className="flex items-center gap-4 group">
                  <div className="p-3 glass rounded-2xl text-bg-text/10 group-hover:text-emerald-500 transition-colors"><MessageCircle size={20} /></div>
                  <span className="font-black text-bg-text italic tracking-tight">WhatsApp Messenger</span>
               </a>
            </div>
         </div>

         {/* Donate Us */}
         <div className="glass-red p-8 rounded-[40px] border-brand-red/10 space-y-6 relative overflow-hidden">
            <div className="space-y-1">
               <h4 className="text-2xl font-black text-white italic tracking-tighter">{t('about.support')}</h4>
               <p className="text-brand-red font-black uppercase tracking-[0.3em] text-[10px]">Your Contribution Matters</p>
            </div>
            <p className="text-[11px] text-white/70 font-bold leading-relaxed italic">{t('about.support_text')}</p>
            <div className="flex gap-3">
               <button className="flex-1 bg-brand-red text-white py-4 rounded-2xl font-black shadow-2xl shadow-brand-red/30 italic uppercase text-[10px] tracking-widest active:scale-95 transition-all whitespace-nowrap">Support Now</button>
               <button className="p-4 glass rounded-2xl text-white/40 border-white/5 active:scale-95 transition-all"><HelpCircle size={24} /></button>
            </div>
         </div>
      </div>

      {/* Legal Section */}
      <div className="space-y-3 px-2">
         <button 
           onClick={() => setSelectedLegal('terms')}
           className="w-full glass p-6 rounded-3xl border-white/5 flex items-center gap-5 active:scale-[0.98] transition-all hover:bg-white/5"
         >
            <div className="p-3 glass rounded-xl text-bg-text/10 shrink-0"><FileText size={20} /></div>
            <div className="text-left">
               <p className="font-black text-bg-text italic tracking-tight">Terms & Condition</p>
               <p className="text-[8px] text-bg-text/40 font-black uppercase tracking-widest">Last updated 2024.11</p>
            </div>
            <ChevronRight className="ml-auto text-bg-text/10" size={20} />
         </button>

         <button 
           onClick={() => setSelectedLegal('privacy')}
           className="w-full glass p-6 rounded-3xl border-white/5 flex items-center gap-5 active:scale-[0.98] transition-all hover:bg-white/5"
         >
            <div className="p-3 glass rounded-xl text-bg-text/10 shrink-0"><Lock size={20} /></div>
            <div className="text-left">
               <p className="font-black text-bg-text italic tracking-tight">Privacy Policy</p>
               <p className="text-[8px] text-bg-text/40 font-black uppercase tracking-widest">Security guidelines</p>
            </div>
            <ChevronRight className="ml-auto text-bg-text/10" size={20} />
         </button>

         <button 
           onClick={() => setSelectedLegal('security')}
           className="w-full glass p-6 rounded-3xl border-white/5 flex items-center gap-5 active:scale-[0.98] transition-all hover:bg-white/5"
         >
            <div className="p-3 glass rounded-xl text-bg-text/10 shrink-0"><Shield size={20} /></div>
            <div className="text-left">
               <p className="font-black text-bg-text italic tracking-tight">Security Documents</p>
               <p className="text-[8px] text-bg-text/40 font-black uppercase tracking-widest">Encryption protocols</p>
            </div>
            <ChevronRight className="ml-auto text-bg-text/10" size={20} />
         </button>
      </div>

      {/* Legal Popup Modal */}
      {selectedLegal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             onClick={() => setSelectedLegal(null)}
             className="absolute inset-0 bg-bg-dark/80 backdrop-blur-xl" 
           />
           <motion.div 
             initial={{ y: 100, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="glass w-full max-w-lg rounded-[40px] border border-white/5 relative z-10 overflow-hidden"
           >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div>
                    <h5 className="text-2xl font-black text-bg-text italic uppercase tracking-tighter">{LEGAL_DOCS[selectedLegal].title}</h5>
                    <p className="text-[8px] font-black text-bg-text/40 uppercase tracking-widest">Protocol Alignment 2024</p>
                 </div>
                 <button 
                   onClick={() => setSelectedLegal(null)}
                   className="p-4 glass rounded-2xl text-brand-red active:scale-95 transition-all"
                 >
                    <X size={24} />
                 </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-6 text-sm font-bold italic text-bg-text/60 leading-relaxed whitespace-pre-line">
                    {LEGAL_DOCS[selectedLegal].content}
                 </div>
              </div>
              <div className="p-8 bg-white/[0.02]">
                 <button 
                   onClick={() => setSelectedLegal(null)}
                   className="w-full bg-brand-red text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-red/20 active:scale-95 transition-all"
                 >
                    Acknowledged
                 </button>
              </div>
           </motion.div>
        </div>
      )}

      <div className="text-center py-10 space-y-4">
         <p className="text-[8px] text-bg-text/40 font-black uppercase tracking-[0.6em]">Design & Vision by Unreal Studio</p>
         <div className="flex items-center justify-center gap-6 text-bg-text/5">
            <Star size={14} />
            <Award size={14} />
            <Droplets size={14} />
         </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const LinkIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

export default About;
