import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import {
  LogOut, Plus, Users, CalendarDays, ClipboardList,
  Trash2, BarChart2, Moon, Sun, ShieldBan, ShieldCheck,
  CircleDot, Clock, MapPin, Trophy, TrendingUp, Edit3, Eye, X, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const BRAND = '#003673';

const AdminDashboard = () => {
  const {
    matches,
    users,
    enrollments,
    suggestions,
    addMatch,
    deleteMatch,
    updateMatch,
    deleteUser,
    toggleBlockUser,
    updateSuggestionStatus,
    logoutUser,
    theme,
    toggleTheme,
  } = useContext(AppContext);
  const { t, localizeDigits } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('matches');
  const [newMatch, setNewMatch] = useState({ title: '', date: '', time: '', place: '' });
  const [editingMatch, setEditingMatch] = useState(null);
  const [viewingPlayersFor, setViewingPlayersFor] = useState(null);
  const [viewingEnrollment, setViewingEnrollment] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleLogout = async () => {
    if (await logoutUser()) navigate('/');
  };

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!newMatch.title || !newMatch.date || !newMatch.time || !newMatch.place) return;
    setActionError('');
    try {
      await addMatch({ ...newMatch });
      setNewMatch({ title: '', date: '', time: '', place: '' });
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleUpdateMatch = async (e) => {
    e.preventDefault();
    if (!editingMatch.title || !editingMatch.date || !editingMatch.time || !editingMatch.place) return;
    setActionError('');
    try {
      await updateMatch(editingMatch.id, { ...editingMatch });
      setEditingMatch(null);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    setActionError('');
    try {
      await deleteMatch(matchId);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionError('');
    try {
      await deleteUser(userId);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleToggleBlock = async (userId) => {
    setActionError('');
    try {
      await toggleBlockUser(userId);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleReviewSuggestion = async (suggestionId) => {
    setActionError('');
    try {
      await updateSuggestionStatus(suggestionId, 'reviewed');
    } catch (error) {
      setActionError(error.message);
    }
  };

  const cityStats = useMemo(() => {
    const counts = {};
    users.filter(u => u.role === 'user').forEach(u => {
      const city = u.city || 'Unknown';
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.keys(counts).map(city => ({ name: city, count: counts[city] }));
  }, [users]);

  const COLORS = ['#0197f6', '#D1AB3E', '#f59e0b', '#fbbf24', '#8b5cf6'];

  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalEnrollments = enrollments.length;
  const totalMatches = matches.length;

  const tabs = [
    { id: 'matches',     label: t('matchesTab'),     icon: CalendarDays },
    { id: 'enrollments', label: t('enrollmentsTab'), icon: ClipboardList },
    { id: 'users',       label: t('usersTab'),        icon: Users },
    { id: 'suggestions', label: t('suggestionsTab'),  icon: MessageSquare },
    { id: 'stats',       label: t('statsTab'),        icon: BarChart2 },
  ];

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: theme === 'dark' ? '#0f1a2e' : '#f0f7ff' }}
    >
      {/* Top Navbar */}
      <header className="w-full h-16 flex items-center justify-between px-6 md:px-10 shadow-md z-50 sticky top-0" style={{ backgroundColor: BRAND }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D1AB3E] to-yellow-300 flex items-center justify-center shadow">
            <CircleDot className="w-5 h-5 text-[#0197f6]" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">PitchBack</span>
          <span className="hidden sm:inline-block ml-2 text-white/60 text-sm font-medium">· {t('adminPanel')}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-300" /> : <Moon className="w-4 h-4 text-white" />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full border border-white/20 transition-all">
            <LogOut className="w-4 h-4" /> {t('logout')}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 flex flex-col py-8 px-4 shadow-xl hidden md:flex" style={{ backgroundColor: BRAND }}>
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest px-3 mb-4">{t('navigation')}</p>
          <nav className="space-y-1 flex-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white text-[#0197f6] shadow-md'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Stat cards in sidebar */}
          <div className="mt-6 space-y-3">
            <div className="bg-white/10 rounded-2xl p-4 text-white">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">{t('matchesTab')}</p>
              <p className="text-3xl font-bold mt-1">{localizeDigits(totalMatches)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-white">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">{t('player')}</p>
              <p className="text-3xl font-bold mt-1">{localizeDigits(totalUsers)}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-white">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">{t('enrollmentsTab')}</p>
              <p className="text-3xl font-bold mt-1">{localizeDigits(totalEnrollments)}</p>
            </div>
          </div>
        </aside>

        {/* Mobile Tab Bar */}
        <div className="md:hidden w-full flex gap-2 px-4 py-3 overflow-x-auto" style={{ backgroundColor: BRAND }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-white text-[#0197f6]' : 'text-white/80 bg-white/10'}`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {actionError && (
            <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {actionError}
            </p>
          )}

          {/* ── Matches Tab ── */}
          {activeTab === 'matches' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>{t('addNewMatch')}</h2>
                <p className="text-sm text-slate-500 mb-6">{t('portalSubtext')}</p>

                <form onSubmit={handleAddMatch} className={`rounded-3xl p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-end border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  {[
                    { label: t('matchTitleLabel'), key: 'title', type: 'text', placeholder: t('matchTitlePlaceholder'), icon: Trophy },
                    { label: t('date'), key: 'date', type: 'date', placeholder: '', icon: CalendarDays },
                    { label: t('time'), key: 'time', type: 'time', placeholder: '', icon: Clock },
                    { label: t('venue'), key: 'place', type: 'text', placeholder: t('venuePlaceholder'), icon: MapPin },
                  ].map(({ label, key, type, placeholder, icon: Icon }) => (
                    <div key={key}>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {label}
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0197f6]" />
                        <input
                          required
                          type={type}
                          value={newMatch[key]}
                          onChange={e => setNewMatch({ ...newMatch, [key]: e.target.value })}
                          placeholder={placeholder}
                          className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium outline-none border transition-all focus:ring-2 focus:ring-[#0197f6]/40 ${
                            theme === 'dark'
                              ? 'bg-slate-800/60 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="lg:col-span-4 flex justify-end mt-2">
                    <button type="submit" className="flex items-center gap-2 px-8 py-3.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5" style={{ backgroundColor: BRAND }}>
                      <Plus className="w-4 h-4" /> {t('createMatch')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Posted Matches */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('activeMatches')}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {localizeDigits(matches.length)} {t('totalMatches')}
                  </span>
                </div>

                {matches.length === 0 ? (
                  <div className={`rounded-3xl p-12 text-center border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">{t('noMatchesAdmin')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {matches.map(m => (
                      <div key={m.id} className={`rounded-2xl overflow-hidden shadow-md border transition-all hover:-translate-y-1 hover:shadow-xl group ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div className="h-2 w-full" style={{ backgroundColor: BRAND }} />
                        <div className="p-5">
                          <h4 className="font-bold text-base mb-4 group-hover:text-[#0197f6] transition-colors" style={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>
                            {m.title}
                          </h4>
                          <div className="space-y-2.5">
                            <p className={`text-sm font-medium flex items-center gap-2.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#0197f610' }}>
                                <CalendarDays className="w-3.5 h-3.5 text-[#0197f6]" />
                              </span>
                              {localizeDigits(m.date)}
                            </p>
                            <p className={`text-sm font-medium flex items-center gap-2.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#0197f610' }}>
                                <Clock className="w-3.5 h-3.5 text-[#0197f6]" />
                              </span>
                              {localizeDigits(m.time)}
                            </p>
                            <p className={`text-sm font-medium flex items-center gap-2.5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#0197f610' }}>
                                <MapPin className="w-3.5 h-3.5 text-[#0197f6]" />
                              </span>
                              {m.place}
                            </p>
                          </div>
                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-2">
                            <button
                              onClick={() => setViewingPlayersFor(m)}
                              className="px-2.5 py-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm hover:shadow-md active:scale-95"
                            >
                              <Eye className="w-3 h-3" />
                              {t('viewEnrolledPlayers')}
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingMatch(m)}
                                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                                title={t('editMatch')}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(t('delete') + "?")) {
                                    handleDeleteMatch(m.id);
                                  }
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                title={t('delete')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Enrollments Tab ── */}
          {activeTab === 'enrollments' && (
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('enrollmentList')}</h2>
              <p className="text-sm text-slate-500 mb-6">{localizeDigits(enrollments.length)} {t('enrollmentsTab')}</p>
              <div className={`overflow-x-auto rounded-3xl shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50/60'}`}>
                      {[t('playerNameLabel'), t('matchesTab'), t('contactLabel'), t('emergencyInfo'), t('medicalInfoLabel')].map(h => (
                        <th key={h} className="p-5 text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                    {enrollments.length === 0 ? (
                      <tr><td colSpan="5" className="p-10 text-center text-slate-500 text-sm">{t('noEnrollmentsAdmin')}</td></tr>
                    ) : (
                      enrollments.map(e => {
                        const matchName = matches.find(m => m.id === e.matchId)?.title || 'Unknown';
                        return (
                          <tr key={e.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-blue-50/40'}`}>
                            <td className={`p-5 font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{e.playerName}</td>
                            <td className="p-5">
                              <span className="px-2.5 py-1 text-xs font-bold rounded-lg text-[#0197f6] bg-blue-50 border border-blue-100">{matchName}</span>
                            </td>
                            <td className={`p-5 text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{localizeDigits(e.contactNumber)}</td>
                            <td className={`p-5 text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              <span className={`block mb-0.5 font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{e.emergencyName}</span>
                              ({e.emergencyRelation}) · {localizeDigits(e.emergencyContact)}
                            </td>
                            <td className={`p-5 text-xs font-medium max-w-[180px] truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} title={e.medicalInfo}>{e.medicalInfo || 'None'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Users Tab ── */}
          {activeTab === 'users' && (
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('userManagement')}</h2>
              <p className="text-sm text-slate-500 mb-6">{localizeDigits(users.filter(u => u.role !== 'admin').length)} {t('noUsersAdmin')}</p>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {users.filter(u => u.role !== 'admin').map(u => (
                  <div key={u.id} className={`flex items-center justify-between rounded-2xl p-5 border shadow-md transition-all ${
                    u.isBlocked
                      ? theme === 'dark' ? 'bg-red-950/30 border-red-900/50' : 'bg-red-50 border-red-200'
                      : theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white uppercase shadow-md" style={{ backgroundColor: BRAND }}>
                        {u.username[0]}
                      </div>
                      <div>
                        <h4 className={`font-semibold text-base flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {u.username}
                          {u.isBlocked && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-md">{t('block')}</span>}
                        </h4>
                        <p className="text-sm text-slate-500 mt-0.5">{u.city} · {localizeDigits(u.contactNumber)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button
                        onClick={() => handleToggleBlock(u.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                          u.isBlocked
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {u.isBlocked ? <><ShieldCheck className="w-3.5 h-3.5" /> {t('unblock')}</> : <><ShieldBan className="w-3.5 h-3.5" /> {t('block')}</>}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-3 py-2 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
                      </button>
                    </div>
                  </div>
                ))}
                {users.filter(u => u.role !== 'admin').length === 0 && (
                  <div className={`col-span-2 p-12 rounded-3xl border text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">{t('noUsersAdmin')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Suggestions Tab ── */}
          {activeTab === 'suggestions' && (
            <section>
              <h2 className={`mb-1 text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t('suggestionsTab')}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {localizeDigits(suggestions.length)} {t('suggestionsReceived')}
              </p>
              {suggestions.length === 0 ? (
                <div className={`rounded-3xl border p-12 text-center ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="font-medium text-slate-500">{t('noSuggestions')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <article
                      key={suggestion.id}
                      className={`rounded-2xl border p-5 shadow-md ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {suggestion.name}
                          </h3>
                          <time dateTime={suggestion.createdAt} className="mt-1 block text-xs text-slate-500">
                            {new Date(suggestion.createdAt).toLocaleString()}
                          </time>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${suggestion.status === 'new' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {suggestion.status === 'new' ? t('suggestionNew') : t('suggestionReviewed')}
                        </span>
                      </div>
                      <p className={`mt-4 whitespace-pre-wrap break-words text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {suggestion.message}
                      </p>
                      {suggestion.status === 'new' && (
                        <button
                          type="button"
                          onClick={() => handleReviewSuggestion(suggestion.id)}
                          className="mt-4 rounded-lg bg-[#003673] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                        >
                          {t('markReviewed')}
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Stats Tab ── */}
          {activeTab === 'stats' && (
            <div>
              <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('userDistribution')}</h2>
              <p className="text-sm text-slate-500 mb-6">{t('statsOverview')}</p>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                  { label: t('totalMatches'), value: totalMatches, icon: Trophy, color: '#0197f6' },
                  { label: t('totalUsers'), value: totalUsers, icon: Users, color: '#D1AB3E' },
                  { label: t('enrollmentsTab'), value: totalEnrollments, icon: TrendingUp, color: '#10b981' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className={`rounded-2xl p-6 border shadow-md flex items-center gap-5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{label}</p>
                      <p className="text-3xl font-bold mt-0.5" style={{ color }}>{localizeDigits(value)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`rounded-3xl border shadow-xl p-8 h-[380px] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                {cityStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} vertical={false} />
                      <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} tick={{ fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} allowDecimals={false} tick={{ fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', color: theme === 'dark' ? '#f8fafc' : '#0f172a', borderRadius: '1rem', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)' }}
                        cursor={{ fill: theme === 'dark' ? '#0f172a' : '#f8fafc' }}
                      />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={56}>
                        {cityStats.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                    <BarChart2 className="w-12 h-12 text-slate-300" />
                    <p className="font-medium">Not enough data to display charts.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Edit Match Modal ── */}
      {editingMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-white'}`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg dark:text-white">{t('editMatch')}</h3>
              <button onClick={() => setEditingMatch(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateMatch} className="p-6 space-y-4">
              {[
                { label: t('matchTitleLabel'), key: 'title', type: 'text', icon: Trophy },
                { label: t('date'), key: 'date', type: 'date', icon: CalendarDays },
                { label: t('time'), key: 'time', type: 'time', icon: Clock },
                { label: t('venue'), key: 'place', type: 'text', icon: MapPin },
              ].map(({ label, key, type, icon: Icon }) => (
                <div key={key}>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0197f6]" />
                    <input
                      required
                      type={type}
                      value={editingMatch[key]}
                      onChange={e => setEditingMatch({ ...editingMatch, [key]: e.target.value })}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none border transition-all ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingMatch(null)} className="flex-1 py-3 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {t('cancel')}
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#003673] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
                  {t('updateMatch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Enrolled Players Modal ── */}
      {viewingPlayersFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-white'}`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10">
              <div>
                <h3 className="font-bold text-lg dark:text-white">{t('enrolledPlayers')}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{viewingPlayersFor.title}</p>
              </div>
              <button onClick={() => setViewingPlayersFor(null)} className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {enrollments.filter(e => e.matchId === viewingPlayersFor.id).length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-medium">{t('noEnrollmentsAdmin')}</div>
              ) : (
                <div className="grid gap-3">
                  {enrollments.filter(e => e.matchId === viewingPlayersFor.id).map(e => (
                    <div key={e.id} className={`p-4 rounded-2xl border flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                      <div>
                        <p className="font-bold text-sm dark:text-white">{e.playerName}</p>
                        <p className="text-xs text-slate-500">{localizeDigits(e.contactNumber)}</p>
                      </div>
                      <button 
                        onClick={() => setViewingEnrollment(e)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#0197f6] shadow-sm hover:shadow-md transition-all"
                      >
                        {t('viewForm')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Individual Enrollment Form Modal ── */}
      {viewingEnrollment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-white'}`}>
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between" style={{ backgroundColor: BRAND }}>
              <h3 className="font-bold text-lg text-white">{t('playerEnrollmentForm')}</h3>
              <button onClick={() => setViewingEnrollment(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
              {/* Player Detail Section */}
              <section>
                <div className="flex items-center gap-3 mb-4 text-[#0197f6]">
                   <Users className="w-5 h-5" />
                   <h4 className="font-bold uppercase tracking-wider text-xs">{t('playerDetails')}</h4>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('playerNameLabel')}</p>
                    <p className="font-semibold dark:text-white">{viewingEnrollment.playerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('contactNumberLabel')}</p>
                    <p className="font-semibold dark:text-white">{localizeDigits(viewingEnrollment.contactNumber)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('dobLabel')}</p>
                    <p className="font-semibold dark:text-white">{localizeDigits(viewingEnrollment.dob)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('addressLabel')}</p>
                    <p className="font-semibold dark:text-white leading-relaxed">{viewingEnrollment.address}</p>
                  </div>
                </div>
              </section>

              {/* Emergency Section */}
              <section>
                <div className="flex items-center gap-3 mb-4 text-red-500">
                   <ShieldBan className="w-5 h-5" />
                   <h4 className="font-bold uppercase tracking-wider text-xs">{t('emergencyInfo')}</h4>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('fullNameLabel')}</p>
                    <p className="font-semibold dark:text-white">{viewingEnrollment.emergencyName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('relationLabel')}</p>
                    <p className="font-semibold dark:text-white">{viewingEnrollment.emergencyRelation}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('contactNumberLabel')}</p>
                    <p className="font-semibold dark:text-white">{localizeDigits(viewingEnrollment.emergencyContact)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('ageLabel')}</p>
                    <p className="font-semibold dark:text-white">{localizeDigits(viewingEnrollment.emergencyAge)}</p>
                  </div>
                </div>
              </section>

              {/* Health Section */}
              <section>
                <div className="flex items-center gap-3 mb-4 text-amber-500">
                   <ClipboardList className="w-5 h-5" />
                   <h4 className="font-bold uppercase tracking-wider text-xs">{t('additionalInfo')}</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('medicalInfoLabel')}</p>
                    <p className="text-sm dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">{viewingEnrollment.medicalInfo || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('requirementsLabel')}</p>
                    <p className="text-sm dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">{viewingEnrollment.requirements || 'None'}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
