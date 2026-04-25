import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { CalendarDays, MapPin, Clock, Trophy } from 'lucide-react';
import Footer from '../components/Footer';

const PlayPage = () => {
  const { matches, currentUser } = useContext(AppContext);
  const { t, localizeDigits } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleEnrollClick = (matchId) => {
    navigate(`/enroll/${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50 dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] pt-24 pb-12 font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#004BA0] dark:text-blue-400 tracking-tight flex justify-center items-center gap-4">
            <Trophy className="w-10 h-10 text-[#D1AB3E]" /> {t('upcomingMatches')} <Trophy className="w-10 h-10 text-[#D1AB3E]" />
          </h1>
          <div className="w-24 h-1.5 bg-[#D1AB3E] mx-auto mt-6 rounded-full"></div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center shadow-xl">
            <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('noMatches')}</h3>
            <p className="text-slate-500 mt-2">{t('checkBack')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matches.map(m => (
              <div key={m.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="h-32 bg-gradient-to-br from-[#004BA0] to-[#002652] relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                  <h3 className="text-2xl font-black text-white relative z-10 px-4 text-center tracking-tight drop-shadow-md group-hover:scale-105 transition-transform">{m.title}</h3>
                </div>
                
                <div className="p-8">
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#004BA0] dark:text-blue-400">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">{t('date')}</span>
                        <span className="font-semibold">{localizeDigits(m.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#004BA0] dark:text-blue-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">{t('time')}</span>
                        <span className="font-semibold">{localizeDigits(m.time)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#004BA0] dark:text-blue-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase">{t('venue')}</span>
                        <span className="font-semibold">{m.place}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleEnrollClick(m.id)}
                    className="w-full py-4 bg-gradient-to-r from-[#D1AB3E] to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-[#004BA0] font-black rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 uppercase tracking-widest text-sm"
                  >
                    {currentUser ? t('enrollNow') : t('loginToEnroll')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PlayPage;
