'use client';

import { useState } from 'react';
import { Shield, Bell, Trash2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-2xl space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Security & Privacy
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div>
              <p className="font-medium">Email Address</p>
              <p className="text-sm text-muted-foreground">mrx46@example.com</p>
            </div>
            <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">Change</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last updated 2 months ago</p>
            </div>
            <button className="text-sm font-semibold text-blue-400 hover:text-blue-300">Update</button>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-2xl space-y-6">
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

      <div className="glass-card p-8 rounded-2xl border-red-500/20 bg-red-500/5 space-y-6">
        <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Deleting your account is permanent and will remove all your data, including your unique username and analytics forever.
        </p>
        <button className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Delete Account
        </button>
      </div>
    </div>
  );
}
