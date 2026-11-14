import { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from './LanguageContext';

// Fast Refresh intentionally shares this context object with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export const VoiceAssistantContext = createContext();

export const VoiceAssistantProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastIntent, setLastIntent] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const recognitionActiveRef = useRef(false);
  const { language, t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const locationPathRef = useRef(location.pathname);

  useEffect(() => {
    locationPathRef.current = location.pathname;
  }, [location.pathname]);

  const dispatchVoiceEvent = useCallback((intent, payload = null, transcript = '') => {
    setLastIntent(intent);
    setLastPayload(payload);
    const ev = new CustomEvent('voice-command', { detail: { intent, payload, transcript } });
    window.dispatchEvent(ev);
  }, []);

  const applyDictationToFocusedField = useCallback((text) => {
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      active.value = text;
      active.dispatchEvent(new Event('input', { bubbles: true }));
      active.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    if (active.isContentEditable) {
      active.textContent = text;
      active.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  }, []);

  const processCommand = useCallback((raw) => {
    const txt = (raw || '').toLowerCase().trim();
    const clean = txt.replace(/(please|pls|kindly)/g, '').trim();

    // intent matching across languages
    const enrollPattern = /(book|enroll|enrol|register|signup|नामांकन|बुक|बुकिंग|बुक करो|नोंदणी|नोंदणी करा|बुक करा|बुक करा)/i;
    const searchPattern = /(find|search|show|look for|खोज|शोध|सापड|शोधा|शोध)/i;
    const openPlayPattern = /(open play|go to play|play page|खेलें|खेळा|प्ले पेज|प्ले पेज़|प्ले)/i;
    const openAiPattern = /(open ai|go to ai|ai page|ai recommendations|एआई|एआइ|एआई पेज)/i;
    const openContactPattern = /(contact|support|suggestion|suggest|सपोर्ट|सुझाव|सुझाव दें|संपर्क|contact us|संपर्क करें|संपर्क करा)/i;
    const openHomePattern = /(home|main page|होम|मुख्य पेज|मुख्य पृष्ठ)/i;
    const openLoginPattern = /(login|signup|sign in|log in|लॉगिन|साइन इन|साइन अप|लॉग इन)/i;

    if (enrollPattern.test(clean)) {
      dispatchVoiceEvent('enroll', null, raw);
      if (locationPathRef.current.startsWith('/play')) {
        dispatchVoiceEvent('enroll-on-play', null, raw);
      } else {
        navigate('/play');
        setTimeout(() => dispatchVoiceEvent('enroll', null, raw), 700);
      }
      console.debug('[VoiceAssistant] parsed intent', 'enroll', raw);
      return;
    }

    if (openAiPattern.test(clean)) {
      navigate('/ai-test');
      dispatchVoiceEvent('open', '/ai-test', raw);
      console.debug('[VoiceAssistant] parsed intent', 'open /ai-test', raw);
      return;
    }

    if (openPlayPattern.test(clean)) {
      navigate('/play');
      dispatchVoiceEvent('open', '/play', raw);
      console.debug('[VoiceAssistant] parsed intent', 'open /play', raw);
      return;
    }

    if (openContactPattern.test(clean)) {
      navigate('/contact');
      dispatchVoiceEvent('open', '/contact', raw);
      console.debug('[VoiceAssistant] parsed intent', 'open /contact', raw);
      return;
    }

    if (openHomePattern.test(clean)) {
      navigate('/');
      dispatchVoiceEvent('open', '/', raw);
      console.debug('[VoiceAssistant] parsed intent', 'open /', raw);
      return;
    }

    if (openLoginPattern.test(clean)) {
      navigate('/login');
      dispatchVoiceEvent('open', '/login', raw);
      console.debug('[VoiceAssistant] parsed intent', 'open /login', raw);
      return;
    }

    const typeMatch = clean.match(/(?:^|\s)(?:write|type|enter|fill|put|search for|search|write down|type in|fill in)\s*(.*)$/i);
    if (typeMatch) {
      const typed = typeMatch[1].trim();
      if (typed) {
        const wrote = typed.replace(/^(this|that|the following|the text)\s+/i, '').trim() || typed;
        const applied = applyDictationToFocusedField(wrote);
        dispatchVoiceEvent('dictate', wrote, raw);
        if (applied) {
          console.debug('[VoiceAssistant] applied dictate to focused field', wrote, raw);
          return;
        }
        if (locationPathRef.current.startsWith('/play')) {
          dispatchVoiceEvent('search', wrote, raw);
          console.debug('[VoiceAssistant] parsed intent', 'search (from dictate)', wrote, raw);
          return;
        }
        navigate('/play');
        setTimeout(() => dispatchVoiceEvent('search', wrote, raw), 700);
        console.debug('[VoiceAssistant] parsed intent', 'dictate fallback search', wrote, raw);
        return;
      }
      const fallbackText = clean.replace(/^(?:write|type|enter|fill|put|search for|search|write down|type in|fill in)\b\s*/i, '').trim();
      if (fallbackText) {
        const wrote = fallbackText.replace(/^(this|that|the following|the text)\s+/i, '').trim() || fallbackText;
        const applied = applyDictationToFocusedField(wrote);
        dispatchVoiceEvent('dictate', wrote, raw);
        if (applied) {
          console.debug('[VoiceAssistant] applied dictate fallback to focused field', wrote, raw);
          return;
        }
        if (locationPathRef.current.startsWith('/play')) {
          dispatchVoiceEvent('search', wrote, raw);
          console.debug('[VoiceAssistant] parsed intent', 'search fallback (from dictate)', wrote, raw);
          return;
        }
        navigate('/play');
        setTimeout(() => dispatchVoiceEvent('search', wrote, raw), 700);
        console.debug('[VoiceAssistant] parsed intent', 'dictate fallback search', wrote, raw);
        return;
      }
    }

    if (searchPattern.test(clean)) {
      const q = clean.replace(/(find|search|show|look for|for|for me|for the|खोज|शोध|सापड|के लिए|साठी|का|ची|ना|मे|match|matches|मैच|मॅच)/g, '').trim();
      const query = q || txt;
      dispatchVoiceEvent('search', query, raw);
      if (!locationPathRef.current.startsWith('/play')) {
        navigate('/play');
        setTimeout(() => dispatchVoiceEvent('search', query, raw), 800);
      }
      console.debug('[VoiceAssistant] parsed intent', 'search', query, raw);
      return;
    }

    // fallback: treat anything as search
    dispatchVoiceEvent('search', clean || txt, raw);
    if (!locationPathRef.current.startsWith('/play')) {
      navigate('/play');
      setTimeout(() => dispatchVoiceEvent('search', clean || txt, raw), 800);
    }
    console.debug('[VoiceAssistant] parsed intent', 'fallback search', clean || txt, raw);
  }, [dispatchVoiceEvent, applyDictationToFocusedField, navigate]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setLastTranscript(transcript);
      console.debug('[VoiceAssistant] result:', transcript);
      processCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('[VoiceAssistant] recognition error', event);
      recognitionActiveRef.current = false;
      if (event.error === 'no-speech') {
        setError(t('voiceNoSpeech'));
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(t('voicePermissionDenied'));
      } else {
        setError(t('voiceError'));
      }
      setIsListening(false);
    };

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
      console.debug('[VoiceAssistant] recognition started');
      setError(null);
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      console.debug('[VoiceAssistant] recognition ended');
      setIsListening(false);
    };

    return () => {
      if (recognitionActiveRef.current) {
        try {
          recognition.stop();
        } catch (stopError) {
          console.error('[VoiceAssistant] recognition cleanup failed', stopError);
        }
      }
      recognitionActiveRef.current = false;
      setIsListening(false);
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onstart = null;
      recognition.onend = null;
      if (recognitionRef.current === recognition) recognitionRef.current = null;
    };
  }, [language, processCommand, t]);

  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError(t('voiceNotSupported'));
      return;
    }

    try {
      recognition.start();
      recognitionActiveRef.current = true;
      setIsListening(true);
      setError(null);
    } catch (startError) {
      recognitionActiveRef.current = false;
      console.error('[VoiceAssistant] start failed', startError);
      setError(t('voiceError'));
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setIsListening(false);
      return;
    }

    try {
      recognition.stop();
      recognitionActiveRef.current = false;
      setIsListening(false);
    } catch (stopError) {
      console.error('[VoiceAssistant] stop failed', stopError);
      setError(t('voiceError'));
    }
  };

  return (
    <VoiceAssistantContext.Provider value={{ isListening, lastTranscript, lastIntent, lastPayload, error, startListening, stopListening }}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};
