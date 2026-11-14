import { useState, useContext, useEffect, useRef } from 'react';
import { Activity, Heart } from 'lucide-react';
import { getMatchRecommendation, getFitnessSafetyAdvisor } from '../utils/aiMatchmaker';
import { LanguageContext } from '../context/LanguageContext';

export default function AiTestPanel() {
  const { t } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('matches');
  
  // Match Recommendation State
  const [playerProfile, setPlayerProfile] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Fitness Advisor State
  const [matchFormat, setMatchFormat] = useState('Walking Cricket');
  const [physicalConstraints, setPhysicalConstraints] = useState('');
  const [fitnessRoutine, setFitnessRoutine] = useState('');
  const [isLoadingFitness, setIsLoadingFitness] = useState(false);

  const matchFormats = ['Walking Cricket', 'T20', 'Soft-ball Cricket', 'Friendly Match', 'Masters Cricket'];

  const profileRef = useRef(null);
  const physicalRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const { intent, payload } = e.detail || {};
      if (!payload) return;

      // If user is on Match tab or explicitly dictating, write into profile
      if (intent === 'dictate' || intent === 'search') {
        if (activeTab === 'matches') {
          setPlayerProfile((p) => (p ? `${p} ${payload}` : payload));
          if (profileRef.current) {
            profileRef.current.focus();
          }
          return;
        }

        if (activeTab === 'fitness') {
          setPhysicalConstraints((p) => (p ? `${p} ${payload}` : payload));
          if (physicalRef.current) {
            physicalRef.current.focus();
          }
          return;
        }
      }
    };

    window.addEventListener('voice-command', handler);
    return () => window.removeEventListener('voice-command', handler);
  }, [activeTab]);

  const handleFindMatch = async () => {
    if (!playerProfile.trim()) return alert(t('pleaseEnterProfile'));

    setIsLoadingMatch(true);
    setAiRecommendation('');

    const response = await getMatchRecommendation(playerProfile);
    setAiRecommendation(response);
    setIsLoadingMatch(false);
  };

  const handleGenerateFitness = async () => {
    if (!matchFormat.trim()) return alert(t('pleaseSelectMatchFormat'));

    setIsLoadingFitness(true);
    setFitnessRoutine('');

    const response = await getFitnessSafetyAdvisor(matchFormat, physicalConstraints);
    setFitnessRoutine(response);
    setIsLoadingFitness(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-sky-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 rounded-full bg-slate-200/50 dark:bg-slate-800/50 p-1.5 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm transition-all uppercase tracking-wide ${
              activeTab === 'matches'
                ? 'bg-white text-[#1d4ed8] shadow-lg dark:bg-slate-900 dark:text-sky-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            {t('matchFinder')}
          </button>
          <button
            onClick={() => setActiveTab('fitness')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm transition-all uppercase tracking-wide ${
              activeTab === 'fitness'
                ? 'bg-white text-[#1d4ed8] shadow-lg dark:bg-slate-900 dark:text-sky-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            {t('fitnessAdvisor')}
          </button>
        </div>

        {/* Match Recommendations Tab */}
        {activeTab === 'matches' && (
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-300/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0f4f92] via-[#1f6fc1] to-[#4dadeb] p-10 text-white">
              <p className="uppercase tracking-[0.35em] text-sm font-semibold text-sky-100/90">{t('aiMatchRecommendations')}</p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-tight">{t('findSafestCricketMatch')}</h1>
              <p className="mt-4 max-w-2xl text-base sm:text-lg text-sky-100/90">{t('enterBasicProfile')}</p>
            </div>

            <div className="p-8 sm:p-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('yourProfile')}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('useAgeExperience')}</p>
                  </div>

                  <textarea
                    rows="6"
                    ref={profileRef}
                    value={playerProfile}
                    onChange={(e) => setPlayerProfile(e.target.value)}
                    placeholder={t('profilePlaceholder')}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/15"
                  />

                  <button
                    onClick={handleFindMatch}
                    disabled={isLoadingMatch}
                    className="w-full rounded-3xl bg-gradient-to-r from-[#1d4ed8] to-[#22c55e] px-6 py-4 text-base font-semibold text-white shadow-xl shadow-slate-300/40 transition hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoadingMatch ? t('analyzingWithGemini') : t('generateMatchRecommendation')}
                  </button>
                </div>

                <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('whatGeminiEvaluates')}</h2>
                  <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-200">{t('physicalComfort')}</li>
                    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-200">{t('bestSuitedMatch')}</li>
                    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-200">{t('personalizedPacing')}</li>
                  </ul>
                  <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{t('geminiUsesDetails')}</p>
                </div>
              </div>

              {aiRecommendation && (
                <div className="mt-8 rounded-[2rem] border border-[#2563eb]/15 bg-blue-50/80 p-7 shadow-inner dark:border-slate-700 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] font-semibold text-[#1d4ed8]">{t('geminiRecommendation')}</p>
                      <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{t('safeMatchPlanReady')}</h3>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-8 text-slate-700 dark:text-slate-200 whitespace-pre-line">{aiRecommendation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fitness Advisor Tab */}
        {activeTab === 'fitness' && (
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-300/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#D1AB3E] via-[#F5C13D] to-[#FFD15C] p-10 text-slate-950">
              <p className="uppercase tracking-[0.35em] text-sm font-semibold text-slate-800/90">{t('seniorFitnessSafetyAdvisor')}</p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-tight">{t('fiveMinuteSafeRoutines')}</h1>
              <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-900/90">{t('getPersonalizedLowImpact')}</p>
            </div>

            <div className="p-8 sm:p-10">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('step1SelectMatchFormat')}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('chooseTheCricketFormat')}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('matchFormat')}</label>
                    <select
                      value={matchFormat}
                      onChange={(e) => setMatchFormat(e.target.value)}
                      className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition focus:border-[#D1AB3E] focus:ring-4 focus:ring-[#D1AB3E]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-[#D1AB3E] dark:focus:ring-[#D1AB3E]/15"
                    >
                      {matchFormats.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('step2YourPhysicalConditions')}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('describeAnyInjuries')}</p>
                  </div>

                  <textarea
                    rows="5"
                    ref={physicalRef}
                    value={physicalConstraints}
                    onChange={(e) => setPhysicalConstraints(e.target.value)}
                    placeholder={t('physicalConstraintsPlaceholder')}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-[#D1AB3E] focus:ring-4 focus:ring-[#D1AB3E]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-[#D1AB3E] dark:focus:ring-[#D1AB3E]/15"
                  />

                  <button
                    onClick={handleGenerateFitness}
                    disabled={isLoadingFitness}
                    className="w-full rounded-3xl bg-gradient-to-r from-[#D1AB3E] to-[#F5C13D] px-6 py-4 text-base font-semibold text-slate-950 shadow-xl shadow-slate-300/40 transition hover:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoadingFitness ? t('generatingWithGemini') : t('generateRoutine')}
                  </button>
                </div>

                <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('whatYouWillGet')}</h2>
                  <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-200">{t('warmupRoutine')}</li>
                    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-200">{t('cooldownRoutine')}</li>
                    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-200">{t('tailoredToConstraints')}</li>
                    <li className="rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800 text-slate-900 dark:text-slate-200">{t('safetyTipsSpecificToYou')}</li>
                  </ul>
                  <div className="mt-4 rounded-2xl bg-yellow-50/80 border border-yellow-200 p-4 dark:bg-slate-950/40 dark:border-slate-700">
                    <p className="text-xs text-slate-800 dark:text-slate-200">
                      <strong>{t('note')}</strong> {t('consultHealthcare')}
                    </p>
                  </div>
                </div>
              </div>

              {fitnessRoutine && (
                <div className="mt-8 rounded-[2rem] border border-orange-200/50 bg-orange-50/80 p-7 shadow-inner dark:border-slate-700 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] font-semibold text-[#dc2626]">{t('yourSafeRoutine')}</p>
                      <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{t('readyToGetStarted')}</h3>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-8 text-slate-700 dark:text-slate-200 whitespace-pre-line">{fitnessRoutine}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
