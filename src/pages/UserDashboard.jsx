import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { Calendar, MapPin, Clock, CheckCircle, ChevronRight, Trophy } from 'lucide-react';
import Footer from '../components/Footer';

const UserDashboard = () => {
  const { currentUser, matches, enrollments } = useContext(AppContext);
  const { t, localizeDigits } = useContext(LanguageContext);
  const navigate = useNavigate();

  const userEnrollments = enrollments.filter(e => e.userId === currentUser?.id);
  const enrolledMatchIds = userEnrollments.map(e => e.matchId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50 dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] transition-all duration-500 pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center font-bold text-4xl text-[#003673] dark:text-[#D1AB3E] border border-slate-100 dark:border-slate-700">
              {currentUser?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {t('welcomeUser').replace('{name}', currentUser?.username || '')}
              </h1>
              <p className="text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-2 font-semibold">
                <MapPin className="w-5 h-5" /> {t('cityPlayer').replace('{city}', currentUser?.city || '')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block h-12 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex flex-col items-end">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('status')}</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t('activeMember')}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content - Upcoming Matches */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('upcomingMatches')}</h2>
              <span className="text-xs font-bold px-3 py-1 bg-[#D1AB3E]/10 text-[#D1AB3E] rounded-full border border-[#D1AB3E]/20 uppercase tracking-wider">{t('explore')}</span>
            </div>
            
            {matches.length === 0 ? (
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t('noUpcomingMatches')}</p>
                <p className="text-slate-400 text-sm mt-2">{t('checkBack')}</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {matches.map(match => {
                  const isEnrolled = enrolledMatchIds.includes(match.id);
                  return (
                    <div key={match.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className={`absolute top-0 left-0 w-2 h-full ${isEnrolled ? 'bg-emerald-500' : 'bg-[#003673]'}`}></div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {isEnrolled && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-emerald-500 text-white rounded-md uppercase tracking-widest shadow-sm">
                              <CheckCircle className="w-3 h-3" /> {t('enrolled')}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('matchDetails')}</span>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
                          {match.title || 'Cricket Match'}
                        </h3>
                        
                        <div className="flex flex-wrap gap-5 text-sm text-slate-600 dark:text-slate-400 font-semibold">
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                            <Calendar className="w-4 h-4 text-[#D1AB3E]" />
                            {localizeDigits(match.date)}
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                            <Clock className="w-4 h-4 text-[#D1AB3E]" />
                            {localizeDigits(match.time)}
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                            <MapPin className="w-4 h-4 text-[#D1AB3E]" />
                            {match.place}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 w-full md:w-auto">
                        {!isEnrolled ? (
                          <button
                            onClick={() => navigate(`/enroll/${match.id}`)}
                            className="w-full px-8 py-4 bg-[#003673] hover:bg-[#002a5e] text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95"
                          >
                            {t('enrollNow')} <ChevronRight className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="w-full px-8 py-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center gap-2 shadow-sm">
                            <CheckCircle className="w-5 h-5" /> {t('registered')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - Your Activity */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('yourActivity')}</h2>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{t('recentEnrollments')}</h3>
              
              {userEnrollments.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-500 text-sm font-medium leading-relaxed px-4">
                    {t('noEnrollmentsYet')}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {userEnrollments.map(enrollment => {
                    const match = matches.find(m => m.id === enrollment.matchId);
                    return (
                      <div key={enrollment.id} className="group border-b border-slate-100 dark:border-slate-800 last:border-0 pb-5 last:pb-0 transition-all hover:translate-x-1">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all text-emerald-500">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#003673] dark:group-hover:text-emerald-400 transition-colors tracking-tight">
                              {match?.title || 'Cricket Match'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">{localizeDigits(match?.date)}</p>
                            <div className="flex items-center gap-1.5 mt-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{t('asPlayer').replace('{name}', enrollment.playerName)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Support Box */}
            <div className="bg-[#D1AB3E] rounded-3xl p-8 text-[#003673] shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <h4 className="text-lg font-bold mb-2">{t('needHelp')}</h4>
              <p className="text-sm font-semibold opacity-80 leading-relaxed mb-6">{t('supportDesc')}</p>
              <button onClick={() => navigate('/contact')} className="px-6 py-3 bg-[#003673] text-[#D1AB3E] rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-black/20 active:scale-95 transition-all">
                {t('supportDesk')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;

