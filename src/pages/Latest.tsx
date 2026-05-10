import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Heart, Share2, Send, QrCode, X, Copy, ExternalLink, Droplets } from 'lucide-react';
import QRCode from 'react-qr-code';
import GoogleAd from '../components/GoogleAd';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { mainProject } from '../lib/firebase';

const Latest: React.FC = () => {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const blogsRef = ref(mainProject.db, 'announcements');
    const blogsQuery = query(blogsRef, limitToLast(20));

    const unsubscribe = onValue(blogsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const blogsList = Object.entries(data).map(([id, val]: [string, any]) => ({
          ...val,
          id
        })).reverse(); // Newest first
        setBlogs(blogsList);
      } else {
        setBlogs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedPosts(newLiked);
  };

  return (
    <div className="px-4 pt-4 space-y-6 pb-32">
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-1 h-6 bg-brand-red rounded-full" />
        <h2 className="text-xl font-black italic text-bg-text uppercase tracking-tighter">{t('latest.announcements')}</h2>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] text-bg-text/40 font-black uppercase tracking-widest italic">Loading Digital Feed...</p>
          </div>
        ) : (
          blogs.length > 0 ? (
            blogs.map((blog) => (
              <motion.div 
                key={blog.id} 
                className="glass rounded-[32px] overflow-hidden shadow-2xl space-y-0 border-white/5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {blog.media?.[0] && (
                  <div className="relative h-48 overflow-hidden">
                    <img src={blog.media[0].url} alt={blog.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5">
                      <h3 className="text-xl font-black text-white leading-none uppercase tracking-tighter italic">{blog.title}</h3>
                      <p className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] mt-1">{blog.subtitle}</p>
                    </div>
                  </div>
                )}
                
                <div className="p-5 space-y-4">
                  <p className="text-bg-text/60 leading-snug text-xs font-bold italic">
                    {blog.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(blog.id)}
                        className={`flex items-center gap-1.5 transition-all ${likedPosts.has(blog.id) ? 'text-brand-red scale-110' : 'text-bg-text/40'}`}
                      >
                        <Heart size={18} fill={likedPosts.has(blog.id) ? 'currentColor' : 'none'} />
                        <span className="font-black text-[10px] tracking-widest italic">{(blog.likes || 0) + (likedPosts.has(blog.id) ? 1 : 0)}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-bg-text/40">
                        <MessageCircle size={18} />
                        <span className="font-black text-[10px] tracking-widest italic">{blog.comments || 0}</span>
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowQR(blog.id)}
                      className="glass p-2.5 rounded-xl text-bg-text/40 active:scale-95 transition-all border-white/5"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 glass rounded-[32px] border-white/5 text-center">
              <p className="text-[10px] text-bg-text/20 font-black uppercase tracking-widest italic leading-relaxed">
                {t('latest.announcements')}
              </p>
            </div>
          )
        )}
      </div>

      <GoogleAd />

      {/* Share Section - Compacted */}
      <div className="glass p-6 rounded-[32px] space-y-4 relative overflow-hidden border-white/5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full blur-2xl -mr-12 -mt-12" />
        <div className="space-y-1 relative z-10">
          <h3 className="text-lg font-black text-bg-text italic tracking-tighter">{t('latest.share_thoughts')}</h3>
          <p className="text-[8px] text-bg-text/40 font-black uppercase tracking-[0.3em]">Share Your Digital Experience</p>
        </div>
        
        <div className="space-y-3 relative z-10">
          <input 
            type="email" 
            placeholder={t('common.email')}
            className="w-full glass border-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-red/10 transition-all text-xs text-bg-text placeholder:text-bg-text/30 font-bold"
          />
          <textarea 
            placeholder={t('common.thoughts')}
            rows={3}
            className="w-full glass border-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-red/10 transition-all text-xs text-bg-text placeholder:text-bg-text/30 resize-none font-bold"
          />
          <button className="w-full bg-brand-red text-white py-4 rounded-2xl font-black shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2 active:scale-95 transition-all uppercase tracking-widest text-xs italic">
             {t('common.send')}
             <Send size={16} />
          </button>
        </div>
      </div>

      {/* QR Share Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-1 rounded-[40px] relative z-10 w-full max-w-sm"
            >
              <div className="bg-bg-dark/10 backdrop-blur-xl rounded-[38px] p-8 space-y-8 flex flex-col items-center border border-white/20">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                    <Droplets className="text-brand-red" size={24} />
                  </div>
                  <h4 className="text-bg-text font-bold text-lg">{t('common.share_title')}</h4>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-2xl relative">
                  <QRCode 
                    value={`${window.location.origin}/post/${showQR}`} 
                    size={200}
                    fgColor="#111827"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100">
                       <Droplets className="text-brand-red" size={18} />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                   <button className="w-full bg-bg-text/10 hover:bg-bg-text/20 text-bg-text py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
                      <Copy size={20} />
                      {t('common.copy_link')}
                   </button>
                   <button 
                     onClick={() => setShowQR(null)}
                     className="w-full text-bg-text/50 py-2 font-bold text-sm tracking-widest uppercase"
                   >
                      {t('common.close')}
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Latest;
