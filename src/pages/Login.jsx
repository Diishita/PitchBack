import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { User, MapPin, Phone, X, ArrowRight, ShieldCheck } from 'lucide-react';

const MAHARASHTRA_CITIES = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", 
  "Chhatrapati Sambhajinagar", "Solapur", "Amravati", 
  "Navi Mumbai", "Kolhapur", "Akola", "Jalgaon", "Latur"
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const dropdownRef = useRef(null);

  const { loginUser, currentUser, recentLogins, removeRecentLogin } = useContext(AppContext);
  const { t, localizeDigits } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRecent(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || (!contactNumber && username !== 'admin@admin.com') || (!city && username !== 'admin@admin.com')) {
      if (username !== 'admin@admin.com') return;
    }
    loginUser(username, contactNumber, city);
  };

  const handleRecentLoginClick = (recent) => {
    setUsername(recent.username);
    setContactNumber(recent.contactNumber);
    setCity(recent.city);
    setShowRecent(false);
  };

  const isAdmin = username.toLowerCase() === 'admin@admin.com';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#004BA0]/10 blur-3xl" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#D1AB3E]/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#004BA0] to-[#0060CD] rounded-2xl flex items-center justify-center shadow-lg shadow-[#004BA0]/30 mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#003673] dark:text-white tracking-tight">
            {t('portalAccess')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            {t('portalSubtext')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              {t('emailUsername')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#004BA0] dark:text-blue-400">
                <User className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                required
                value={username}
                onFocus={() => setShowRecent(true)}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#004BA0]/50 outline-none transition-all text-slate-900 dark:text-white text-sm font-medium"
                placeholder={t('enterCredentials')}
              />
            </div>

            {showRecent && recentLogins.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('recentAccounts')}</span>
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {recentLogins.map((recent, idx) => (
                    <li key={idx} className="group border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-[#004BA0]/5 dark:hover:bg-[#004BA0]/20 transition-colors cursor-pointer" onClick={() => handleRecentLoginClick(recent)}>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{recent.username}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{recent.city} • {localizeDigits(recent.contactNumber)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeRecentLogin(recent.username); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={`transition-all duration-300 overflow-hidden ${isAdmin ? 'h-0 opacity-0' : 'h-[76px] opacity-100'}`}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{t('contactNumberLabel')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#004BA0] dark:text-blue-400">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <input
                type="tel"
                required={!isAdmin}
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#004BA0]/50 outline-none transition-all text-slate-900 dark:text-white text-sm font-medium"
                placeholder={t('enterContactNumber')}
              />
            </div>
          </div>

          <div className={`transition-all duration-300 overflow-hidden ${isAdmin ? 'h-0 opacity-0' : 'h-[76px] opacity-100'}`}>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{t('cityLabel')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#004BA0] dark:text-blue-400">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                list="maharashtra-cities"
                required={!isAdmin}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#004BA0]/50 outline-none transition-all text-slate-900 dark:text-white text-sm font-medium"
                placeholder={t('cityPlaceholder')}
              />
              <datalist id="maharashtra-cities">
                {MAHARASHTRA_CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-4 bg-gradient-to-r from-[#003673] to-[#002244] hover:from-[#002244] hover:to-[#001122] text-[#D1AB3E] text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 group uppercase tracking-widest"
          >
            {t('loginSignup')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

