import { useContext, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';

const NotificationsMenu = () => {
  const { notifications, dismissNotification } = useContext(AppContext);
  const { language, t } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const locale = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

  const dismiss = async (notificationId) => {
    try {
      setError('');
      await dismissNotification(notificationId);
    } catch (dismissError) {
      setError(dismissError.message);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`${t('notifications')} (${notifications.length})`}
        aria-expanded={isOpen}
        className="relative flex items-center gap-2 rounded-full p-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:text-[#D1AB3E]"
      >
        <Bell className="h-5 w-5" />
        <span className="md:hidden">{t('notifications')}</span>
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <section
          aria-label={t('notifications')}
          className="absolute right-0 top-full z-[60] mt-3 max-h-[min(70vh,32rem)] w-[min(90vw,24rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
            <h2 className="font-bold">{t('notifications')}</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('close')}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {error && <p role="alert" className="mb-2 text-sm text-red-600">{error}</p>}
          {notifications.length === 0 ? (
            <p className="py-5 text-center text-sm text-slate-500">{t('noNotifications')}</p>
          ) : (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{notification.title}</p>
                      <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                        {notification.message}
                      </p>
                      <time
                        dateTime={notification.createdAt}
                        className="mt-2 block text-xs text-slate-500"
                      >
                        {new Date(notification.createdAt).toLocaleString(locale)}
                      </time>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismiss(notification.id)}
                      aria-label={t('dismissNotification')}
                      title={t('dismissNotification')}
                      className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default NotificationsMenu;
