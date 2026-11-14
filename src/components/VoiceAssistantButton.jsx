import React, { useContext } from 'react';
import { VoiceAssistantContext } from '../context/VoiceAssistantContext';
import { LanguageContext } from '../context/LanguageContext';
import { Mic } from 'lucide-react';

export default function VoiceAssistantButton(){
  const { isListening, startListening, stopListening, lastTranscript, lastIntent, lastPayload, error } = useContext(VoiceAssistantContext);
  const { t } = useContext(LanguageContext);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-[220px] text-left">
      <button
        onClick={() => isListening ? stopListening() : startListening()}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform ${isListening ? 'bg-red-500 text-white scale-105' : 'bg-[#004BA0] text-white hover:scale-105'}`}>
        <Mic className="w-6 h-6" />
      </button>
      <div className="mt-2 rounded-3xl bg-white/90 dark:bg-slate-900/90 px-3 py-2 shadow-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-[11px] leading-5">
        <div className="font-semibold">{isListening ? (t('listening') || 'Listening') : (t('startVoiceHelp') || 'Start voice help')}</div>
        {lastTranscript && <div className="mt-1 text-slate-600 dark:text-slate-400">"{lastTranscript}"</div>}
        {lastIntent && <div className="mt-1 text-slate-700 dark:text-slate-300">Intent: {lastIntent}</div>}
        {error && (
          <div className="mt-1 text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
