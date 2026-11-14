import { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// Fast Refresh intentionally shares this context object with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('cricket_users');
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', contactNumber: '0000000000', city: 'All', role: 'admin' }
    ];
  });

  const [matches, setMatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cricket_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cricket_theme');
    return saved || 'light';
  });

  const [recentLogins, setRecentLogins] = useState(() => {
    const saved = localStorage.getItem('cricket_recentLogins');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      try {
        const [loadedMatches, loadedEnrollments] = await Promise.all([
          api.matches.list({ signal: controller.signal }),
          api.enrollments.list({ signal: controller.signal }),
        ]);
        setMatches(loadedMatches);
        setEnrollments(loadedEnrollments);
        setDataError('');
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('[App] Could not load application data', error);
          setDataError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) setDataLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cricket_theme', theme);
  }, [theme]);

  useEffect(() => localStorage.setItem('cricket_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('cricket_recentLogins', JSON.stringify(recentLogins)), [recentLogins]);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cricket_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cricket_currentUser');
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addRecentLogin = (user) => {
    if (user.role === 'admin') return;
    const filtered = recentLogins.filter(r => r.username !== user.username);
    setRecentLogins([{ username: user.username, contactNumber: user.contactNumber, city: user.city }, ...filtered].slice(0, 3));
  };

  const removeRecentLogin = (username) => {
    setRecentLogins(recentLogins.filter(r => r.username !== username));
  };

  const loginUser = (username, contactNumber, city) => {
    if (username.toLowerCase() === 'admin@admin.com') {
      const adminUser = users.find(u => u.role === 'admin');
      setCurrentUser(adminUser);
      return adminUser;
    }

    let existingUser = users.find(u => u.username === username && u.contactNumber === contactNumber);
    if (!existingUser) {
      existingUser = {
        id: Date.now().toString(),
        username,
        contactNumber,
        city,
        role: 'user',
        isBlocked: false,
        createdAt: new Date().toISOString()
      };
      setUsers([...users, existingUser]);
    }

    if (existingUser.isBlocked) {
      alert('Your account has been blocked by the administrator.');
      return null;
    }

    addRecentLogin(existingUser);
    setCurrentUser(existingUser);
    return existingUser;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const addMatch = async (match) => {
    const newMatch = await api.matches.create(match);
    setMatches(currentMatches => [...currentMatches, newMatch]);
    setDataError('');
    return newMatch;
  };

  const updateMatch = async (matchId, updatedMatch) => {
    const savedMatch = await api.matches.update(matchId, updatedMatch);
    setMatches(currentMatches => currentMatches.map(match => (
      match.id === matchId ? savedMatch : match
    )));
    setDataError('');
    return savedMatch;
  };

  const addEnrollment = async (enrollment) => {
    const newEnrollment = await api.enrollments.create(enrollment);
    setEnrollments(currentEnrollments => [newEnrollment, ...currentEnrollments]);
    setDataError('');
    return newEnrollment;
  };

  const deleteUser = async (userId) => {
    await api.enrollments.removeForUser(userId);
    setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
    setEnrollments(currentEnrollments => currentEnrollments.filter(enrollment => enrollment.userId !== userId));
  };

  const deleteMatch = async (matchId) => {
    await api.matches.remove(matchId);
    setMatches(currentMatches => currentMatches.filter(match => match.id !== matchId));
    setEnrollments(currentEnrollments => currentEnrollments.filter(enrollment => enrollment.matchId !== matchId));
  };

  const toggleBlockUser = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
    ));
  };

  return (
    <AppContext.Provider value={{
      users, matches, enrollments, currentUser, theme, recentLogins, dataLoading, dataError,
      loginUser, logoutUser, addMatch, deleteMatch, updateMatch, addEnrollment, deleteUser,
      toggleBlockUser, toggleTheme, removeRecentLogin
    }}>
      {children}
    </AppContext.Provider>
  );
};
