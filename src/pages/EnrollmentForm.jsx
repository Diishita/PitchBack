import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { ChevronLeft, Save, Moon, Sun } from 'lucide-react';

const EnrollmentForm = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { matches, currentUser, addEnrollment, theme, toggleTheme } = useContext(AppContext);
  const { t, localizeDigits } = useContext(LanguageContext);

  const match = matches.find(m => m.id === matchId);

  const [formData, setFormData] = useState({
    playerName: currentUser?.username || '',
    contactNumber: currentUser?.contactNumber || '',
    dob: '',
    emergencyName: '',
    emergencyDob: '',
    emergencyRelation: '',
    emergencyContact: '',
    medicalInfo: '',
    requirements: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addEnrollment({
      matchId,
      userId: currentUser.id,
      ...formData
    });
    navigate('/dashboard');
  };

  if (!match) {
    return <div className="text-center mt-20 text-slate-500">{t('matchNotFound')}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-4 pt-24 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto relative">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> {t('backToDashboard')}
          </button>
          
          <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-500 rounded-lg transition-colors shadow-sm">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

          <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('matchEnrollment')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
              {t('enrollingFor')} <strong className="text-emerald-600 dark:text-emerald-400">{match.title}</strong> on {localizeDigits(match.date)} @ {match.place}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">{localizeDigits(1)}</span>
                {t('playerDetails')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('playerNameLabel')}</label>
                  <input required type="text" name="playerName" value={formData.playerName} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('contactNumberLabel')}</label>
                  <input required type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('dobLabel')}</label>
                  <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-xs">{localizeDigits(2)}</span>
                {t('emergencyInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('fullNameLabel')}</label>
                  <input required type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('dobLabel')}</label>
                  <input type="date" name="emergencyDob" value={formData.emergencyDob} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('relationLabel')}</label>
                  <input required type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('contactNumberLabel')}</label>
                  <input required type="tel" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">{localizeDigits(3)}</span>
                {t('additionalInfo')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('medicalInfoLabel')}</label>
                  <textarea name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} rows="2" placeholder={t('medicalPlaceholder')} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{t('requirementsLabel')}</label>
                  <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="2" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-800 dark:text-slate-200 text-sm"></textarea>
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-md flex items-center gap-2 transition-colors">
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

