import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { AppContext } from '../context/AppContext';
import { Globe, User, LogOut, Menu, X, CircleDot, Sun, Moon } from 'lucide-react';
import NotificationsMenu from './NotificationsMenu';

const Navbar = () => {
  const { language, changeLanguage, t } = useContext(LanguageContext);
  const { currentUser, logoutUser, theme, toggleTheme } = useContext(AppContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const navBg = scrolled || !isHome
    ? 'shadow-lg backdrop-blur-sm'
    : 'bg-transparent';
  const navStyle = (scrolled || !isHome) ? { backgroundColor: '#003673' } : {};
  const textColor = 'text-white';

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/play', label: t('play') },
    { to: '/ai-test', label: t('ai') },
    { to: '/contact', label: t('contact') },
  ];

  return (
    <nav style={navStyle} className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navBg} ${textColor}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D1AB3E] to-yellow-300 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform rotate-3">
            <CircleDot className="w-6 h-6 text-[#004BA0]" />
          </div>
          <span className="font-bold text-2xl tracking-tight hidden sm:block text-white">{t('pitchback')}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="font-semibold text-sm hover:text-[#D1AB3E] transition-colors uppercase tracking-wider">
              {label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-5">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 font-medium text-sm hover:text-[#D1AB3E] transition-colors cursor-pointer">
              <Globe className="w-4 h-4" /> {language === 'en' ? t('english') : language === 'hi' ? t('hindi') : t('marathi')}
            </button>
            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
              <button onClick={() => changeLanguage('en')} className="px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 font-medium cursor-pointer">{t('english')}</button>
              <button onClick={() => changeLanguage('hi')} className="px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 font-medium cursor-pointer">{t('hindi')}</button>
              <button onClick={() => changeLanguage('mr')} className="px-4 py-2 text-left text-sm text-slate-800 hover:bg-slate-100 font-medium cursor-pointer">{t('marathi')}</button>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 hover:scale-110 cursor-pointer"
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4 text-[#D1AB3E]" />
              : <Moon className="w-4 h-4 text-white" />}
          </button>

          <div className="h-6 w-px bg-white/20"></div>

          {/* Auth */}
          {currentUser ? (
            <div className="flex items-center gap-5">
              <NotificationsMenu />
              <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-sm font-bold text-[#D1AB3E] hover:text-yellow-300 transition-colors">
                <User className="w-4 h-4" /> {t('dashboard')}
              </Link>
              <button onClick={logoutUser} className="flex items-center gap-2 text-sm font-bold text-white hover:text-red-400 transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" /> {t('logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-[#D1AB3E] to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-[#003673] font-bold text-sm rounded-full shadow-lg shadow-[#D1AB3E]/20 transition-transform transform hover:-translate-y-0.5 uppercase tracking-widest">
              {t('loginSignup')}
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full border-t border-white/10 shadow-xl" style={{ backgroundColor: '#003673' }}>
          <div className="flex flex-col p-4 space-y-4">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="font-semibold text-sm hover:text-[#D1AB3E] transition-colors uppercase tracking-wider">
                {label}
              </Link>
            ))}
            <div className="h-px bg-white/10 w-full"></div>
            <div className="flex items-center gap-4">
              <button onClick={() => changeLanguage('en')} className={`text-sm font-bold cursor-pointer ${language === 'en' ? 'text-[#D1AB3E]' : 'text-white'}`}>EN</button>
              <button onClick={() => changeLanguage('hi')} className={`text-sm font-bold cursor-pointer ${language === 'hi' ? 'text-[#D1AB3E]' : 'text-white'}`}>HI</button>
              <button onClick={() => changeLanguage('mr')} className={`text-sm font-bold cursor-pointer ${language === 'mr' ? 'text-[#D1AB3E]' : 'text-white'}`}>MR</button>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D1AB3E]" /> : <Moon className="w-4 h-4 text-white" />}
              </button>
            </div>
            {currentUser ? (
              <>
                <NotificationsMenu />
                <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} className="text-left font-semibold text-sm text-[#D1AB3E] uppercase tracking-wider">
                  <User className="mr-2 inline h-4 w-4" /> {t('dashboard')}
                </Link>
                <button onClick={logoutUser} className="text-left font-semibold text-sm text-red-400 uppercase tracking-wider flex items-center gap-2 cursor-pointer">
                  <LogOut className="w-4 h-4" /> {t('logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="font-semibold text-sm text-[#D1AB3E] uppercase tracking-wider">{t('loginSignup')}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
