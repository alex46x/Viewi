'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  X,
  Eye,
  EyeOff
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
  const [showPassword, setShowPassword] = useState(false);
  const [authStep, setAuthStep] = useState('initial'); // 'initial', 'username-select'
  const [tempIdToken, setTempIdToken] = useState(null);
  const [chosenUsername, setChosenUsername] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth } = await import('@/lib/firebase');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.newUser) {
          setTempIdToken(idToken);
          setAuthStep('username-select');
          // Suggest a username based on email
          const suggested = data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          setChosenUsername(suggested);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        setError(data.error || 'Failed to create session');
      }
    } catch (err) {
      console.error(err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!chosenUsername || chosenUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idToken: tempIdToken,
          username: chosenUsername 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Failed to set username');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
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
        if (formData.username) {
          await updateProfile(userCredential.user, { displayName: formData.username });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }

      const idToken = await userCredential.user.getIdToken();
      
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
    <div className="w-full max-w-[440px] md:max-w-[940px] animate-in fade-in zoom-in-95 duration-500 relative z-10 select-none">
      <div className="bg-white rounded-[2.5rem] border border-gray-100/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden grid grid-cols-1 md:grid-cols-12 p-3 md:p-4 gap-4 md:gap-6">
        
        {/* Left Column: Auth Form */}
        <div className="col-span-12 md:col-span-6 flex flex-col justify-between p-4 sm:p-6 md:p-8 min-h-[480px] bg-gradient-to-br from-white via-white to-amber-50/40 relative">
          
          {/* Top segment: Logo & Close Button (Close button only visible on mobile here) */}
          <div className="flex items-center justify-between w-full mb-6">
            <div className="inline-flex items-center gap-2 border border-gray-200/80 rounded-full px-4 py-1.5 bg-white shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 shadow-sm" />
              <span className="font-extrabold text-[11px] text-gray-800 tracking-wider">Viewi</span>
            </div>
            
            <Link 
              href="/"
              className="md:hidden p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95 text-gray-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </Link>
          </div>

          {authStep === 'username-select' ? (
            <div className="animate-in slide-in-from-right-8 duration-500 my-auto">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-300 to-amber-400 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-amber-300/10">
                  <User className="w-6 h-6 text-gray-800" />
                </div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight mb-1">
                  Pick a username
                </h2>
                <p className="text-gray-400 text-xs font-semibold max-w-[200px] mx-auto leading-relaxed">
                  Choose a unique handle for your Viewi link-in-bio page
                </p>
              </div>

              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-2xl animate-bounce">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 pl-4 uppercase tracking-wider">Handle</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      className="w-full bg-gray-50/80 hover:bg-gray-100/50 focus:bg-white border border-gray-100/60 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 rounded-full px-5 py-3.5 text-xs text-gray-800 placeholder:text-gray-300 transition-all focus:outline-none"
                      placeholder="username"
                      value={chosenUsername}
                      onChange={(e) => setChosenUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-4 bg-[#fcd34d] hover:bg-[#fbbf24] disabled:bg-amber-200 text-gray-900 font-extrabold rounded-full hover:shadow-[0_8px_20px_rgba(252,211,77,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 relative overflow-hidden cursor-pointer text-xs uppercase tracking-wider"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-gray-900" /> : 'Complete Setup'}
                </button>

                <button
                  type="button"
                  onClick={() => setAuthStep('initial')}
                  className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </form>
            </div>
          ) : (
            <div className="my-auto">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">
                  {mode === 'signup' ? 'Create an account' : 'Welcome back'}
                </h2>
                <p className="text-gray-400 text-xs font-semibold max-w-[280px] leading-relaxed">
                  {mode === 'signup' ? 'Sign up and claim your unique link-in-bio page today' : 'Sign in to access your traffic analytics'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-2xl animate-shake">
                    {error}
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 pl-4 uppercase tracking-wider">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50/80 hover:bg-gray-100/50 focus:bg-white border border-gray-100/60 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 rounded-full px-5 py-3.5 text-xs text-gray-800 placeholder:text-gray-300 transition-all focus:outline-none"
                        placeholder="choose_a_username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 pl-4 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      className="w-full bg-gray-50/80 hover:bg-gray-100/50 focus:bg-white border border-gray-100/60 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 rounded-full px-5 py-3.5 text-xs text-gray-800 placeholder:text-gray-300 transition-all focus:outline-none"
                      placeholder="yourname@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 pl-4 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full bg-gray-50/80 hover:bg-gray-100/50 focus:bg-white border border-gray-100/60 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 rounded-full pl-5 pr-11 py-3.5 text-xs text-gray-800 placeholder:text-gray-300 transition-all focus:outline-none"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 transition-all cursor-pointer z-10"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 bg-[#fcd34d] hover:bg-[#fbbf24] disabled:bg-amber-200 text-gray-900 font-extrabold rounded-full hover:shadow-[0_8px_20px_rgba(252,211,77,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 relative overflow-hidden cursor-pointer text-xs uppercase tracking-wider"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
                  ) : (
                    mode === 'signup' ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">or connect with</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              <div className="mt-4">
                <button 
                  type="button" 
                  onClick={handleGoogleLogin} 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-200 hover:bg-gray-50 rounded-full transition-all active:scale-[0.98] cursor-pointer shadow-sm bg-white"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-xs font-bold text-gray-700">Continue with Google</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Footer links */}
          <div className="mt-8 flex justify-center w-full text-[11px] text-gray-400 font-semibold tracking-wide">
            <div>
              {mode === 'signup' ? (
                <span>
                  Have an account?{' '}
                  <button 
                    onClick={() => { setMode('signin'); setError(''); }}
                    className="text-amber-500 hover:text-amber-600 font-bold ml-1 cursor-pointer transition-colors"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  New to Viewi?{' '}
                  <button 
                    onClick={() => { setMode('signup'); setError(''); }}
                    className="text-amber-500 hover:text-amber-600 font-bold ml-1 cursor-pointer transition-colors"
                  >
                    Sign up
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Illustration + Floating Glass Widgets */}
        <div className="col-span-12 md:col-span-6 hidden md:flex flex-col relative rounded-[2.2rem] overflow-hidden border border-gray-100 min-h-[520px]">
          <div className="absolute inset-0 z-0">
            <img 
              src="/auth_illustration.png" 
              alt="Viewi Collaborative Network" 
              className="w-full h-full object-cover select-none" 
            />
            {/* Cinematic subtle gradients over image */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 via-transparent to-transparent" />
          </div>

          {/* Close Button overlaying the illustration */}
          <Link 
            href="/"
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95 text-gray-500 cursor-pointer flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </Link>

          {/* Overlay Interactive Glassmorphic Widgets */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 pointer-events-none select-none">
            
            {/* Widget 1: Task Review */}
            <div className="absolute top-10 left-8 z-10 flex flex-col gap-2 pointer-events-none select-none">
              <div className="px-4 py-3 rounded-2xl bg-[#fcd34d] shadow-[0_12px_24px_rgba(252,211,77,0.15)] border border-amber-300/30 flex flex-col gap-0.5 max-w-[210px] transform hover:-rotate-1 transition-transform">
                <span className="text-[10px] font-black text-gray-900 tracking-tight leading-snug">Task Review With Team</span>
                <span className="text-[8px] font-bold text-gray-700/80 leading-none">09:30am - 10:00am</span>
              </div>
              <div className="ml-6 px-3 py-1.5 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/5 shadow-lg flex items-center self-start">
                <span className="text-[7.5px] font-extrabold text-white/60 tracking-wider">09:30am - 10:00am</span>
              </div>
            </div>

            {/* Widget 2: Overlapping Creator Avatars */}
            <div className="absolute right-8 top-28 z-10 flex flex-col gap-2 pointer-events-none select-none">
              <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-8.5 h-8.5 rounded-full border-2 border-white overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-4 right-0 w-8.5 h-8.5 rounded-full border-2 border-white overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 left-3 w-8.5 h-8.5 rounded-full border-2 border-white overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Widget 3: Weekly Calendar Card */}
            <div className="absolute bottom-28 right-6 z-10 w-[230px] p-4 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col gap-2.5 pointer-events-none select-none">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[7.5px] font-bold text-gray-800/50">Sun</span>
                    <span className="text-[9.5px] font-black text-gray-800">22</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7.5px] font-bold text-gray-800/50">Mon</span>
                    <span className="text-[9.5px] font-black text-gray-800">23</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7.5px] font-bold text-gray-800/50">Tue</span>
                    <span className="text-[9.5px] font-black text-gray-800">24</span>
                  </div>
                  <div className="flex flex-col items-center px-1.5 py-0.5 rounded-lg bg-white/70 border border-white/30 shadow-sm">
                    <span className="text-[7.5px] font-black text-gray-900">Wed</span>
                    <span className="text-[9.5px] font-black text-amber-500">25</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7.5px] font-bold text-gray-800/50">Thu</span>
                    <span className="text-[9.5px] font-black text-gray-800">26</span>
                  </div>
                </div>
                {/* Diagonal frosted stripes decor */}
                <div className="w-10 h-6 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 4px)', backgroundSize: '6px 6px' }} />
              </div>
            </div>

            {/* Widget 4: Daily Meeting Card */}
            <div className="absolute bottom-6 left-6 z-10 p-3.5 rounded-2xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-2 w-[180px] pointer-events-none select-none">
              <div>
                <p className="text-[9.5px] font-black text-gray-800 tracking-tight leading-none mb-0.5">Daily Meeting</p>
                <p className="text-[7.5px] font-bold text-gray-400 leading-none">12:00pm - 01:00pm</p>
              </div>
              <div className="flex -space-x-1 overflow-hidden">
                <img className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" />
                <img className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" />
                <img className="inline-block h-4.5 w-4.5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&auto=format&fit=crop&q=80" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
