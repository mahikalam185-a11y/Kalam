import React, { useState } from 'react';
import { useCyberCafe } from '../../context/CyberCafeContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Phone,
  MapPin,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Globe,
  Sparkles,
  Zap
} from 'lucide-react';

export const LoginPage: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const {
    settings,
    adminPin,
    loginAdmin,
    setActiveTab,
    closeModal
  } = useCyberCafe();

  const [username, setUsername] = useState('abukalam');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(true);
      setErrorMessage('User ID এবং Password উভয়ই প্রদান করুন');
      setTimeout(() => setError(false), 3000);
      return;
    }

    const ok = loginAdmin(username, password);
    if (ok) {
      setSuccess(true);
      setError(false);
      setTimeout(() => {
        closeModal();
        setActiveTab('orders');
      }, 700);
    } else {
      setError(true);
      setErrorMessage('User ID অথবা Password ভুল হয়েছে! সঠিক তথ্য দিন (User: abukalam, Pass: 8609)');
      setTimeout(() => setError(false), 3500);
    }
  };

  const handleQuickFill = () => {
    setUsername('abukalam');
    setPassword('8609');
    setError(false);
  };

  const handleSwitchToCustomerPortal = () => {
    closeModal();
    setActiveTab('portal');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Ambient glow backgrounds */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Wordmark & Kendra Badging */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            AFRINA INTERNET CAFE
          </h1>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin Operator Portal (অ্যাডমিন প্যানেল)</span>
          </div>

          {/* Shop Details */}
          <div className="text-xs text-slate-400 space-y-1 pt-1 font-medium">
            <div className="flex items-center justify-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>BALI HATPARA NOWDA MSD 741156</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white">8609550430</span>
              </span>
              <span>·</span>
              <span className="text-amber-300">UPI: 8609550430@ybl</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] pt-0.5">
              <User className="w-3 h-3 text-cyan-400" />
              <span>Operator: <strong className="text-slate-200">ABU KALAM SHEIKH</strong></span>
            </div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 relative z-10 shadow-lg">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Operator Login (ইউজার আইডি ও পাসওয়ার্ড)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 transition-colors"
              title="Auto-fill Abu Kalam Sheikh credentials"
            >
              <Zap className="w-3 h-3" />
              <span>Quick Fill</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* User ID Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>User ID / ইউজারনেম</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. abukalam or 8609550430"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Default: <span className="font-mono text-cyan-300">abukalam</span> বা <span className="font-mono text-cyan-300">8609550430</span>
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Password / পাসওয়ার্ড</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter Password (e.g. 8609)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-900 border border-slate-700/80 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Default Password: <span className="font-mono text-cyan-300">8609</span>
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>লগইন সফল হয়েছে! স্বাগতম, আবু কালাম সেখ।</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl transition-all shadow-md shadow-cyan-400/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <KeyRound className="w-4 h-4" />
              <span>Login as Admin (লগইন করুন)</span>
            </button>
          </form>

        </div>

        {/* Public Citizen Portal Switcher */}
        <div className="text-center pt-1 relative z-10 space-y-2">
          <p className="text-xs text-slate-400">
            For citizens & customers viewing rates or applying online:
          </p>
          <button
            type="button"
            onClick={handleSwitchToCustomerPortal}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Open Public Service Portal (কাস্টমার সেবা ও রেট চার্ট)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
