import React, { useRef } from 'react';
import { ShieldCheck, Droplets, Smartphone, MapPin, User as UserIcon, Download, Copy, Check, Briefcase, Hash, Globe, Mail } from 'lucide-react';
import { toPng } from 'html-to-image';
import { User } from '../types';
import { useTranslation } from 'react-i18next';

interface ProfileCardProps {
  user: User;
  onClose?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onClose }) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'copied_mobile' | 'copied_loc' | 'copied_link'>('idle');

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 4,
        quality: 1,
        skipFonts: false,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `bloodnet-card-${user.fullName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const copyToClipboard = (text: string, status: 'copied_mobile' | 'copied_loc' | 'copied_link') => {
    navigator.clipboard.writeText(text || '');
    setCopyStatus(status);
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const fullLocation = `${user.address}, ${user.upazilla || ''}, ${user.district || ''}, ${user.division || ''}`.replace(/, ,/g, ',').replace(/, $/g, '').replace(/^, /, '').trim();

  return (
    <div className="w-full max-w-[360px] flex flex-col items-center gap-4 my-4">
      {/* Capture Target */}
      <div 
        ref={cardRef} 
        className="w-full aspect-[4/5] bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0a0a0a] rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col p-6 space-y-4 relative border border-white/10 ring-1 ring-white/5"
      >
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
        
        {/* Top Branding Section */}
        <div className="flex items-center justify-between relative z-10 w-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-red rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <Droplets className="text-white" size={16} />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-black tracking-[-0.05em] text-white uppercase italic text-sm">Bloodnet</span>
              <span className="text-[5px] text-brand-red font-black uppercase tracking-[0.3em] italic">Visual Reality</span>
            </div>
          </div>
          <div className="bg-white/5 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 shadow-inner">
             <div className="w-1 h-1 bg-brand-red rounded-full animate-pulse" />
             <p className="text-[6px] font-black text-white/60 uppercase tracking-[0.2em]">Official Member</p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex flex-col items-center text-center space-y-3 flex-grow justify-center relative z-10">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] overflow-hidden ring-[4px] ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 bg-[#151515] transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
              <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt={user.fullName} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-brand-red/10 blur-[40px] -z-10 rounded-full animate-pulse" />
            
            {/* Status Indicator */}
            <div className={`absolute top-0 right-0 z-20 w-3.5 h-3.5 rounded-full border-2 border-[#1a1a1a] shadow-lg ${user.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="space-y-1.5">
            {/* Name + Badge */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-1.5">
                <h4 className="text-xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {user.fullName}
                </h4>
                {user.isVerified ? (
                  <div className="bg-blue-500 text-white p-0.5 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400/20">
                    <Check size={8} className="stroke-[4]" />
                  </div>
                ) : (
                  <div className="bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 flex items-center gap-1">
                     <span className="text-[5px] text-white/30 font-black uppercase tracking-widest italic">Identity Pending</span>
                  </div>
                )}
              </div>
              
              {/* User UID Label */}
              <div className="flex items-center gap-1 opacity-30">
                <Hash size={5} className="text-brand-red" />
                <p className="text-[5px] text-white font-mono uppercase tracking-[0.2em]">{user.uid.substring(0, 12)}</p>
              </div>
            </div>
            
            {/* Badges / Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
               <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg border border-white/10 shadow-sm">
                  <Briefcase size={7} className="text-brand-red" />
                  <span className="text-[7px] font-black uppercase text-white/80 italic">{user.occupation || user.work || 'Life Saver'}</span>
               </div>
               <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded-lg border border-white/10 shadow-sm">
                  <UserIcon size={7} className="text-blue-400" />
                  <span className="text-[7px] font-black uppercase text-white/80 italic">{user.gender === 'male' ? t('common.male') : user.gender === 'female' ? t('common.female') : (user.gender || 'User')}</span>
               </div>
            </div>
          </div>
          
          {/* Blood Group - Focus */}
          <div className="relative px-8 py-1 group cursor-default">
            <div className="absolute inset-0 bg-brand-red/20 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-brand-red text-white py-1.5 px-8 rounded-xl font-black text-2xl shadow-[0_12px_25px_-5px_rgba(239,68,68,0.6)] tracking-widest italic relative z-10 ring-2 ring-white/10">
              {user.bloodGroup}
            </div>
          </div>
        </div>

        {/* Informative Stats Section */}
        <div className="grid grid-cols-2 gap-3 relative z-10 px-0.5 mb-1">
           <div className="glass-card bg-white/[0.03] p-3 rounded-2xl border-white/10 flex flex-col gap-1.5 shadow-xl group hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/60 transition-colors">
                 <Smartphone size={11} className="text-brand-red" />
                 <p className="text-[7px] tracking-[0.1em] font-mono font-black uppercase">Private Line</p>
              </div>
              <p className="text-white text-[11px] font-black italic tracking-tight">{user.mobile || '********'}</p>
           </div>
           <div className="glass-card bg-white/[0.03] p-3 rounded-2xl border-white/10 flex flex-col gap-1.5 shadow-xl group hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/60 transition-colors">
                 <Globe size={11} className="text-blue-400" />
                 <p className="text-[7px] tracking-[0.1em] font-mono font-black uppercase">Region/Sec</p>
              </div>
              <p className="text-white text-[10px] font-black italic tracking-tight line-clamp-1">{user.address || 'Address'}, {user.district || ''}</p>
           </div>
        </div>

        {/* Footer Section */}
        <div className="pt-4 text-center relative z-10 border-t border-white/10 mt-auto">
           <div className="flex items-center justify-center gap-1 mb-2 opacity-30">
              <MapPin size={8} className="text-brand-red" />
              <p className="text-[6px] text-white/80 font-mono uppercase tracking-[0.1em] line-clamp-1 italic">{fullLocation || 'Digital Location'}</p>
           </div>
           
           <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-3 w-full">
                <div className="h-[0.5px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex items-center gap-1.5 px-3 py-1 glass rounded-full border border-white/10 shadow-lg">
                   <div className="w-2 h-2 bg-brand-red rounded-[2px] rotate-45" />
                   <span className="text-[7px] font-black text-white/90 uppercase tracking-[0.2em] italic">Unreal Studio</span>
                </div>
                <div className="h-[0.5px] flex-1 bg-gradient-to-l from-transparent via-white/20 to-transparent" />
              </div>
              <p className="text-[5px] text-white/20 font-black uppercase tracking-[0.4em] italic mb-1">Architectural Digital Intelligence</p>
           </div>
        </div>

        {/* Background Glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-red/20 rounded-full blur-[80px] -z-0 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -z-0 pointer-events-none" />
      </div>

      {/* Interactive Controls */}
      <div className="w-full space-y-3 px-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={downloadCard}
            className="group relative overflow-hidden bg-white hover:bg-white/90 text-bg-dark py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] uppercase tracking-widest italic text-xs"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand-red/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Download size={16} />
            Download
          </button>
          <button 
            onClick={() => copyToClipboard(`${window.location.origin}/profile/${user.uid}`, 'copied_link')}
            className={`py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl uppercase tracking-widest italic text-xs border ${copyStatus === 'copied_link' ? 'bg-green-600 border-green-500 text-white' : 'glass bg-white/5 text-white border-white/10 hover:border-white/20'}`}
          >
            {copyStatus === 'copied_link' ? <Check size={16} /> : <Copy size={16} />}
            {copyStatus === 'copied_link' ? 'Copied' : 'Share ID'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <button 
             onClick={() => copyToClipboard(user.mobile, 'copied_mobile')}
             className={`py-3 rounded-xl font-black text-[9px] active:scale-95 transition-all uppercase tracking-[0.15em] italic border ${copyStatus === 'copied_mobile' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'glass text-white/40 border-white/5 hover:border-white/10'}`}
           >
              Copy Mobile
           </button>
           <button 
             onClick={() => copyToClipboard(fullLocation, 'copied_loc')}
             className={`py-3 rounded-xl font-black text-[9px] active:scale-95 transition-all uppercase tracking-[0.15em] italic border ${copyStatus === 'copied_loc' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'glass text-white/40 border-white/5 hover:border-white/10'}`}
           >
              Copy Address
           </button>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="w-full glass bg-bg-text/5 text-bg-text/30 hover:text-bg-text/50 py-2.5 rounded-xl font-black uppercase tracking-[0.4em] text-[9px] active:scale-95 transition-all italic border border-bg-text/5"
          >
            Close Identity
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
