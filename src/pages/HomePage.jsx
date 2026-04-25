import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { HeartPulse, Users, Brain, ChevronRight, Activity, Smile } from 'lucide-react';
import Footer from '../components/Footer';

const HomePage = () => {
  const { t, localizeDigits } = useContext(LanguageContext);

  const benefits = [
    { icon: <HeartPulse className="w-8 h-8" />, title: t('benefit1Title'), desc: t('benefit1Desc') },
    { icon: <Users className="w-8 h-8" />, title: t('benefit2Title'), desc: t('benefit2Desc') },
    { icon: <Brain className="w-8 h-8" />, title: t('benefit3Title'), desc: t('benefit3Desc') },
    { icon: <Smile className="w-8 h-8" />, title: t('benefit4Title'), desc: t('benefit4Desc') },
    { icon: <Activity className="w-8 h-8" />, title: t('benefit5Title'), desc: t('benefit5Desc') }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50 dark:bg-gradient-to-br dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] font-sans selection:bg-[#D1AB3E] selection:text-[#004BA0]">
      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] hover:scale-110"
          style={{ backgroundImage: `url('/hero-bg.png')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-transparent to-yellow-400/40 mix-blend-color-dodge"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#004BA0]/50 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start mt-16">

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight max-w-5xl drop-shadow-2xl whitespace-pre-line">
            {t('heroSlogan')}
          </h1>

          <p className="mt-8 text-xl md:text-2xl text-slate-200 max-w-2xl font-medium drop-shadow-md leading-relaxed">
            {t('heroSubtext')}
          </p>

          <div className="mt-12 flex gap-5">
            <Link to="/play" className="px-8 py-4 bg-gradient-to-r from-[#D1AB3E] to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-[#004BA0] font-bold rounded-full shadow-xl shadow-[#D1AB3E]/20 transition-all transform hover:-translate-y-1 flex items-center gap-2 text-lg uppercase tracking-wide">
              {t('exploreMatches')} <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-70">
          <span className="text-white text-xs font-bold uppercase tracking-widest mb-2">{t('scroll')}</span>
          <div className="w-0.5 h-10 bg-gradient-to-b from-[#D1AB3E] to-transparent"></div>
        </div>
      </section>

      {/* Benefits Section - Creative Professional Layout */}
      <section className="py-32 bg-gradient-to-b from-sky-50 via-blue-50/50 to-white dark:bg-none dark:bg-gradient-to-b dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-24 relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold text-[#004BA0] dark:text-blue-300 tracking-tight">
              {t('benefitsTitle')}
            </h2>
            <div className="w-32 h-1.5 bg-[#D1AB3E] mx-auto mt-8 rounded-full"></div>
          </div>

          <div className="relative z-10 space-y-24">
            {benefits.map((b, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 md:gap-20 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#004BA0]/10 dark:bg-blue-500/10 rounded-full blur-3xl transform scale-150"></div>
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-white dark:bg-[#002a5e]/80 shadow-2xl flex items-center justify-center text-[#D1AB3E] relative z-10 border border-slate-100 dark:border-blue-900/50 rotate-3 hover:rotate-0 transition-transform duration-500">
                      {React.cloneElement(b.icon, { className: "w-16 h-16 md:w-20 md:h-20" })}
                    </div>
                  </div>
                </div>
                <div className={`flex-1 text-center ${idx % 2 !== 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <span className="text-[#D1AB3E] font-bold text-6xl opacity-20 mb-2 block">{localizeDigits(`0${idx + 1}`)}</span>
                  <h3 className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-blue-100 mb-6 tracking-normal">{b.title}</h3>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-blue-200/70 leading-relaxed font-normal">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
