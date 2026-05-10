import React from 'react';

const GoogleAd = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full glass rounded-2xl flex items-center justify-center p-4 min-h-[100px] border-dashed border-white/10 ${className}`}>
      <div className="text-center">
        <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-medium font-mono">Google AdSense</p>
        <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">গুগল অ্যাডসেন্স বিজ্ঞাপন</p>
      </div>
    </div>
  );
};

export default GoogleAd;
