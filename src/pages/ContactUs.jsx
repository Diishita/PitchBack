import { useContext, useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { MessageCircle, Phone, Mail, Send, MapPin } from 'lucide-react';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { useAsyncAction } from '../hooks/useAsyncAction';

const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const ContactUs = () => {
  const { t, localizeDigits } = useContext(LanguageContext);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { isPending, error, run } = useAsyncAction();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Listen for voice commands to open suggestion form
  useEffect(() => {
    const handler = (e) => {
      const { intent } = e.detail || {};
      if (intent === 'open') {
        const nameInput = document.querySelector('#suggestion-name');
        if (nameInput) nameInput.focus();
      }
    };
    window.addEventListener('voice-command', handler);
    return () => window.removeEventListener('voice-command', handler);
  }, []);

  const handleSuggest = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    const result = await run(() => api.suggestions.create({ name, message }));
    if (result.error) return;
    setName('');
    setMessage('');
    setSubmitted(true);
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50 dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] pt-24 pb-12 font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#003673] dark:text-blue-400 tracking-tight flex justify-center items-center gap-4">
            <MessageCircle className="w-10 h-10 text-[#D1AB3E]" /> {t('contactTitle')}
          </h1>
          <div className="w-24 h-1.5 bg-[#D1AB3E] mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t('contactInfo')}</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-[#0060a8] transition-colors">
                  <UserIcon className="w-6 h-6 text-[#0060a8] dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase">{t('contactPerson')}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('contactName')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-[#0060a8] transition-colors">
                  <Phone className="w-6 h-6 text-[#0060a8] dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase">{t('phoneNumber')}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{localizeDigits(t('contactPhone'))}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-[#0060a8] transition-colors">
                  <Mail className="w-6 h-6 text-[#0060a8] dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase">{t('emailAddress')}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{t('contactEmail')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-[#0060a8] transition-colors shrink-0 mt-1">
                  <MapPin className="w-6 h-6 text-[#0060a8] dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase">{t('ourAddress')}</p>
                  <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed mt-1 whitespace-pre-line">
                    {localizeDigits(t('addressDetail'))}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('connectWithUs')}</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg hover:-translate-y-1 transition-transform">
                  <InstagramIcon className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-[#1877F2] rounded-2xl flex items-center justify-center text-white shadow-lg hover:-translate-y-1 transition-transform">
                  <FacebookIcon className="w-6 h-6" />
                </a>
                <a href="#" className="w-12 h-12 bg-[#25D366] rounded-2xl flex items-center justify-center text-white shadow-lg hover:-translate-y-1 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden" style={{ backgroundColor: '#FEF3DC' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-8 relative z-10">{t('suggestionBox')}</h2>
            
            <form onSubmit={handleSuggest} className="space-y-6 relative z-10">
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
              {submitted && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{t('suggestionSuccess')}</p>}
              <div>
                <label htmlFor="suggestion-name" className="block text-slate-700 text-sm font-semibold mb-2">{t('yourName')}</label>
                <input
                  id="suggestion-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  placeholder={t('yourName')}
                />
              </div>
              
              <div>
                <label htmlFor="suggestion-message" className="block text-slate-700 text-sm font-semibold mb-2">{t('messageSuggestion')}</label>
                <textarea
                  id="suggestion-message"
                  required
                  minLength={5}
                  maxLength={2000}
                  rows="4"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full bg-white/80 border border-amber-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  placeholder={t('messageSuggestion')}
                />
              </div>

              <button type="submit" disabled={isPending} className="w-full bg-gradient-to-r from-[#D1AB3E] to-amber-500 hover:from-amber-500 hover:to-[#D1AB3E] disabled:opacity-60 text-slate-900 font-bold text-lg py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> {isPending ? t('sendingSuggestion') : t('sendMsg')}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

// Custom User Icon
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default ContactUs;
