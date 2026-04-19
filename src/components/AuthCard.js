'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  X,
  Github
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthCard({ initialMode = 'signup' }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode); // 'signup' or 'signin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Send token to our backend to set session cookie
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      console.error(err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { 
      signInWithEmailAndPassword, 
      createUserWithEmailAndPassword,
      updateProfile 
    } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    
    try {
      let userCredential;
      if (mode === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        // Set display name if signup
        if (formData.username) {
          await updateProfile(userCredential.user, { displayName: formData.username });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }

      const idToken = await userCredential.user.getIdToken();
      
      // Sync with session and firestore
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken,
          username: mode === 'signup' ? formData.username : undefined 
        }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Platform sync failed');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Email already in use');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') setError('Invalid credentials');
      else setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-card p-8 md:p-10 rounded-[40px] relative overflow-hidden">
        {/* Close Button Placeholder (Matches reference) */}
        <button className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/40">
          <X className="w-5 h-5" />
        </button>

        {/* Toggle Pill */}
        <div className="flex justify-center mb-10">
          <div className="p-1 bg-black/40 rounded-full flex relative w-[220px]">
            <div 
              className={cn(
                "absolute inset-y-1 w-[108px] bg-white/10 rounded-full transition-all duration-300 ease-out",
                mode === 'signup' ? "translate-x-0" : "translate-x-[100px]"
              )}
            />
            <button 
              onClick={() => setMode('signup')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-full relative z-10 transition-colors",
                mode === 'signup' ? "text-white" : "text-white/40"
              )}
            >
              Sign up
            </button>
            <button 
              onClick={() => setMode('signin')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-full relative z-10 transition-colors",
                mode === 'signin' ? "text-white" : "text-white/40"
              )}
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 transition-all duration-300">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h1>
          <p className="text-white/40 text-sm font-medium">
            {mode === 'signup' ? 'Start building your digital identity today' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-2xl animate-shake">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/10 transition-all"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/10 transition-all"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white/10 transition-all"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-500/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === 'signup' ? 'Create an account' : 'Sign in to account'}
                {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
              </>
            )}
          </button>
        </form>

        <div className="mt-10 mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">OR SIGN {mode === 'signup' ? 'UP' : 'IN'} WITH</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="space-y-3">
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
              <path fill="#34A853" d="M16.04 18.013c-1.09.693-2.43 1.078-3.82 1.078-3.34 0-6.218-2.174-7.37-5.176l-4.012 3.11c1.93 3.997 5.992 6.756 10.712 6.756 2.924 0 5.461-1.011 7.212-2.72l-4.04-3.048Z" />
              <path fill="#4A90E2" d="M19.834 7.5c.204.643.321 1.332.321 2.053 0 1.954-.643 3.614-1.761 4.795l4.04 3.048C24.364 15.65 25 12.87 25 9.553c0-.643-.058-1.264-.166-1.854h-12.834v4.545h7.834Z" />
              <path fill="#FBBC05" d="M5.266 14.235a7.074 7.074 0 0 1-.366-2.235c0-.776.132-1.522.366-2.235L1.24 6.65a11.83 11.83 0 0 0-.585 5.35c0 1.883.433 3.655 1.196 5.23l4.012-3.11c-.381-.82-.597-1.74-.597-2.885Z" />
            </svg>
            <span className="text-sm font-bold text-white/90">Continue with Google</span>
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] text-white/20 font-medium">
          By continuing, you agree to our <span className="text-white/40 cursor-pointer hover:text-white underline underline-offset-2">Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
