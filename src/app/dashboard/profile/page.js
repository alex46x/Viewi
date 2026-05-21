'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Link as LinkIcon,
  Globe,
  Youtube,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Camera,
  Upload,
  X,
  Calendar,
  ChevronDown,
  Send,
  Facebook
} from 'lucide-react';
import { cn, normalizeSocialLink } from '@/lib/utils';
import ImageCropModal from '@/components/ImageCropModal';

const SOCIAL_ICONS = {
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  website: Globe,
  telegram: Send,
  facebook: Facebook,
  default: LinkIcon
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeDropdownIdx, setActiveDropdownIdx] = useState(null);
  const [linkToDelete, setLinkToDelete] = useState(null);

  useEffect(() => {
    fetchProfile();
    
    // Click outside listener for dropdowns
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setActiveDropdownIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        // Success toast or feedback
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setUser({
      ...user,
      socialLinks: [...user.socialLinks, { platform: 'website', url: '' }]
    });
  };

  const removeSocialLink = (index) => {
    setActiveDropdownIdx(null); // Clear dropdowns so link cards don't stay highlighted/dimmed
    setLinkToDelete(index);
  };

  const confirmDelete = () => {
    if (linkToDelete === null) return;
    const newList = [...user.socialLinks];
    newList.splice(linkToDelete, 1);
    setUser({ ...user, socialLinks: newList });
    setLinkToDelete(null);
  };

  const updateSocialLink = (index, field, value) => {
    const newList = [...user.socialLinks];
    newList[index][field] = value;
    setUser({ ...user, socialLinks: newList });
    setActiveDropdownIdx(null); // Close dropdown on select
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob) => {
    setUploading(true);
    const formData = new FormData();
    // Add a filename so the server/cloudinary can identify the file type
    formData.append('file', croppedBlob, 'profile-photo.jpg');
    
    try {
      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();

      if (res.ok) {
        setUser(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Connection error updating photo');
    } finally {
      setUploading(false);
      setShowCropModal(false);
    }
  };
  
  const handleDateChange = (type, value) => {
    setUser(prev => {
      // Use Date.UTC to avoid timezone shifts during selection
      const currentDate = prev?.dob ? new Date(prev.dob) : new Date(Date.UTC(1995, 0, 1));
      let day = currentDate.getUTCDate();
      let month = currentDate.getUTCMonth();
      let year = currentDate.getUTCFullYear();

      if (type === 'day') day = parseInt(value);
      if (type === 'month') month = parseInt(value);
      if (type === 'year') year = parseInt(value);

      const newDate = new Date(Date.UTC(year, month, day));
      return { ...prev, dob: newDate.toISOString() };
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={handleUpdate} className="space-y-10">
        {/* Sleek Profile Settings Grid */}
        <div className="glass-card p-5 sm:p-6 rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent space-y-5">
          {/* Row 1: Profile Avatar & Display Name */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div 
              className={cn(
                "relative group cursor-pointer transition-all duration-500 shrink-0",
                isDragging && "scale-105"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e); }}
              onClick={() => document.getElementById('photo-input').click()}
            >
              <div className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/5 border border-dashed flex items-center justify-center overflow-hidden transition-all duration-500 relative",
                isDragging ? "border-primary bg-primary/10" : "border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5"
              )}>
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : user?.image ? (
                  <img 
                    key={user.image}
                    src={`${user.image}?t=${new Date().getTime()}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                ) : (
                  <div className="text-xl sm:text-2xl font-black text-primary/40 uppercase tracking-tighter">
                    {(user?.name || user?.username || '?')[0]}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Edit Badge */}
              <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center shadow-lg group-hover:bg-primary/20 transition-all duration-300">
                <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/80 group-hover:text-primary" />
              </div>
              
              {/* Decorative ring */}
              <div className="absolute -inset-1 border border-primary/20 rounded-full scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700" />
              
              <input 
                id="photo-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            <div className="flex-1 space-y-1.5 min-w-0">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1">Display Name</label>
              <input
                type="text"
                className="input-field-premium h-10 sm:h-11 text-xs sm:text-sm"
                placeholder="Ex. John Doe"
                value={user?.name || ''}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Date of Birth & Short Bio on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Birth Selects */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-primary" /> Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Day Select */}
                <div className="relative group/date dropdown-container">
                  <button
                    type="button"
                    onClick={() => setActiveDropdownIdx(activeDropdownIdx === 'day' ? null : 'day')}
                    className={cn(
                      "input-field-premium h-10 sm:h-11 flex items-center justify-between text-left",
                      activeDropdownIdx === 'day' && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                    )}
                  >
                    <span className={user?.dob ? "text-white text-xs" : "text-white/20 text-xs"}>
                      {user?.dob ? new Date(user.dob).getUTCDate() : 'Day'}
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-white/20 transition-transform duration-300", activeDropdownIdx === 'day' && "rotate-180 text-primary")} />
                  </button>
                  {activeDropdownIdx === 'day' && (
                    <div className="absolute top-full left-0 mt-1.5 p-1.5 glass-liquid rounded-xl z-[80] shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
                      <div className="grid grid-cols-7 gap-0.5 max-h-[180px] overflow-y-auto custom-scrollbar p-0.5">
                        {[...Array(31)].map((_, i) => (
                          <button
                            key={i+1}
                            type="button"
                            onClick={() => { handleDateChange('day', i+1); setActiveDropdownIdx(null); }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold text-white/60 hover:text-white hover:bg-primary/20 transition-all active:scale-95"
                          >
                            {i+1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Month Select */}
                <div className="relative group/date dropdown-container">
                  <button
                    type="button"
                    onClick={() => setActiveDropdownIdx(activeDropdownIdx === 'month' ? null : 'month')}
                    className={cn(
                      "input-field-premium h-10 sm:h-11 flex items-center justify-between text-left",
                      activeDropdownIdx === 'month' && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                    )}
                  >
                    <span className={user?.dob ? "text-white text-xs" : "text-white/20 text-xs"}>
                      {user?.dob ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date(user.dob).getUTCMonth()] : 'Month'}
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-white/20 transition-transform duration-300", activeDropdownIdx === 'month' && "rotate-180 text-primary")} />
                  </button>
                  {activeDropdownIdx === 'month' && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 p-1 glass-liquid rounded-xl z-[80] shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[120px]">
                      <div className="grid grid-cols-1 gap-0.5 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { handleDateChange('month', i); setActiveDropdownIdx(null); }}
                            className="w-full px-3 py-2 text-left rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-primary/20 transition-all active:scale-95"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Year Select */}
                <div className="relative group/date dropdown-container">
                  <button
                    type="button"
                    onClick={() => setActiveDropdownIdx(activeDropdownIdx === 'year' ? null : 'year')}
                    className={cn(
                      "input-field-premium h-10 sm:h-11 flex items-center justify-between text-left",
                      activeDropdownIdx === 'year' && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                    )}
                  >
                    <span className={user?.dob ? "text-white text-xs" : "text-white/20 text-xs"}>
                      {user?.dob ? new Date(user.dob).getUTCFullYear() : 'Year'}
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-white/20 transition-transform duration-300", activeDropdownIdx === 'year' && "rotate-180 text-primary")} />
                  </button>
                  {activeDropdownIdx === 'year' && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 p-1 glass-liquid rounded-xl z-[80] shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[100px]">
                      <div className="grid grid-cols-1 gap-0.5 max-h-[200px] overflow-y-auto custom-scrollbar p-0.5">
                        {[...Array(100)].map((_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => { handleDateChange('year', year); setActiveDropdownIdx(null); }}
                              className="w-full px-3 py-1.5 text-left rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-primary/20 transition-all active:scale-95"
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Short Bio Block */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1">Short Bio</label>
              <textarea
                className="input-field-premium h-[42px] sm:h-11 py-2 px-3.5 resize-none leading-relaxed text-xs sm:text-sm custom-scrollbar"
                placeholder="Tell the world about yourself..."
                value={user?.bio || ''}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
              />
            </div>
          </div>

          {/* Row 3: Visibility Switches directly integrated at bottom */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 border-t border-white/[0.05]">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={user?.isPublic}
                  onChange={(e) => setUser({ ...user, isPublic: e.target.checked })}
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-primary/50 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 border border-white/10" />
              </div>
              <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">Public Profile Status</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
               <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={user?.showDob}
                  onChange={(e) => setUser({ ...user, showDob: e.target.checked })}
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-accent/50 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 border border-white/10" />
              </div>
              <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors">Show Birthday Publicly</span>
            </label>
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] space-y-8 border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              <h2 className="text-xl font-black text-white tracking-tight">Social Connects</h2>
            </div>
            <button
              type="button"
              onClick={addSocialLink}
              className="px-5 py-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all flex items-center gap-2 text-xs font-bold active:scale-95 border border-accent/20"
            >
              <Plus className="w-4 h-4" /> Link Platform
            </button>
          </div>

          <div className="space-y-3">
            {user?.socialLinks?.map((link, index) => {
              const platforms = [
                { id: 'website', name: 'Personal Website', placeholder: 'https://yourwebsite.com' },
                { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                { id: 'youtube', name: 'YouTube Channel', placeholder: 'https://youtube.com/@username' },
                { id: 'twitter', name: 'X (Twitter)', placeholder: 'https://x.com/username' },
                { id: 'github', name: 'GitHub Profile', placeholder: 'https://github.com/username' },
                { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/username' },
                { id: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@username' },
                { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/username' },
                { id: 'discord', name: 'Discord Server', placeholder: 'https://discord.gg/invite' },
                { id: 'telegram', name: 'Telegram', placeholder: 'https://t.me/username' },
              ];
              
              const currentPlatform = platforms.find(p => p.id === link.platform) || platforms[0];
              const Icon = SOCIAL_ICONS[currentPlatform.id] || SOCIAL_ICONS.default;

              return (
                <div 
                  key={index} 
                  className={cn(
                    "glass-card p-2 sm:p-2.5 rounded-2xl border-white/5 relative group transition-all duration-300",
                    activeDropdownIdx === index ? "z-[70] shadow-2xl ring-1 ring-white/10 !hover:translate-y-0" : "z-10 hover:bg-white/[0.04]",
                    activeDropdownIdx !== null && activeDropdownIdx !== index && "opacity-50 blur-[1px] grayscale-[0.2] pointer-events-none scale-[0.98]",
                  )}
                >
                  <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
                    {/* Premium Custom Dropdown */}
                    <div className="platform-dropdown-container dropdown-container relative w-[130px] sm:w-[180px] md:w-[200px] shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveDropdownIdx(activeDropdownIdx === index ? null : index)}
                        className={cn(
                          "w-full h-10 sm:h-11 px-2.5 sm:px-4 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm font-bold flex items-center justify-between transition-all hover:bg-white/10 cursor-pointer",
                          activeDropdownIdx === index && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                          <span className="truncate text-white">{currentPlatform.name}</span>
                        </div>
                        <ChevronDown className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/20 transition-transform duration-300 shrink-0", activeDropdownIdx === index && "rotate-180 text-primary")} />
                      </button>

                      {activeDropdownIdx === index && (
                        <div className="absolute top-full left-0 mt-2 p-1 glass-liquid rounded-xl z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 w-[160px] sm:w-full">
                          <div className="grid grid-cols-1 gap-0.5 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                            {platforms.map(p => {
                              const ItemIcon = SOCIAL_ICONS[p.id] || SOCIAL_ICONS.default;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => updateSocialLink(index, 'platform', p.id)}
                                  className={cn(
                                    "w-full px-2.5 py-2 rounded-lg flex items-center gap-2 sm:gap-2.5 transition-all text-xs sm:text-sm font-medium active:scale-[0.98] group/item text-left cursor-pointer",
                                    link.platform === p.id 
                                      ? "bg-primary/30 text-white border border-primary/20 shadow-lg shadow-primary/10" 
                                      : "text-muted-foreground hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{p.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expansive URL Input */}
                    <div className="flex-1 min-w-0 relative group/input">
                      <input
                        type="url"
                        className="w-full h-10 sm:h-11 pl-3.5 pr-8 sm:pl-4.5 sm:pr-10 rounded-xl bg-white/5 border border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 hover:bg-white/[0.08] transition-all font-medium tracking-tight text-white"
                        placeholder={currentPlatform.placeholder}
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        onBlur={(e) => updateSocialLink(index, 'url', normalizeSocialLink(link.platform, e.target.value))}
                      />
                      <div className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 opacity-20 group-hover/input:opacity-50 transition-opacity">
                        <Globe className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center shrink-0 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/10 transition-all duration-200 active:scale-95 cursor-pointer"
                      title="Remove Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {user?.socialLinks?.length === 0 && (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm font-medium">Your profile is missing social connects.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add links to your favorite platforms to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-premium min-w-[180px] h-12 text-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Deploy Changes</>}
          </button>
        </div>
        {showCropModal && (
          <ImageCropModal
            image={selectedImage}
            onClose={() => setShowCropModal(false)}
            onCropComplete={handleCropComplete}
          />
        )}
      </form>

      {/* Delete Confirmation Modal */}
      {linkToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setLinkToDelete(null)}
          />
          <div className="relative w-full max-w-[320px] bg-[#1c1c1e] rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="p-8 text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Delete this link?</h3>
              <p className="text-sm text-white/60 leading-relaxed px-2">
                Are you sure you want to delete this link?<br /> This action cannot be undone.
              </p>
            </div>
            
            <div className="flex border-t border-white/5 h-14">
              <button
                type="button"
                onClick={() => setLinkToDelete(null)}
                className="flex-1 text-[17px] font-medium text-[#0A84FF] hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors border-r border-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 text-[17px] font-medium text-[#FF453A] hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
