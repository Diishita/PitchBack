import React, { useContext } from 'react';
import { CircleDot, MapPin, Phone, Mail } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

const Footer = () => {
  const { t, localizeDigits } = useContext(LanguageContext);
  
  return (
    <footer style={{ backgroundColor: '#003673' }} className="py-12 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">

          {/* Brand */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D1AB3E] to-yellow-300 flex items-center justify-center shadow-lg">
                <CircleDot className="w-6 h-6 text-[#003673]" />
              </div>
              <span className="font-bold text-2xl tracking-tight">PitchBack</span>
            </div>
            <p className="text-white/70 text-sm font-light italic whitespace-pre-line">
              {t('heroSlogan').replace('\n', ' ')}
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2 text-sm text-white/80">
            <p className="font-semibold text-white uppercase tracking-wider text-xs mb-3">{t('ourAddress')}</p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#D1AB3E]" />
              <span className="whitespace-pre-line">{localizeDigits(t('addressDetail'))}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 flex-shrink-0 text-[#D1AB3E]" />
              {localizeDigits(t('contactPhone'))}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0 text-[#D1AB3E]" />
              {t('contactEmail')}
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right text-sm text-white/60">
            <p>© {localizeDigits(new Date().getFullYear())} PitchBack.</p>
            <p className="mt-1">{t('allRightsReserved')}</p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

