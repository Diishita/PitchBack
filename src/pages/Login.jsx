import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { ArrowRight, MapPin, Phone, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [city, setCity] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);

  const { loginUser, registerUser, currentUser } = useContext(AppContext);
  const { t, language } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const parseVoiceCommand = useCallback((transcript) => {
    const normalized = transcript.toLowerCase();
    const usernameMatch = normalized.match(/(name is|naam hai|माझं नाव|माझं नाव आहे|mi naav)\s+([\w\s]+)/i);
    const cityMatch = normalized.match(/(city|sheher|शहर|नगर|city is|city name is|city ka naam|शहर|नगर)\s*[: ]*([\w\s]+)/i);
    const phoneMatch = normalized.match(/(phone|number|mobile|मोबाइल|नंबर|फोन)\s*[: ]*([0-9]+)/i);

    if (usernameMatch) setUsername(usernameMatch[2].trim());
    if (cityMatch) setCity(cityMatch[2].trim());
    if (phoneMatch) setContactNumber(phoneMatch[2].trim());
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
      parseVoiceCommand(transcript);
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
        } catch (error) {
          console.error('Login voice recognition cleanup failed', error);
        }
      }
      recognitionActiveRef.current = false;
      recognitionRef.current = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onstart = null;
      recognition.onend = null;
    };
  }, [language, parseVoiceCommand]);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      setSpeechError('Voice commands are not supported in this browser.');
      return;
    }
    setSpeechError('');
    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      setIsListening(!isListening);
    } catch (error) {
      recognitionActiveRef.current = false;
      console.error('Login voice recognition failed', error);
      setSpeechError('Voice recognition failed. Please try again.');
      setIsListening(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const user = isRegistering
        ? await registerUser({ username, email, password, contactNumber, city })
        : await loginUser({ email, password });
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setFormError('');
    setIsRegistering((registering) => !registering);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans relative">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#004BA0]/10 blur-3xl" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#D1AB3E]/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#004BA0] to-[#0060CD] rounded-2xl flex items-center justify-center shadow-lg shadow-[#004BA0]/30 mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#003673] dark:text-white tracking-tight">
            {isRegistering ? t('authCreateAccount') : t('authSignIn')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">{t('portalSubtext')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {formError}
            </p>
          )}

          {isRegistering && (
            <>
              <div>
                <label htmlFor="auth-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  {t('authFullName')}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#004BA0]" />
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="auth-contact" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                    {t('contactNumberLabel')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#004BA0]" />
                    <input
                      id="auth-contact"
                      type="tel"
                      autoComplete="tel"
                      required
                      minLength={6}
                      maxLength={25}
                      value={contactNumber}
                      onChange={(event) => setContactNumber(event.target.value)}
                      className="w-full pl-11 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="auth-city" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                    {t('cityLabel')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#004BA0]" />
                    <input
                      id="auth-city"
                      type="text"
                      autoComplete="address-level2"
                      required
                      minLength={2}
                      maxLength={100}
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="w-full pl-11 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleVoiceToggle}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#004BA0] to-[#0060CD] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2"
              >
                {isListening ? 'Listening...' : 'Fill details by voice'}
              </button>
              {speechError && <p role="alert" className="text-sm text-red-500">{speechError}</p>}
              {voiceTranscript && <p className="text-sm text-slate-500">{`Heard: "${voiceTranscript}"`}</p>}
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              {t('emailUsername')}
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white text-sm"
              placeholder={t('enterCredentials')}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              {t('authPassword')}
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
              minLength={isRegistering ? 12 : undefined}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white text-sm"
            />
            {isRegistering && <p className="text-xs text-slate-500 mt-1">{t('authPasswordHint')}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-4 bg-gradient-to-r from-[#003673] to-[#002244] hover:from-[#002244] hover:to-[#001122] disabled:opacity-60 text-[#D1AB3E] text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isSubmitting ? t('authWorking') : isRegistering ? t('authCreateAccount') : t('authSignIn')}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="w-full mt-5 text-sm font-semibold text-[#004BA0] dark:text-blue-300 hover:underline"
        >
          {isRegistering ? t('authHaveAccount') : t('authNeedAccount')}
        </button>
      </div>
    </div>
  );
};

export default Login;
