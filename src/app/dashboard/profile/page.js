'use client';

import { useState, useEffect, useRef } from 'react';
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

  // States for custom SET BIRTHDAY modal
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [tempYear, setTempYear] = useState(1995);
  const [tempMonth, setTempMonth] = useState('Jan');
  const [tempDay, setTempDay] = useState(1);

  const monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearsArray = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  // Calculate days in the selected month & year dynamically
  const getDaysInMonth = (monthName, year) => {
    const monthIdx = monthsArray.indexOf(monthName);
    return new Date(year, monthIdx + 1, 0).getDate();
  };

  const currentMaxDays = getDaysInMonth(tempMonth, tempYear);
  const daysArray = Array.from({ length: currentMaxDays }, (_, i) => i + 1);

  // Auto-correct selected day if it exceeds the maximum days for the month
  useEffect(() => {
    if (tempDay > currentMaxDays) {
      setTempDay(currentMaxDays);
    }
  }, [tempMonth, tempYear, currentMaxDays, tempDay]);

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
      socialLinks: [...(user.socialLinks || []), { platform: 'website', url: '' }]
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

  const handleOpenBirthdayModal = () => {
    const currentDate = user?.dob ? new Date(user.dob) : new Date(Date.UTC(1995, 0, 1));
    setTempYear(currentDate.getUTCFullYear());
    setTempMonth(monthsArray[currentDate.getUTCMonth()]);
    setTempDay(currentDate.getUTCDate());
    setShowBirthdayModal(true);
  };

  const handleSubmitBirthday = () => {
    const monthIdx = monthsArray.indexOf(tempMonth);
    const newDate = new Date(Date.UTC(tempYear, monthIdx, tempDay));
    setUser({ ...user, dob: newDate.toISOString() });
    setShowBirthdayModal(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <form onSubmit={handleUpdate} className="space-y-5">
        {error && (
          <div className="p-3 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="text-red-400/50 hover:text-red-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        
        {/* Sleek Profile Settings Grid */}
        <div className="glass-card p-4 sm:p-5 rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent space-y-4">
          
          {/* Section 1: Avatar, Name & Bio */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            
            {/* Avatar Column */}
            <div 
              className={cn(
                "relative group cursor-pointer transition-all duration-500 shrink-0 mx-auto sm:mx-0",
                isDragging && "scale-105"
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e); }}
              onClick={() => document.getElementById('photo-input').click()}
            >
              <div className={cn(
                "w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-primary/5 border border-dashed flex items-center justify-center overflow-hidden transition-all duration-500 relative",
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
              
              <input 
                id="photo-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            {/* Name & Bio Stack */}
            <div className="flex-1 w-full space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1">Display Name</span>
                  <input
                    type="text"
                    className="input-field-premium h-9 text-xs"
                    placeholder="Ex. John Doe"
                    value={user?.name || ''}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1">Short Bio</span>
                  <input
                    type="text"
                    className="input-field-premium h-9 text-xs"
                    placeholder="Tell the world about yourself..."
                    value={user?.bio || ''}
                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.05]" />

          {/* Section 2: Date of Birth & Visibility Switches */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Birthday Selector Trigger */}
            <div className="md:col-span-5 space-y-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-primary" /> Date of Birth
              </span>
              <button
                type="button"
                onClick={handleOpenBirthdayModal}
                className="w-full input-field-premium h-9 text-xs flex items-center justify-between text-left cursor-pointer text-white"
              >
                <span>
                  {user?.dob 
                    ? new Date(user.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) 
                    : 'Set Birthday'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-white/30" />
              </button>
            </div>

            {/* Visibility Toggles */}
            <div className="md:col-span-7 flex flex-col sm:flex-row gap-4 sm:gap-6 md:justify-end pt-2 md:pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={user?.isPublic}
                    onChange={(e) => setUser({ ...user, isPublic: e.target.checked })}
                  />
                  <div className="w-8 h-4.5 bg-white/10 rounded-full peer-checked:bg-primary/50 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5 border border-white/10" />
                </div>
                <span className="text-[10px] font-bold text-white/70 group-hover:text-white transition-colors">Public Profile Status</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                 <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={user?.showDob}
                    onChange={(e) => setUser({ ...user, showDob: e.target.checked })}
                  />
                  <div className="w-8 h-4.5 bg-white/10 rounded-full peer-checked:bg-accent/50 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5 border border-white/10" />
                </div>
                <span className="text-[10px] font-bold text-white/70 group-hover:text-white transition-colors">Show Birthday Publicly</span>
              </label>
            </div>
          </div>
        </div>

        {/* Social Links Editor Card */}
        <div className="glass-card p-4 sm:p-5 rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-accent rounded-full" />
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase">Social Connects</h2>
            </div>
            <button
              type="button"
              onClick={addSocialLink}
              className="px-3.5 py-1.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all flex items-center gap-1.5 text-[10px] font-black active:scale-95 border border-accent/20 cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" /> Link Platform
            </button>
          </div>

          <div className="space-y-2.5">
            {(user?.socialLinks || []).map((link, index) => {
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
                    "glass-card p-1.5 sm:p-2 rounded-xl border-white/5 relative group transition-all duration-300 bg-white/[0.01]",
                    activeDropdownIdx === index ? "z-[70] shadow-2xl ring-1 ring-white/10 !hover:translate-y-0" : "z-10 hover:bg-white/[0.03]",
                    activeDropdownIdx !== null && activeDropdownIdx !== index && "opacity-50 blur-[1px] grayscale-[0.2] pointer-events-none scale-[0.98]",
                  )}
                >
                  <div className="flex flex-row items-center gap-2 w-full">
                    {/* Premium Custom Dropdown */}
                    <div className="platform-dropdown-container dropdown-container relative w-[110px] sm:w-[150px] md:w-[170px] shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveDropdownIdx(activeDropdownIdx === index ? null : index)}
                        className={cn(
                          "w-full h-9 px-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-between transition-all hover:bg-white/10 cursor-pointer",
                          activeDropdownIdx === index && "ring-2 ring-primary/40 border-primary/20 bg-white/10"
                        )}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate text-white text-[11px] font-bold">{currentPlatform.name}</span>
                        </div>
                        <ChevronDown className={cn("w-3 h-3 text-white/20 transition-transform duration-300 shrink-0", activeDropdownIdx === index && "rotate-180 text-primary")} />
                      </button>

                      {activeDropdownIdx === index && (
                        <div className="absolute top-full left-0 mt-1.5 p-1 glass-liquid rounded-lg z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 w-[150px] sm:w-full">
                          <div className="grid grid-cols-1 gap-0.5 max-h-[180px] overflow-y-auto custom-scrollbar p-0.5">
                            {platforms.map(p => {
                              const ItemIcon = SOCIAL_ICONS[p.id] || SOCIAL_ICONS.default;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => updateSocialLink(index, 'platform', p.id)}
                                  className={cn(
                                    "w-full px-2 py-1.5 rounded flex items-center gap-2 transition-all text-xs font-medium active:scale-[0.98] group/item text-left cursor-pointer",
                                    link.platform === p.id 
                                      ? "bg-primary/30 text-white border border-primary/20 shadow-lg shadow-primary/10" 
                                      : "text-muted-foreground hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate text-[11px]">{p.name}</span>
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
                        className="w-full h-9 pl-3 pr-8 rounded-lg bg-white/5 border border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 hover:bg-white/[0.08] transition-all font-medium tracking-tight text-white"
                        placeholder={currentPlatform.placeholder}
                        value={link.url || ''}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        onBlur={(e) => updateSocialLink(index, 'url', normalizeSocialLink(link.platform, e.target.value))}
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-20 group-hover/input:opacity-50 transition-opacity">
                        <Globe className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Delete Action Button */}
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="h-9 w-9 flex items-center justify-center shrink-0 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 border border-white/5 hover:border-red-500/10 transition-all duration-200 active:scale-95 cursor-pointer"
                      title="Remove Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {(!user?.socialLinks || user.socialLinks.length === 0) && (
               <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                 <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                 <p className="text-muted-foreground text-xs font-medium">Your profile is missing social connects.</p>
                 <p className="text-[10px] text-muted-foreground/60 mt-0.5">Add links to your favorite platforms to get started.</p>
               </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-premium min-w-[150px] h-11 text-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Deploy Changes</>}
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

      {/* iOS-Style "SET BIRTHDAY" Wheel Picker Modal */}
      {showBirthdayModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowBirthdayModal(false)}
          />
          
          <div className="relative w-full max-w-[320px] bg-[#0c0c0e] border border-white/10 rounded-[2rem] shadow-2xl p-6 space-y-6 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none !important;
              }
            `}</style>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 -mx-6 px-6">
              <div className="w-6" />
              <h3 className="text-[11px] font-bold uppercase text-white tracking-[0.2em] text-center pl-6">SET BIRTHDAY</h3>
              <button
                type="button"
                onClick={() => setShowBirthdayModal(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Custom Wheel Selector Component */}
            <div className="relative flex items-center justify-center pt-2">
              {/* Central Highlight Band */}
              <div className="absolute left-0 right-0 h-10 bg-white/[0.06] pointer-events-none" />
              
              <div className="flex w-full gap-2 relative z-10">
                <WheelPickerColumn 
                  items={yearsArray} 
                  value={tempYear} 
                  onChange={(val) => setTempYear(val)} 
                />
                <WheelPickerColumn 
                  items={monthsArray} 
                  value={tempMonth} 
                  onChange={(val) => setTempMonth(val)} 
                />
                <WheelPickerColumn 
                  items={daysArray} 
                  value={tempDay} 
                  onChange={(val) => setTempDay(val)} 
                />
              </div>

              {/* Gradient cylinder overlays to fade top and bottom */}
              <div className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-[#0c0c0e] to-transparent pointer-events-none z-20" />
              <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-[#0c0c0e] to-transparent pointer-events-none z-20" />
            </div>

            {/* Submit Button matches image exactly */}
            <button
              type="button"
              onClick={handleSubmitBirthday}
              className="w-full h-12 rounded-full bg-white hover:bg-white/90 text-black font-black uppercase text-xs tracking-widest flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {linkToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setLinkToDelete(null)}
          />
          <div className="relative w-full max-w-[300px] bg-[#1c1c1e] rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="p-8 text-center space-y-2">
              <h3 className="text-base font-bold text-white">Delete this link?</h3>
              <p className="text-xs text-white/60 leading-relaxed px-2">
                Are you sure you want to delete this link?<br /> This action cannot be undone.
              </p>
            </div>
            
            <div className="flex border-t border-white/5 h-12">
              <button
                type="button"
                onClick={() => setLinkToDelete(null)}
                className="flex-1 text-sm font-medium text-[#0A84FF] hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors border-r border-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 text-sm font-medium text-[#FF453A] hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors cursor-pointer"
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

// Reusable custom wheel selector column component
function WheelPickerColumn({ items, value, onChange }) {
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const selectedIndex = items.indexOf(value);

  useEffect(() => {
    if (containerRef.current && selectedIndex !== -1) {
      const targetScrollTop = selectedIndex * 40;
      if (containerRef.current.scrollTop !== targetScrollTop) {
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / 40);
      const safeIndex = Math.max(0, Math.min(items.length - 1, index));
      const newValue = items[safeIndex];
      if (newValue !== value) {
        onChange(newValue);
      }
    }, 120);
  };

  const handleItemClick = (index) => {
    const newValue = items[index];
    if (newValue !== value) {
      onChange(newValue);
    }
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * 40,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative flex-1 h-[200px] overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar py-[80px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const isNeighbor1 = Math.abs(idx - selectedIndex) === 1;
          const isNeighbor2 = Math.abs(idx - selectedIndex) === 2;
          
          return (
            <div
              key={item}
              onClick={() => handleItemClick(idx)}
              className={cn(
                "h-10 snap-center flex items-center justify-center cursor-pointer select-none text-center transition-all duration-300 font-semibold",
                isSelected ? "text-white text-[17px] font-black scale-105" : 
                isNeighbor1 ? "text-white/40 text-sm font-bold" : 
                isNeighbor2 ? "text-white/20 text-xs" : 
                "text-white/5 text-[10px]"
              )}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
