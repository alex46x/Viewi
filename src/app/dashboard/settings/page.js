'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Bell, Trash2, AlertCircle, Loader2, Sun, Moon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete account');
        setDeleting(false);
      }
    } catch (err) {
      setError('Connection error');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-6 sm:p-8 rounded-[2rem] space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
          Appearance
        </h2>
        <div className="flex items-center justify-between p-4 surface-panel rounded-xl">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark mode across the dashboard.
            </p>
          </div>
          <ThemeToggle variant="pill" />
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-[2rem] space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Security & Privacy
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 surface-panel rounded-xl">
            <div>
              <p className="font-medium">Email Address</p>
              <p className="text-sm text-muted-foreground">mrx46@example.com</p>
            </div>
            <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">Change</button>
          </div>
          <div className="flex items-center justify-between p-4 surface-panel rounded-xl">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last updated 2 months ago</p>
            </div>
            <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">Update</button>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-[2rem] space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500" />
          Notifications
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Reports</p>
            <p className="text-sm text-muted-foreground">Weekly analytics summary of your profile performance.</p>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-blue-600' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-[2rem] border-red-500/20 bg-red-500/5 space-y-6">
        <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Deleting your account is permanent and will remove all your data, including your unique username and analytics forever.
        </p>
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-[320px] bg-[#1c1c1e] rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 border border-white/5">
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Account?</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                This action is irreversible. All your data, profile, and analytics will be permanently removed.
              </p>
              {error && (
                <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded-lg">{error}</p>
              )}
            </div>
            
            <div className="flex border-t border-white/5 h-14">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 text-[17px] font-medium text-[#0A84FF] hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors border-r border-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="flex-1 text-[17px] font-bold text-[#FF453A] hover:bg-red-500/10 active:bg-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
