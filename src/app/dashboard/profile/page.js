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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageCropModal from '@/components/ImageCropModal';

const SOCIAL_ICONS = {
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  instagram: Instagram,
  website: Globe,
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
      if (!e.target.closest('.platform-dropdown-container')) {
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
      const currentDate = prev?.dob ? new Date(prev.dob) : new Date(1995, 0, 1);
      let day = currentDate.getDate();
      let month = currentDate.getMonth();
      let year = currentDate.getFullYear();

      if (type === 'day') day = parseInt(value);
      if (type === 'month') month = parseInt(value);
      if (type === 'year') year = parseInt(value);

      const newDate = new Date(year, month, day);
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
        {/* Profile Identity Card */}
        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="flex flex-col md:flex-row items-center gap-10 pb-10 border-b border-white/[0.05]">
            <div 
              className={cn(
                "relative group cursor-pointer transition-all duration-500",
                isDragging && "scale-105"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e); }}
              onClick={() => document.getElementById('photo-input').click()}
            >
              <div className={cn(
                "w-40 h-40 rounded-full bg-primary/5 border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-500",
                isDragging ? "border-primary bg-primary/10" : "border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5"
              )}>
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Syncing...</span>
                  </div>
                ) : user?.image ? (
                  <img 
                    key={user.image}
                    src={`${user.image}?t=${new Date().getTime()}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                ) : (
                  <div className="text-5xl font-black text-primary/40 uppercase tracking-tighter">
                    {(user?.name || user?.username || '?')[0]}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2 scale-90 group-hover:scale-100 transition-transform duration-500">
                    <Camera className="w-8 h-8 text-white" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Photo</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative ring */}
              <div className="absolute -inset-2 border border-primary/20 rounded-full scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700" />
              
              <input 
                id="photo-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <p className="text-[10px] text-primary uppercase tracking-[0.3em] font-black mb-1">Identity Image</p>
                <h3 className="text-2xl font-black text-white tracking-tight">Display Portrait</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                This image will be the face of your public profile. Upload a high-resolution portrait for the best premium look.
              </p>
              <button 
                type="button"
                onClick={() => document.getElementById('photo-input').click()}
                className="px-6 h-11 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 mx-auto md:mx-0 active:scale-95"
              >
                <Upload className="w-4 h-4" /> Update Avatar
              </button>
            </div>
          </div>

          <div className="pt-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h2 className="text-xl font-black text-white tracking-tight">General Information</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Display Name</label>
                <input
                  type="text"
                  className="input-field-premium"
                  placeholder="Ex. John Doe"
                  value={user?.name || ''}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary" /> Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Day Custom Select */}
                  <div className="relative group/date">
                    <button
                      type="button"
                      onClick={() => setActiveDropdownIdx(activeDropdownIdx === 'day' ? null : 'day')}
                      className={cn(
                        "input-field-premium flex items-center justify-between text-left",
                        activeDropdownIdx === 'day' && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                      )}
                    >
                      <span className={user?.dob ? "text-white" : "text-white/20"}>
                        {user?.dob ? new Date(user.dob).getDate() : 'Day'}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform duration-300", activeDropdownIdx === 'day' && "rotate-180 text-primary")} />
                    </button>
                    {activeDropdownIdx === 'day' && (
                      <div className="absolute top-full left-0 mt-2 p-2 glass-liquid rounded-2xl z-[80] shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
                        <div className="grid grid-cols-7 gap-1 max-h-[180px] overflow-y-auto custom-scrollbar p-1">
                          {[...Array(31)].map((_, i) => (
                            <button
                              key={i+1}
                              type="button"
                              onClick={() => { handleDateChange('day', i+1); setActiveDropdownIdx(null); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-primary/20 transition-all active:scale-95"
                            >
                              {i+1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Month Custom Select */}
                  <div className="relative group/date">
                    <button
                      type="button"
                      onClick={() => setActiveDropdownIdx(activeDropdownIdx === 'month' ? null : 'month')}
                      className={cn(
                        "input-field-premium flex items-center justify-between text-left",
                        activeDropdownIdx === 'month' && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                      )}
                    >
                      <span className={user?.dob ? "text-white" : "text-white/20"}>
                        {user?.dob ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date(user.dob).getMonth()] : 'Month'}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform duration-300", activeDropdownIdx === 'month' && "rotate-180 text-primary")} />
                    </button>
                    {activeDropdownIdx === 'month' && (
                      <div className="absolute top-full left-0 right-0 mt-2 p-1 glass-liquid rounded-2xl z-[80] shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[120px]">
                        <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => { handleDateChange('month', i); setActiveDropdownIdx(null); }}
                              className="w-full px-4 py-2.5 text-left rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-primary/20 transition-all active:scale-95"
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Year Custom Select */}
                  <div className="relative group/date">
                    <button
                      type="button"
                      onClick={() => setActiveDropdownIdx(activeDropdownIdx === 'year' ? null : 'year')}
                      className={cn(
                        "input-field-premium flex items-center justify-between text-left",
                        activeDropdownIdx === 'year' && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                      )}
                    >
                      <span className={user?.dob ? "text-white" : "text-white/20"}>
                        {user?.dob ? new Date(user.dob).getFullYear() : 'Year'}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-white/20 transition-transform duration-300", activeDropdownIdx === 'year' && "rotate-180 text-primary")} />
                    </button>
                    {activeDropdownIdx === 'year' && (
                      <div className="absolute top-full left-0 right-0 mt-2 p-1 glass-liquid rounded-2xl z-[80] shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[100px]">
                        <div className="grid grid-cols-1 gap-1 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                          {[...Array(100)].map((_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <button
                                key={year}
                                type="button"
                                onClick={() => { handleDateChange('year', year); setActiveDropdownIdx(null); }}
                                className="w-full px-4 py-2 text-left rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-primary/20 transition-all active:scale-95"
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
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Short Bio</label>
              <textarea
                className="input-field-premium h-32 py-4 resize-none leading-relaxed"
                placeholder="Tell the world about yourself..."
                value={user?.bio || ''}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Visibility Controls */}
        <div className="glass-card p-8 rounded-3xl flex flex-wrap gap-10 border-white/5">
          <label className="flex items-center gap-4 cursor-pointer group">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={user?.isPublic}
                onChange={(e) => setUser({ ...user, isPublic: e.target.checked })}
              />
              <div className="w-12 h-6 bg-white/10 rounded-full peer-checked:bg-primary/50 transition-colors duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 border border-white/10" />
            </div>
            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Public Profile Status</span>
          </label>

          <label className="flex items-center gap-4 cursor-pointer group">
             <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={user?.showDob}
                onChange={(e) => setUser({ ...user, showDob: e.target.checked })}
              />
              <div className="w-12 h-6 bg-white/10 rounded-full peer-checked:bg-accent/50 transition-colors duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 border border-white/10" />
            </div>
            <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Show Birthday publicly</span>
          </label>
        </div>

        {/* Social Links */}
        <div className="glass-card p-10 rounded-[2.5rem] space-y-8 border-white/5">
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

          <div className="space-y-5">
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
              ];
              
              const currentPlatform = platforms.find(p => p.id === link.platform) || platforms[0];
              const Icon = SOCIAL_ICONS[currentPlatform.id] || SOCIAL_ICONS.default;

              return (
                <div 
                  key={index} 
                  className={cn(
                    "glass-card p-6 md:p-8 rounded-[2rem] border-white/5 relative group transition-all duration-300",
                    activeDropdownIdx === index ? "z-[70] shadow-2xl ring-1 ring-white/10 !hover:translate-y-0" : "z-10 hover:bg-white/[0.04]",
                    activeDropdownIdx !== null && activeDropdownIdx !== index && "opacity-50 blur-[1px] grayscale-[0.2] pointer-events-none scale-[0.98]",
                  )}
                >
                  <div className="flex flex-col gap-6 w-full">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Link Platform</label>
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-95 border border-red-500/10 opacity-0 group-hover:opacity-100"
                        title="Remove Link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Premium Custom Dropdown */}
                      <div className="platform-dropdown-container relative">
                        <button
                          type="button"
                          onClick={() => setActiveDropdownIdx(activeDropdownIdx === index ? null : index)}
                          className={cn(
                            "w-full h-14 pl-5 pr-12 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold flex items-center justify-between transition-all hover:bg-white/10",
                            activeDropdownIdx === index && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <span>{currentPlatform.name}</span>
                          </div>
                          <Plus className={cn("w-4 h-4 transition-transform duration-300 rotate-45", activeDropdownIdx === index && "rotate-90 text-primary")} />
                        </button>

                        {activeDropdownIdx === index && (
                          <div className="absolute top-full left-0 right-0 mt-3 p-1 glass-liquid rounded-[1.5rem] z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-1 gap-1 max-h-[240px] overflow-y-auto custom-scrollbar p-1">
                              {platforms.map(p => {
                                const ItemIcon = SOCIAL_ICONS[p.id] || SOCIAL_ICONS.default;
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => updateSocialLink(index, 'platform', p.id)}
                                    className={cn(
                                      "w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all text-sm font-medium active:scale-[0.98] group/item",
                                      link.platform === p.id 
                                        ? "bg-primary/30 text-white border border-primary/20 shadow-lg shadow-primary/10" 
                                        : "text-muted-foreground hover:text-white hover:bg-white/10 hover:translate-x-1"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center border",
                                      link.platform === p.id ? "bg-primary/20 border-primary/20" : "bg-white/5 border-white/5"
                                    )}>
                                      <ItemIcon className="w-4 h-4" />
                                    </div>
                                    {p.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expansive URL Input */}
                      <div className="md:col-span-2 relative group/input">
                        <input
                          type="url"
                          className="w-full h-14 pl-6 pr-12 rounded-2xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 hover:bg-white/[0.08] transition-all font-medium tracking-tight"
                          placeholder={currentPlatform.placeholder}
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover/input:opacity-50 transition-opacity">
                          <Globe className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Absolute trash for mobile if visible */}
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500/20 text-white border border-white/10 md:hidden shadow-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
            className="btn-premium min-w-[200px] h-14 text-base"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5" /> Deploy Changes</>}
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
