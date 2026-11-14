import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { ChevronLeft, Save, Moon, Sun } from 'lucide-react';

const EnrollmentForm = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { matches, currentUser, addEnrollment, theme, toggleTheme } = useContext(AppContext);
  const { t, localizeDigits } = useContext(LanguageContext);
  const [submitError, setSubmitError] = useState('');

  const match = matches.find(m => m.id === matchId);

  const [formData, setFormData] = useState({
    playerName: currentUser?.username || '',
    contactNumber: currentUser?.contactNumber || '',
    dob: '',
    emergencyName: '',
    emergencyAge: '',
    emergencyRelation: '',
    emergencyContact: '',
    medicalInfo: '',
    requirements: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await addEnrollment({
        matchId,
        userId: currentUser.id,
        ...formData
      });
      navigate('/dashboard');
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  if (!match) {
    return <div className="text-center mt-20 text-slate-500">{t('matchNotFound')}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-4 pt-24 md:p-8 font-sans">
      <button 
        onClick={() => navigate(-1)} 
        className="fixed left-4 md:left-8 top-24 z-[60] w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-[#D1AB3E] transition-all hover:scale-110 active:scale-95 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <div className="max-w-3xl mx-auto relative">
        {/* Header Controls */}
        <div className="flex justify-end items-center mb-6">
          <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-[#D1AB3E] rounded-lg transition-colors shadow-sm">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#D1AB3E]"></div>

          <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('matchEnrollment')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              {t('enrollingFor')} <strong className="text-[#D1AB3E] dark:text-amber-400">{match.title}</strong> on {localizeDigits(match.date)} @ {match.place}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {submitError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {submitError}
              </p>
            )}
            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 text-[#004BA0] dark:text-blue-400 flex items-center justify-center text-xs font-bold">{localizeDigits(1)}</span>
                {t('playerDetails')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('playerNameLabel')}</label>
                  <input required type="text" name="playerName" value={formData.playerName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('contactNumberLabel')}</label>
                  <input required type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('dobLabel')}</label>
                  <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('addressLabel')}</label>
                  <textarea required name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all"></textarea>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold">{localizeDigits(2)}</span>
                {t('emergencyInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('fullNameLabel')}</label>
                  <input required type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('ageLabel')}</label>
                  <input required type="number" name="emergencyAge" value={formData.emergencyAge} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('relationLabel')}</label>
                  <input required type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('contactNumberLabel')}</label>
                  <input required type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">{localizeDigits(3)}</span>
                {t('additionalInfo')}
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('medicalInfoLabel')}</label>
                  <textarea name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} rows="2" placeholder={t('medicalPlaceholder')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{t('requirementsLabel')}</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="2" placeholder={t('requirementsPlaceholder')} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none text-slate-900 dark:text-white text-sm font-medium transition-all"></textarea>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="submit" className="px-8 py-3.5 bg-[#D1AB3E] hover:bg-amber-500 text-[#003673] text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest">
                <Save className="w-4 h-4" /> {t('completeEnrollment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;

