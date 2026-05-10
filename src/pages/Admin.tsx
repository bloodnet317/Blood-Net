import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ShieldCheck, FileText, BarChart3, Settings, 
  Search, Check, X, Edit, Trash, Plus, Send, 
  ExternalLink, BarChart, TrendingUp, UserPlus, Droplet,
  LogOut, Lock, RefreshCcw, Award, ShieldAlert,
  MessageSquare, LayoutDashboard, Megaphone, Activity,
  Copy, Save, User as UserIcon, Trash2, Reply,
  Eye, Monitor, Calendar, Clock, MapPin, Phone, Mail, Link as LinkIcon
} from 'lucide-react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { mainProject } from '../lib/firebase';
import { User, BlogPost, Sponsor, VerificationRequest, Thought, AdminActivity, PushedAd, Comment } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('users');
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<BlogPost[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [pushedAds, setPushedAds] = useState<PushedAd[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User, direction: 'asc' | 'desc' } | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingAd, setEditingAd] = useState<PushedAd | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState<string | null>(null);

  // Form States
  const [newBlog, setNewBlog] = useState({ title: '', subtitle: '', content: '', imageUrl: '', media: [] as any[] });
  const [newSponsor, setNewSponsor] = useState({ title: '', imageUrl: '', link: '', type: 'image' as 'image' | 'iframe' });
  const [newAd, setNewAd] = useState({ title: '', subtitle: '', mediaUrl: '', link: '', durationInDays: 30 });

  useEffect(() => {
    if (!isAuthed) return;

    const dataRefs = {
      users: ref(mainProject.db, 'users'),
      blogs: ref(mainProject.db, 'announcements'),
      sponsors: ref(mainProject.db, 'sponsors'),
      verify: ref(mainProject.db, 'verificationRequests'),
      thoughts: ref(mainProject.db, 'thoughts'),
      activity: ref(mainProject.db, 'adminActivities'),
      ads: ref(mainProject.db, 'pushedAds'),
      comments: ref(mainProject.db, 'comments')
    };

    const unsubs = Object.entries(dataRefs).map(([key, r]) => 
      onValue(r, (snapshot) => {
        const data = snapshot.val();
        const list = data ? Object.entries(data).map(([id, val]: [string, any]) => ({ ...val, id, uid: id })) : [];
        
        switch(key) {
          case 'users': setUsers(list as User[]); break;
          case 'blogs': setAnnouncements(list.reverse() as BlogPost[]); break;
          case 'sponsors': setSponsors(list.reverse() as Sponsor[]); break;
          case 'verify': setVerifications(list.reverse() as VerificationRequest[]); break;
          case 'thoughts': setThoughts(list.reverse() as Thought[]); break;
          case 'activity': setActivities(list.reverse() as AdminActivity[]); break;
          case 'ads': setPushedAds(list.reverse() as PushedAd[]); break;
          case 'comments': setComments(list.reverse() as Comment[]); break;
        }
      })
    );

    setLoading(false);
    return () => unsubs.forEach(u => u());
  }, [isAuthed]);

  const logActivity = async (action: string, summary: string) => {
    const activityRef = ref(mainProject.db, 'adminActivities');
    await push(activityRef, {
      action,
      summary,
      timestamp: Date.now()
    });
  };

  const requestSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let items = [...users];
    if (searchQuery) {
      items = items.filter(u => 
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile?.includes(searchQuery)
      );
    }
    if (sortConfig !== null) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === undefined) return 1;
        if (bVal === undefined) return -1;
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [users, sortConfig, searchQuery]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '234568') {
      setIsAuthed(true);
      logActivity('Login', 'Admin logged in to the control panel');
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  // User Management
  const handleUpdateUser = async (uid: string, data: Partial<User>) => {
    await update(ref(mainProject.db, `users/${uid}`), data);
    setEditingUser(null);
    logActivity('User Update', `Updated details for user ${uid}`);
  };

  const setAvailability = async (uid: string, active: boolean) => {
    await update(ref(mainProject.db, `users/${uid}`), { isActive: active });
    logActivity('User Status', `${active ? 'Activated' : 'Deactivated'} user ${uid}`);
  };

  // Verification
  const handleApproveVerification = async (req: VerificationRequest) => {
    try {
      if (req.type === 'Blood Donation Document') {
        const freezeDuration = 120 * 24 * 60 * 60 * 1000;
        const nextAvailable = Date.now() + freezeDuration;
        const user = users.find(u => u.uid === req.userId);
        await update(ref(mainProject.db, `users/${req.userId}`), { 
          isAvailable: false,
          lastDonatedAt: Date.now(),
          donationCount: (user?.donationCount || 0) + 1,
          nextStatusUpdate: nextAvailable
        });
      } else {
        await update(ref(mainProject.db, `users/${req.userId}`), { 
          isVerified: true,
          verificationDoc: req.documentUrl
        });
      }
      
      await update(ref(mainProject.db, `verificationRequests/${req.id}`), { status: 'approved' });
      await logActivity('Verification Approved', `Approved ${req.type} for ${req.userName}`);
      alert('Approved successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectVerification = async (req: VerificationRequest) => {
    if (!rejectionReason) return alert('Please provide a reason');
    await update(ref(mainProject.db, `verificationRequests/${req.id}`), { 
      status: 'rejected',
      rejectionReason 
    });
    setRejectionReason('');
    setShowRejectionModal(null);
    logActivity('Verification Rejected', `Rejected ${req.type} for ${req.userName}. Reason: ${rejectionReason}`);
  };

  // Blog Management
  const handlePostBlog = async () => {
    if (!newBlog.title) return;
    const blogsRef = ref(mainProject.db, 'announcements');
    const blogData = {
      ...newBlog,
      createdAt: Date.now(),
      likes: 0,
      comments: 0,
      media: newBlog.imageUrl ? [{ type: 'image', url: newBlog.imageUrl }, ...newBlog.media] : newBlog.media
    };

    if (editingBlog) {
      await update(ref(mainProject.db, `announcements/${editingBlog.id}`), blogData);
      setEditingBlog(null);
      logActivity('Blog Update', `Updated blog post: ${newBlog.title}`);
    } else {
      await push(blogsRef, blogData);
      logActivity('Blog Publish', `Published new blog: ${newBlog.title}`);
    }
    
    setNewBlog({ title: '', subtitle: '', content: '', imageUrl: '', media: [] });
  };

  const deleteBlog = async (id: string) => {
    if (confirm('Delete this blog?')) {
      await remove(ref(mainProject.db, `announcements/${id}`));
      logActivity('Blog Delete', `Deleted blog post ${id}`);
    }
  };

  // Sponsor Management
  const handlePostSponsor = async () => {
    const sponsorsRef = ref(mainProject.db, 'sponsors');
    await push(sponsorsRef, { ...newSponsor, createdAt: Date.now() });
    setNewSponsor({ title: '', imageUrl: '', link: '', type: 'image' });
    logActivity('Sponsor Add', `Added sponsor: ${newSponsor.title}`);
  };

  // Ads Management
  const handlePostAd = async () => {
    const adsRef = ref(mainProject.db, 'pushedAds');
    const adData = { ...newAd, createdAt: Date.now() };
    if (editingAd) {
      await update(ref(mainProject.db, `pushedAds/${editingAd.id}`), adData);
      setEditingAd(null);
    } else {
      await push(adsRef, adData);
    }
    setNewAd({ title: '', subtitle: '', mediaUrl: '', link: '', durationInDays: 30 });
    logActivity('Ad Publish', `Published/Updated push ad: ${newAd.title}`);
  };

  // Comments
  const deleteComment = async (id: string) => {
    await remove(ref(mainProject.db, `comments/${id}`));
    logActivity('Comment Delete', `Deleted comment ${id}`);
  };

  // Analytics Helpers
  const getAnalyticsData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    
    // Last 7 days activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        registrations: users.filter(u => {
          const joined = new Date(u.joinedAt || 0);
          return joined.getDate() === d.getDate() && joined.getMonth() === d.getMonth();
        }).length,
        donations: verifications.filter(v => {
          const created = new Date(v.timestamp || 0);
          return created.getDate() === d.getDate() && created.getMonth() === d.getMonth() && v.type === 'Blood Donation Document' && v.status === 'approved';
        }).length
      };
    });

    return last7Days;
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-red/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-red/5 blur-[120px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm glass p-8 rounded-[40px] space-y-8 flex flex-col items-center border-white/5 relative z-10"
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-4">
             <UnrealLogo size={80} />
          </div>
          <div className="text-center space-y-1">
             <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">কন্ট্রোল প্যানেল</h2>
             <p className="text-bg-text/20 text-[8px] font-black uppercase tracking-[0.4em]">Administration Access</p>
          </div>
          <form onSubmit={handleLogin} className="w-full space-y-6">
             <input 
               type="password" 
               placeholder="••••••"
               className="w-full glass border-white/5 p-5 rounded-2xl text-bg-text outline-none text-center tracking-[1em] text-xl font-black"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
             />
             <button className="w-full bg-brand-red text-white py-4 rounded-2xl font-black active:scale-95 transition-all uppercase tracking-widest text-sm italic">
                প্রবেশ করুন
             </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const SidebarItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
        activeTab === id ? 'glass-red text-brand-red' : 'text-bg-text/40 hover:text-bg-text/70'
      }`}
    >
      <Icon size={18} />
      <span className="font-black text-[12px] tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-bg-dark flex">
      {/* Sidebar */}
      <div className="w-72 glass border-r border-white/5 p-8 flex flex-col space-y-8 h-screen sticky top-0 overflow-y-auto">
         <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xl p-1.5">
                <UnrealLogo size={40} />
             </div>
             <div>
               <h1 className="font-black text-lg tracking-tighter text-bg-text uppercase italic leading-none">Console</h1>
               <span className="text-[8px] text-bg-text/20 font-black uppercase tracking-[0.2em]">BDM Node v3.0</span>
             </div>
         </div>

         <div className="flex-1 space-y-1">
            <p className="text-[10px] font-black text-bg-text/10 uppercase tracking-widest mb-4 px-2 italic">Management</p>
            <SidebarItem id="users" icon={Users} label="Users Database" />
            <SidebarItem id="verifications" icon={ShieldCheck} label="Identity Verification" />
            <SidebarItem id="donations" icon={Droplet} label="Donation Records" />
            <SidebarItem id="thoughts" icon={MessageSquare} label="User Thoughts" />
            
            <p className="text-[10px] font-black text-bg-text/10 uppercase tracking-widest mt-8 mb-4 px-2 italic">Presence</p>
            <SidebarItem id="blogs" icon={FileText} label="Public Blogs" />
            <SidebarItem id="sponsors" icon={Award} label="Sponsors" />
            <SidebarItem id="ads" icon={Megaphone} label="Push ADS" />
            
            <p className="text-[10px] font-black text-bg-text/10 uppercase tracking-widest mt-8 mb-4 px-2 italic">System</p>
            <SidebarItem id="analytics" icon={BarChart3} label="Global Analytics" />
            <SidebarItem id="comments" icon={MessageSquare} label="Blog Comments" />
            <SidebarItem id="activity" icon={Activity} label="Admin Activity" />
         </div>

         <button 
           onClick={() => setIsAuthed(false)}
           className="mt-auto flex items-center gap-4 p-4 glass rounded-2xl text-brand-red/40 hover:text-brand-red font-black text-[10px] uppercase tracking-widest border border-white/5"
         >
            <LogOut size={18} />
            Secure Logout
         </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-10 overflow-y-auto h-screen selection:bg-brand-red selection:text-white">
         <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Header */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-brand-red rounded-full" />
                  <h2 className="text-4xl font-black text-bg-text italic uppercase tracking-tighter">{activeTab.replace('-', ' ')}</h2>
               </div>
               <div className="flex items-center glass p-3 rounded-2xl gap-4 border border-white/5">
                  <Clock className="text-brand-red" size={18} />
                  <span className="text-[10px] font-black text-bg-text italic uppercase tracking-widest">
                    {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
               </div>
            </div>

            {/* Content Switcher */}
            <div className="glass rounded-[40px] p-10 border border-white/5 min-h-[70vh] relative shadow-2xl overflow-hidden">
               
               {/* SEARCH OVERLAY FOR LISTS */}
               {['users', 'thoughts', 'verifications', 'donations'].includes(activeTab) && (
                 <div className="mb-10 flex gap-4">
                    <div className="flex-1 glass p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                       <Search size={20} className="text-bg-text/20" />
                       <input 
                         placeholder="Search data records..." 
                         className="bg-transparent border-none outline-none text-bg-text font-bold italic flex-1"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                 </div>
               )}

               {/* TAB: USERS */}
               {activeTab === 'users' && (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="text-[10px] text-bg-text/30 font-black uppercase tracking-[0.4em] border-b border-white/5 italic">
                             <th className="pb-6 px-4 cursor-pointer hover:text-bg-text transition-colors" onClick={() => requestSort('fullName')}>Identify</th>
                             <th className="pb-6 px-4 cursor-pointer hover:text-bg-text transition-colors" onClick={() => requestSort('mobile')}>Contact</th>
                             <th className="pb-6 px-4 cursor-pointer hover:text-bg-text transition-colors" onClick={() => requestSort('donationCount')}>Metrics</th>
                             <th className="pb-6 px-4 cursor-pointer hover:text-bg-text transition-colors" onClick={() => requestSort('isVerified')}>Status</th>
                             <th className="pb-6 px-4 text-right">Matrix</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {sortedUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-white/[0.02] group transition-all">
                               <td className="py-5 px-4">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 glass rounded-xl overflow-hidden ring-1 ring-white/5 shadow-lg group-hover:scale-110 transition-transform">
                                       <img src={u.photoURL} className="w-full h-full object-cover" />
                                     </div>
                                     <div>
                                        <p className="font-black text-bg-text text-sm italic">{u.fullName}</p>
                                        <p className="text-[10px] font-mono text-brand-red font-black">{u.bloodGroup}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-5 px-4 font-bold text-xs text-bg-text/60 italic">
                                  <p>{u.mobile}</p>
                                  <p className="text-[9px] opacity-40">{u.address}</p>
                               </td>
                               <td className="py-5 px-4">
                                  <div className="flex gap-4">
                                     <div className="text-center">
                                        <p className="text-[8px] font-black text-bg-text/20 uppercase tracking-widest">Donations</p>
                                        <p className="text-xs font-black italic">{u.donationCount || 0}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="py-5 px-4">
                                  <div className="flex items-center gap-2">
                                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest border ${u.isVerified ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-bg-text/5 text-bg-text/20 border-white/5'}`}>
                                        {u.isVerified ? 'VERIFIED' : 'PENDING'}
                                     </span>
                                     <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest border ${u.isActive !== false ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-brand-red/10 text-brand-red border-brand-red/20'}`}>
                                        {u.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                                     </span>
                                  </div>
                               </td>
                               <td className="py-5 px-4 text-right">
                                  <div className="flex justify-end gap-2">
                                     <button 
                                       onClick={() => handleUpdateUser(u.uid, { ...u, isVerified: true })}
                                       className="p-2.5 glass rounded-xl text-blue-500/40 hover:text-blue-500 transition-all"
                                       title="Auto Verify ID"
                                     >
                                        <ShieldCheck size={16} />
                                     </button>
                                     <button 
                                       onClick={() => handleUpdateUser(u.uid, { 
                                         ...u, 
                                         donationCount: (u.donationCount || 0) + 1,
                                         lastDonatedAt: Date.now(),
                                         isAvailable: false
                                       })}
                                       className="p-2.5 glass rounded-xl text-brand-red/40 hover:text-brand-red transition-all"
                                       title="Auto Record Donation"
                                     >
                                        <Droplet size={16} />
                                     </button>
                                     <button 
                                       onClick={() => setEditingUser(u)} 
                                       className="p-2.5 glass rounded-xl text-bg-text/20 hover:text-bg-text transition-all"
                                     >
                                        <Edit size={16} />
                                     </button>
                                     <button 
                                       onClick={() => setAvailability(u.uid, u.isActive === false)} 
                                       className="p-2.5 glass rounded-xl text-brand-red/20 hover:text-brand-red transition-all"
                                     >
                                       {u.isActive === false ? <Check size={16} /> : <ShieldAlert size={16} />}
                                     </button>
                                  </div>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}

               {/* TAB: VERIFICATIONS */}
               {activeTab === 'verifications' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {verifications.filter(v => v.status === 'pending' && v.type === 'Identity Verification').map(v => (
                       <div key={v.id} className="glass p-8 rounded-[40px] border border-white/5 flex flex-col gap-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl shadow-xl shadow-blue-500/10"><ShieldCheck size={24} /></div>
                                <div>
                                   <h4 className="font-black text-lg italic text-bg-text">{v.userName}</h4>
                                   <p className="text-[9px] font-black uppercase text-bg-text/40 tracking-widest">{v.userEmail}</p>
                                </div>
                             </div>
                             <a href={v.documentUrl} target="_blank" className="p-4 glass rounded-2xl text-blue-500"><ExternalLink size={20} /></a>
                          </div>
                          
                          <div className="h-48 glass rounded-3xl overflow-hidden relative group">
                             <img src={v.documentUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-zoom-in" />
                             <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 to-transparent flex items-end p-6">
                                <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic">Click to Inspect Original Protocol</p>
                             </div>
                          </div>

                          <div className="flex gap-3">
                             <button 
                               onClick={() => {
                                 const user = users.find(u => u.uid === v.userId);
                                 if (user) setEditingUser(user);
                               }}
                               className="flex-1 glass text-blue-500 py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] border border-blue-500/20 active:scale-95 transition-all"
                             >
                               Review Account
                             </button>
                             <button onClick={() => handleApproveVerification(v)} className="flex-[1.5] bg-blue-500 text-white py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Verify Identity</button>
                             <button onClick={() => setShowRejectionModal(v.id)} className="flex-1 glass text-brand-red py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] border border-white/5 active:scale-95 transition-all">Reject</button>
                          </div>
                       </div>
                    ))}
                    {verifications.filter(v => v.status === 'pending' && v.type === 'Identity Verification').length === 0 && (
                      <div className="col-span-2 text-center py-40 opacity-10">
                        <ShieldCheck size={80} className="mx-auto mb-6" />
                        <h4 className="text-2xl font-black italic uppercase tracking-widest">Everything Clear</h4>
                      </div>
                    )}
                 </div>
               )}

               {/* TAB: DONATIONS */}
               {activeTab === 'donations' && (
                 <div className="grid grid-cols-1 gap-6">
                    {verifications.filter(v => v.status === 'pending' && v.type === 'Blood Donation Document').map(v => (
                       <div key={v.id} className="glass p-10 rounded-[50px] border border-white/5 flex items-center justify-between gap-10">
                          <div className="flex items-center gap-8 flex-1">
                             <div className="relative">
                               <div className="w-40 h-28 glass rounded-3xl overflow-hidden ring-4 ring-brand-red/5">
                                  <img src={v.documentUrl} className="w-full h-full object-cover" />
                               </div>
                               <a href={v.documentUrl} target="_blank" className="absolute -bottom-2 -right-2 p-3 bg-brand-red text-white rounded-xl shadow-xl"><ExternalLink size={16} /></a>
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-2xl font-black italic text-bg-text tracking-tighter">{v.userName}</h4>
                                <div className="flex gap-4 items-center">
                                   <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-red uppercase tracking-widest italic">
                                      <Droplet size={14} fill="currentColor" /> Medical Report
                                   </div>
                                   <div className="text-[10px] font-black text-bg-text/30 uppercase tracking-widest italic">{v.userEmail}</div>
                                </div>
                             </div>
                          </div>

                          <div className="flex gap-4">
                             <button 
                               onClick={() => {
                                 const user = users.find(u => u.uid === v.userId);
                                 if (user) setEditingUser(user);
                               }}
                               className="px-8 py-5 glass text-blue-500 rounded-3xl font-black italic uppercase tracking-widest text-[11px] border border-blue-500/20 active:scale-95 transition-all"
                             >
                               Review Account
                             </button>
                             <button onClick={() => handleApproveVerification(v)} className="px-10 py-5 bg-brand-red text-white rounded-3xl font-black italic uppercase tracking-widest text-[11px] shadow-2xl shadow-brand-red/20 active:scale-95 transition-all">Approve Donation</button>
                             <button onClick={() => setShowRejectionModal(v.id)} className="px-10 py-5 glass text-bg-text/40 rounded-3xl font-black italic uppercase tracking-widest text-[11px] border border-white/5 active:scale-95 transition-all">Reject Doc</button>
                          </div>
                       </div>
                    ))}
                    {verifications.filter(v => v.status === 'pending' && v.type === 'Blood Donation Document').length === 0 && (
                      <div className="text-center py-40 opacity-10">
                        <Droplet size={80} className="mx-auto mb-6" />
                        <h4 className="text-2xl font-black italic uppercase tracking-widest">No Donation Submissions</h4>
                      </div>
                    )}
                 </div>
               )}

               {/* TAB: THOUGHTS */}
               {activeTab === 'thoughts' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thoughts.filter(t => t.description?.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                       <div key={t.id} className="glass p-8 rounded-[40px] border border-white/5 flex flex-col justify-between group">
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white"><MessageSquare size={18} /></div>
                                <button onClick={() => {
                                  navigator.clipboard.writeText(t.description);
                                  alert('Copied!');
                                }} className="p-3 glass rounded-xl text-bg-text/20 hover:text-bg-text"><Copy size={16} /></button>
                             </div>
                             <p className="text-bg-text/60 font-bold italic leading-relaxed text-sm">"{t.description}"</p>
                          </div>
                          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                             <div>
                                <p className="text-[10px] font-black text-bg-text uppercase tracking-widest italic truncate max-w-[150px]">{t.email || 'Anonymous'}</p>
                                <p className="text-[8px] text-bg-text/20 font-black uppercase tracking-widest font-mono">Thought Stream v1</p>
                             </div>
                             <button onClick={() => remove(ref(mainProject.db, `thoughts/${t.id}`))} className="p-3 bg-brand-red/10 text-brand-red rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={16} /></button>
                          </div>
                       </div>
                    ))}
                 </div>
               )}

               {/* TAB: BLOGS */}
               {activeTab === 'blogs' && (
                 <div className="space-y-12">
                    <div className="glass p-12 rounded-[50px] border border-white/5 space-y-8 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-60 h-60 bg-brand-red/5 blur-[100px] -mr-32 -mt-32" />
                       <div className="flex items-center justify-between">
                          <h4 className="text-2xl font-black italic text-bg-text uppercase tracking-tighter">{editingBlog ? 'Update Protocol' : 'Deploy Content'}</h4>
                          {editingBlog && <button onClick={() => setEditingBlog(null)} className="text-xs font-black text-brand-red uppercase tracking-widest italic">Cancel Edit</button>}
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <input 
                            value={newBlog.title}
                            onChange={e => setNewBlog({...newBlog, title: e.target.value})}
                            placeholder="Enter Protocol Title..." 
                            className="w-full glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text font-black italic text-lg" 
                          />
                          <input 
                            value={newBlog.subtitle}
                            onChange={e => setNewBlog({...newBlog, subtitle: e.target.value})}
                            placeholder="Catchy Subtitle..." 
                            className="w-full glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text/40 font-bold italic" 
                          />
                       </div>

                       <div className="space-y-4">
                          <div className="flex gap-4">
                             <input 
                               value={newBlog.imageUrl}
                               onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})}
                               placeholder="Main Visual identity (URL)..." 
                               className="flex-1 glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text italic" 
                             />
                             <button 
                               onClick={() => {
                                 if (!newBlog.imageUrl) return;
                                 setNewBlog({
                                   ...newBlog,
                                   media: [...newBlog.media, { type: 'image', url: newBlog.imageUrl }],
                                   imageUrl: ''
                                 });
                               }}
                               className="px-8 glass rounded-3xl text-brand-red font-black border border-brand-red/10 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                             >
                               Add Media
                             </button>
                          </div>
                          {newBlog.media.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-3">
                               {newBlog.media.map((m, idx) => (
                                 <div key={idx} className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5">
                                    <span className="text-[8px] font-black text-bg-text/40">{m.type}</span>
                                    <span className="text-[8px] font-bold text-bg-text italic truncate max-w-[100px]">{m.url}</span>
                                    <button onClick={() => setNewBlog({...newBlog, media: newBlog.media.filter((_, i) => i !== idx)})} className="text-brand-red"><X size={10} /></button>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>

                       <textarea 
                         value={newBlog.content}
                         onChange={e => setNewBlog({...newBlog, content: e.target.value})}
                         placeholder="Synthesize content core here..." 
                         className="w-full glass p-10 rounded-[40px] border border-white/5 outline-none h-64 resize-none text-bg-text font-bold leading-relaxed italic" 
                       />

                       <button 
                         onClick={handlePostBlog}
                         className="bg-brand-red text-white w-full py-6 rounded-[2.5rem] font-black shadow-2xl shadow-brand-red/30 uppercase tracking-[0.3em] active:scale-98 transition-all text-xs italic"
                       >
                         {editingBlog ? 'Update Repository' : 'Broadcast to Network'}
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {announcements.map(blog => (
                          <div key={blog.id} className="glass rounded-[40px] overflow-hidden border border-white/5 group relative">
                             <div className="aspect-video relative overflow-hidden">
                                <img src={blog.imageUrl || blog.media?.[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark to-transparent opacity-90" />
                                <div className="absolute bottom-6 left-8 right-8">
                                   <p className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-1 italic">{new Date(blog.createdAt).toLocaleDateString()}</p>
                                   <h5 className="text-xl font-black text-white italic tracking-tighter truncate">{blog.title}</h5>
                                </div>
                             </div>
                             <div className="p-8 flex items-center justify-between">
                                <div className="flex gap-4">
                                   <div className="text-center">
                                      <p className="text-[8px] font-black text-bg-text/20 uppercase tracking-widest">Views</p>
                                      <p className="text-xs font-black italic">{blog.likes * 2 + 10}k</p>
                                   </div>
                                   <div className="text-center">
                                      <p className="text-[8px] font-black text-bg-text/20 uppercase tracking-widest">Likes</p>
                                      <p className="text-xs font-black italic text-brand-red">{blog.likes}</p>
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                     onClick={() => {
                                       const link = `${window.location.origin}/latest?id=${blog.id}`;
                                       navigator.clipboard.writeText(link);
                                       alert('Protocol URL synchronized to clipboard!');
                                     }}
                                     className="p-3 glass rounded-xl text-blue-500/40 hover:text-blue-500"
                                     title="Copy Link"
                                   >
                                      <LinkIcon size={16} />
                                   </button>
                                   <button 
                                     onClick={() => {
                                       setEditingBlog(blog);
                                       setNewBlog({
                                         title: blog.title,
                                         subtitle: blog.subtitle,
                                         content: blog.content,
                                         imageUrl: blog.imageUrl || '',
                                         media: blog.media || []
                                       });
                                       window.scrollTo({ top: 0, behavior: 'smooth' });
                                     }}
                                     className="p-3 glass rounded-xl text-bg-text/40 hover:text-white"
                                   >
                                      <Edit size={16} />
                                   </button>
                                   <button onClick={() => deleteBlog(blog.id)} className="p-3 glass rounded-xl text-brand-red/40 hover:text-brand-red"><Trash2 size={16} /></button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* TAB: SPONSORS */}
               {activeTab === 'sponsors' && (
                 <div className="space-y-12">
                    <div className="glass p-12 rounded-[50px] border border-white/5 flex items-center gap-10">
                       <div className="flex-1 space-y-6">
                          <h4 className="text-2xl font-black italic text-bg-text uppercase tracking-tighter">Sponsor Repository</h4>
                          <div className="grid grid-cols-2 gap-4">
                             <input 
                               value={newSponsor.title}
                               onChange={e => setNewSponsor({...newSponsor, title: e.target.value})}
                               placeholder="Sponsor Identity Name" 
                               className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-black italic" 
                             />
                             <select 
                               value={newSponsor.type}
                               onChange={e => setNewSponsor({...newSponsor, type: e.target.value as any})}
                               className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-black italic appearance-none"
                             >
                                <option value="image" className="bg-bg-dark">Image Platform</option>
                                <option value="iframe" className="bg-bg-dark">Digital Iframe</option>
                             </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <input 
                               value={newSponsor.imageUrl}
                               onChange={e => setNewSponsor({...newSponsor, imageUrl: e.target.value})}
                               placeholder="Media Protocol URL" 
                               className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text italic" 
                             />
                             <input 
                               value={newSponsor.link}
                               onChange={e => setNewSponsor({...newSponsor, link: e.target.value})}
                               placeholder="External Matrix Link" 
                               className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text italic" 
                             />
                          </div>
                          <button 
                            onClick={handlePostSponsor}
                            className="bg-brand-red text-white w-full py-5 rounded-[2rem] font-black shadow-xl shadow-brand-red/20 uppercase tracking-widest active:scale-95 transition-all text-xs mx-auto block italic"
                          >
                            Integrate Sponsor
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {sponsors.map(sponsor => (
                          <div key={sponsor.id} className="glass rounded-[40px] overflow-hidden border border-white/5 relative group">
                             <div className="aspect-square relative flex items-center justify-center p-8">
                                <img src={sponsor.imageUrl} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-white shadow-inner opacity-0 group-hover:opacity-5 transition-all" />
                             </div>
                             <div className="p-8 border-t border-white/5 flex items-center justify-between">
                                <div>
                                   <h5 className="font-black text-bg-text italic text-sm truncate max-w-[100px]">{sponsor.title}</h5>
                                   <p className="text-[8px] text-bg-text/20 font-black uppercase tracking-widest">{sponsor.type}</p>
                                </div>
                                <button onClick={() => remove(ref(mainProject.db, `sponsors/${sponsor.id}`))} className="p-3 text-brand-red/40 hover:text-brand-red active:scale-90 transition-all"><Trash2 size={18} /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* TAB: ADS */}
               {activeTab === 'ads' && (
                 <div className="space-y-12">
                    <div className="glass p-12 rounded-[50px] border border-white/5 space-y-8">
                       <h4 className="text-2xl font-black italic text-bg-text uppercase tracking-tighter">
                         {editingAd ? 'Refine Push Ad' : 'Launch New Campaign'}
                       </h4>
                       <div className="grid grid-cols-2 gap-6">
                          <input 
                            value={newAd.title}
                            onChange={e => setNewAd({...newAd, title: e.target.value})}
                            placeholder="Campaign Heading..." 
                            className="w-full glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text font-black italic" 
                          />
                          <input 
                            value={newAd.subtitle}
                            onChange={e => setNewAd({...newAd, subtitle: e.target.value})}
                            placeholder="Engagement Subtext..." 
                            className="w-full glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text/40 font-bold italic" 
                          />
                       </div>
                       <div className="grid grid-cols-3 gap-6">
                          <input 
                            value={newAd.mediaUrl}
                            onChange={e => setNewAd({...newAd, mediaUrl: e.target.value})}
                            placeholder="Video / Frame Link..." 
                            className="col-span-2 glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text italic" 
                          />
                          <input 
                            type="number"
                            value={newAd.durationInDays}
                            onChange={e => setNewAd({...newAd, durationInDays: parseInt(e.target.value)})}
                            placeholder="Days..." 
                            className="glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text font-black text-center" 
                          />
                       </div>
                       <input 
                         value={newAd.link}
                         onChange={e => setNewAd({...newAd, link: e.target.value})}
                         placeholder="Action Protocol Link..." 
                         className="w-full glass p-6 rounded-3xl border border-white/5 outline-none text-bg-text italic" 
                       />
                       <button 
                         onClick={handlePostAd}
                         className="bg-blue-600 text-white w-full py-6 rounded-[2.5rem] font-black shadow-2xl shadow-blue-600/30 uppercase tracking-[0.2em] active:scale-95 transition-all text-xs italic"
                       >
                         {editingAd ? 'Save Modifications' : 'Initialize Global Dispatch'}
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {pushedAds.map(ad => (
                         <div key={ad.id} className="glass rounded-[40px] overflow-hidden border border-white/5 group">
                            <div className="aspect-video relative overflow-hidden bg-bg-dark">
                               <iframe src={ad.mediaUrl} className="w-full h-full pointer-events-none opacity-40 group-hover:opacity-100 transition-all" />
                               <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-transparent to-transparent" />
                               <div className="absolute bottom-8 left-10">
                                  <h5 className="text-2xl font-black text-white italic tracking-tighter">{ad.title}</h5>
                                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{ad.durationInDays} Days Campaign</p>
                               </div>
                            </div>
                            <div className="p-8 flex items-center justify-between glass border-t border-white/5">
                               <div className="flex gap-4">
                                  <Monitor className="text-blue-500" size={24} />
                                  <div>
                                     <p className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest">CTR Performance</p>
                                     <p className="text-xs font-black italic text-green-500">+12% Optimal</p>
                                  </div>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => {
                                    setEditingAd(ad);
                                    setNewAd({ ...ad });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }} className="p-4 glass rounded-2xl text-bg-text/20 hover:text-bg-text"><Edit size={16} /></button>
                                  <button onClick={() => remove(ref(mainProject.db, `pushedAds/${ad.id}`))} className="p-4 glass rounded-2xl text-brand-red/20 hover:text-brand-red"><Trash2 size={16} /></button>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* TAB: ANALYTICS */}
               {activeTab === 'analytics' && (
                 <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                       {[
                         { label: 'Total Users', val: users.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                         { label: 'Active Identity', val: users.filter(u => u.isActive !== false).length, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
                         { label: 'Blood Donors', val: users.filter(u => u.isDonor).length, icon: Droplet, color: 'text-brand-red', bg: 'bg-brand-red/10' },
                         { label: 'Total Sponsors', val: sponsors.length, icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
                       ].map((stat, i) => (
                         <div key={i} className="glass p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                               <stat.icon size={24} />
                            </div>
                            <p className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest italic mb-1">{stat.label}</p>
                            <p className="text-4xl font-black italic text-bg-text">{stat.val}</p>
                         </div>
                       ))}
                    </div>

                    <div className="glass p-12 rounded-[50px] border border-white/5 h-[500px] relative overflow-hidden">
                       <h4 className="text-2xl font-black italic text-bg-text uppercase tracking-tighter mb-10">Donation & Intake Lifecycle (7D)</h4>
                       <div className="h-full pb-20">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={getAnalyticsData()}>
                                <defs>
                                   <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                   </linearGradient>
                                   <linearGradient id="colorDon" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.1)" tick={{fontSize: 10, fontWeight: '900'}} />
                                <YAxis stroke="rgba(255,255,255,0.1)" tick={{fontSize: 10, fontWeight: '900'}} />
                                <Tooltip 
                                  contentStyle={{backgroundColor: '#0a0a0a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '10px'}}
                                  itemStyle={{fontWeight: '900', textTransform: 'uppercase'}}
                                />
                                <Area type="monotone" dataKey="registrations" stroke="#4f46e5" fillOpacity={1} fill="url(#colorReg)" strokeWidth={4} />
                                <Area type="monotone" dataKey="donations" stroke="#ef4444" fillOpacity={1} fill="url(#colorDon)" strokeWidth={4} />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                 </div>
               )}

               {/* TAB: COMMENTS */}
               {activeTab === 'comments' && (
                 <div className="space-y-6">
                    {comments.map(comment => (
                       <div key={comment.id} className="glass p-8 rounded-[40px] border border-white/5 space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-red/10 text-brand-red rounded-xl flex items-center justify-center font-black">
                                   {comment.name?.substring(0, 1)}
                                </div>
                                <div>
                                   <h5 className="font-black text-bg-text italic">{comment.name}</h5>
                                   <p className="text-[8px] font-black uppercase text-bg-text/20 tracking-widest">
                                     Post: {announcements.find(a => a.id === comment.postId)?.title || 'Deleted Post'}
                                   </p>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button className="p-3 glass rounded-xl text-bg-text/40 hover:text-blue-500"><Reply size={16} /></button>
                                <button onClick={() => deleteComment(comment.id)} className="p-3 glass rounded-xl text-brand-red/40 hover:text-brand-red"><Trash2 size={16} /></button>
                             </div>
                          </div>
                          <p className="text-bg-text/60 font-bold italic text-sm pl-14">"{comment.text}"</p>
                       </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-40 opacity-10">
                        <MessageSquare size={80} className="mx-auto mb-6" />
                        <h4 className="text-2xl font-black italic uppercase tracking-widest">Feedback Zero</h4>
                      </div>
                    )}
                 </div>
               )}

               {/* TAB: ACTIVITY */}
               {activeTab === 'activity' && (
                 <div className="space-y-6">
                    {activities.map(act => (
                       <div key={act.id} className="glass p-8 rounded-[40px] border border-white/5 flex items-center justify-between group">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-bg-text/30 group-hover:text-brand-red transition-all">
                                <Activity size={20} />
                             </div>
                             <div>
                                <h5 className="font-black text-bg-text italic uppercase tracking-tighter">{act.action}</h5>
                                <p className="text-sm font-bold text-bg-text/40 italic">{act.summary}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest italic">{new Date(act.timestamp).toLocaleDateString()}</p>
                             <p className="text-[8px] font-mono text-bg-text/10">{new Date(act.timestamp).toLocaleTimeString()}</p>
                          </div>
                       </div>
                    ))}
                 </div>
               )}

            </div>
         </div>
      </div>

      {/* REJECTION MODAL */}
      <AnimatePresence>
        {showRejectionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-dark/80 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-md glass p-10 rounded-[40px] space-y-8 border border-white/5 shadow-[0_0_100px_rgba(239,68,68,0.1)]"
             >
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-brand-red/10 text-brand-red rounded-2xl"><ShieldAlert size={24} /></div>
                   <h3 className="text-2xl font-black italic text-bg-text uppercase tracking-tighter">Reject Submission</h3>
                </div>
                <textarea 
                  placeholder="Summarize rejection reason for user notification..."
                  className="w-full glass p-8 rounded-[32px] border border-white/5 outline-none h-40 resize-none text-bg-text font-bold italic"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className="flex gap-4">
                   <button 
                     onClick={() => {
                        const req = verifications.find(v => v.id === showRejectionModal);
                        if (req) handleRejectVerification(req);
                     }}
                     className="flex-1 bg-brand-red text-white py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] shadow-xl shadow-brand-red/20 active:scale-95 transition-all"
                   >
                     Confirm Rejection
                   </button>
                   <button 
                     onClick={() => {
                        setShowRejectionModal(null);
                        setRejectionReason('');
                     }}
                     className="px-8 glass text-bg-text/40 rounded-2xl font-black italic uppercase tracking-widest text-[10px] border border-white/5 active:scale-95 transition-all"
                   >
                     Abort
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER EDIT MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-dark/80 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 50 }}
               className="w-full max-w-2xl glass p-12 rounded-[50px] space-y-10 border border-white/5 shadow-2xl overflow-y-auto max-h-[90vh]"
             >
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 glass rounded-2xl overflow-hidden shadow-2xl">
                         <img src={editingUser.photoURL} alt="" />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black italic text-bg-text uppercase tracking-tighter">{editingUser.fullName}</h3>
                         <p className="text-[10px] text-bg-text/20 font-black uppercase tracking-[0.4em]">{editingUser.email}</p>
                      </div>
                   </div>
                   <button onClick={() => setEditingUser(null)} className="p-4 glass rounded-2xl text-bg-text/20 hover:text-brand-red"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest pl-4">Full Identity</label>
                      <input 
                        className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-black italic"
                        value={editingUser.fullName}
                        onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest pl-4">Blood Matrix</label>
                      <input 
                        className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-brand-red font-black text-center text-xl italic uppercase"
                        value={editingUser.bloodGroup}
                        onChange={(e) => setEditingUser({...editingUser, bloodGroup: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest pl-4">Contact Phone</label>
                      <input 
                        className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-bold italic"
                        value={editingUser.mobile}
                        onChange={(e) => setEditingUser({...editingUser, mobile: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest pl-4">Occupation</label>
                      <input 
                        className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-bold italic"
                        value={editingUser.occupation || ''}
                        onChange={(e) => setEditingUser({...editingUser, occupation: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest pl-4">Workplace</label>
                      <input 
                        className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-bold italic"
                        value={editingUser.work || ''}
                        onChange={(e) => setEditingUser({...editingUser, work: e.target.value})}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest pl-4">Gender</label>
                      <select 
                        className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-bold italic appearance-none"
                        value={editingUser.gender}
                        onChange={(e) => setEditingUser({...editingUser, gender: e.target.value as any})}
                      >
                         <option value="male">MALE</option>
                         <option value="female">FEMALE</option>
                         <option value="other">OTHER</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-bg-text/20 uppercase tracking-widest pl-4">Geo Matrix (Address)</label>
                   <input 
                     className="w-full glass p-5 rounded-2xl border border-white/5 outline-none text-bg-text font-bold italic"
                     value={editingUser.address}
                     onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <input placeholder="Division" className="glass p-4 rounded-xl border border-white/5 outline-none text-xs text-bg-text font-bold" value={editingUser.division} onChange={e => setEditingUser({...editingUser, division: e.target.value})} />
                   <input placeholder="District" className="glass p-4 rounded-xl border border-white/5 outline-none text-xs text-bg-text font-bold" value={editingUser.district} onChange={e => setEditingUser({...editingUser, district: e.target.value})} />
                   <input placeholder="Upazilla" className="glass p-4 rounded-xl border border-white/5 outline-none text-xs text-bg-text font-bold" value={editingUser.upazilla} onChange={e => setEditingUser({...editingUser, upazilla: e.target.value})} />
                </div>

                <textarea 
                   placeholder="Comprehensive background details / Bio..."
                   className="w-full glass p-8 rounded-[40px] border border-white/5 outline-none h-32 resize-none text-bg-text font-bold italic"
                   value={editingUser.details || ''}
                   onChange={(e) => setEditingUser({...editingUser, details: e.target.value})}
                />

                <div className="flex gap-4">
                   <button 
                     onClick={() => handleUpdateUser(editingUser.uid, { ...editingUser, isVerified: true })}
                     className="flex-1 bg-green-500/10 text-green-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-green-500/20 active:scale-95 transition-all"
                   >
                     Identity Clearance
                   </button>
                   <button 
                     onClick={() => handleUpdateUser(editingUser.uid, { 
                       ...editingUser, 
                       donationCount: (editingUser.donationCount || 0) + 1,
                       lastDonatedAt: Date.now(),
                       isAvailable: false
                     })}
                     className="flex-1 bg-brand-red/10 text-brand-red py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] border border-brand-red/20 active:scale-95 transition-all"
                   >
                     Record Donation
                   </button>
                </div>

                <button 
                  onClick={() => handleUpdateUser(editingUser.uid, editingUser)}
                  className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] italic text-xs shadow-2xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                  Save Identity Matrix
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Admin;
