import { useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { CalendarDays, MapPin, Clock, Trophy, Users, Mic, Brain } from 'lucide-react';
import Footer from '../components/Footer';
import { filterMatches, normalizeVoiceSearchCommand } from '../utils/matchSearch';

const PlayPage = () => {
  const { matches, enrollments, currentUser } = useContext(AppContext);
  const { t, localizeDigits, language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const filteredMatches = useMemo(() => filterMatches(matches, searchQuery), [matches, searchQuery]);

  const handleEnrollClick = (matchId) => {
    navigate(`/enroll/${matchId}`);
  };

  const handleVoiceSearch = useCallback((transcript) => {
    const query = normalizeVoiceSearchCommand(transcript);
    if (query) {
      setSearchQuery(query);
      setSpeechError('');
    } else {
      setSpeechError('Please say a match type, location or format to search.');
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      handleVoiceSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      recognitionActiveRef.current = false;
      setSpeechError('Voice recognition failed. Please try again.');
      setIsListening(false);
    };

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      if (recognitionActiveRef.current) {
        try {
          recognition.stop();
        } catch (stopError) {
          console.error('Match search voice recognition cleanup failed', stopError);
        }
      }
      recognitionActiveRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onstart = null;
      recognition.onend = null;
    };
  }, [language, handleVoiceSearch]);

  // Global voice-command event listener
  useEffect(() => {
    const handler = (e) => {
      const { intent, payload } = e.detail || {};
      if (intent === 'search') {
        if (payload) setSearchQuery(payload);
      }
      if (intent === 'dictate') {
        if (payload) setSearchQuery(payload);
      }
      if (intent === 'enroll' || intent === 'enroll-on-play') {
        const voiceMatches = payload ? filterMatches(matches, payload) : filteredMatches;
        if (voiceMatches.length > 0) {
          navigate(`/enroll/${voiceMatches[0].id}`);
        } else {
          if (payload) setSearchQuery(payload);
          setSpeechError(t('voiceHelpHint'));
        }
      }
    };

    window.addEventListener('voice-command', handler);
    return () => window.removeEventListener('voice-command', handler);
  }, [filteredMatches, matches, navigate, t]);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      setSpeechError('Voice commands are not supported in this browser.');
      return;
    }
    setSpeechError('');
    try {
      if (isListening) {
        recognitionRef.current.stop();
        recognitionActiveRef.current = false;
      } else {
        recognitionRef.current.start();
        recognitionActiveRef.current = true;
      }
      setIsListening(!isListening);
    } catch (recognitionError) {
      recognitionActiveRef.current = false;
      console.error('Match search voice recognition failed', recognitionError);
      setSpeechError('Voice recognition failed. Please try again.');
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50 dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] pt-24 pb-12 font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#004BA0] dark:text-blue-400 tracking-tight flex justify-center items-center gap-4">
            <Trophy className="w-10 h-10 text-[#D1AB3E]" /> {t('upcomingMatches')} <Trophy className="w-10 h-10 text-[#D1AB3E]" />
          </h1>
          <div className="w-24 h-1.5 bg-[#D1AB3E] mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="mb-10 max-w-4xl mx-auto bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Search matches by voice or keyword</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Use English, हिंदी, or मराठी to find suitable matches quickly.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleVoiceToggle}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-3xl text-sm font-semibold transition ${isListening ? 'bg-[#004BA0] text-white' : 'bg-[#D1AB3E] text-slate-950 hover:bg-[#b5911c]'}`}
              >
                <Mic className="w-4 h-4" />
                {isListening ? t('listening') : t('startVoiceHelp')}
              </button>
              <Link
                to="/ai-test"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-3xl text-sm font-semibold bg-gradient-to-r from-[#1d4ed8] to-[#22c55e] text-white hover:shadow-lg transition"
              >
                <Brain className="w-4 h-4" />
                AI Recommendations
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by format, place, or match type..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 shadow-sm outline-none transition focus:border-[#004BA0] focus:ring-4 focus:ring-[#004BA0]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setVoiceTranscript('');
                setSpeechError('');
              }}
              className="rounded-3xl bg-slate-900 text-white px-5 py-3 font-semibold hover:bg-slate-800 transition"
            >
              Clear
            </button>
          </div>
          {voiceTranscript && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Heard: "{voiceTranscript}"</p>}
          {speechError && <p className="mt-3 text-sm text-red-500">{speechError}</p>}
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center shadow-xl">
            <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t('noMatches')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium italic mt-3">check back soon ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map(m => (
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

                  {/* Enrolled Players List for Users */}
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest flex items-center gap-2">
                       <Users className="w-3 h-3 text-[#D1AB3E]" /> {t('enrolledPlayers')}
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto">
                      {enrollments.filter(e => e.matchId === m.id).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No players yet. Be the first!</p>
                      ) : (
                        enrollments.filter(e => e.matchId === m.id).map(e => (
                          <span key={e.id} className="px-2 py-1 bg-white dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded-md shadow-sm border border-slate-100 dark:border-slate-600">
                            {e.playerName}
                          </span>
                        ))
                      )}
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
