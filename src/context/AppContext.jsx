import { createContext, useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

const fetchAppData = async () => {
  const [user, matches] = await Promise.all([
    api.auth.me(),
    api.matches.list(),
  ]);
  const [enrollments, users] = user
    ? await Promise.all([
      api.enrollments.list(),
      user.role === 'admin' ? api.users.list() : Promise.resolve([]),
    ])
    : [[], []];

  return { user, matches, enrollments, users };
};

// Fast Refresh intentionally shares this context object with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('cricket_theme') || 'light');

  const loadData = useCallback(async () => {
    try {
      const { user, matches, enrollments, users: loadedUsers } = await fetchAppData();
      setCurrentUser(user);
      setMatches(matches);
      setEnrollments(enrollments);
      setUsers(loadedUsers);
      setDataError('');
    } catch (error) {
      console.error('[App] Could not load application data', error);
      setDataError(error.message);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem('cricket_currentUser');
    localStorage.removeItem('cricket_users');
    let active = true;
    const initialize = async () => {
      try {
        const { user, matches: loadedMatches, enrollments: loadedEnrollments, users: loadedUsers } = await fetchAppData();
        if (!active) return;
        setCurrentUser(user);
        setMatches(loadedMatches);
        setEnrollments(loadedEnrollments);
        setUsers(loadedUsers);
        setDataError('');
      } catch (error) {
        if (active) {
          console.error('[App] Could not load application data', error);
          setDataError(error.message);
        }
      } finally {
        if (active) setDataLoading(false);
      }
    };
    initialize();
    return () => {
      active = false;
    };
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

  const toggleTheme = () => {
    setTheme((previousTheme) => previousTheme === 'dark' ? 'light' : 'dark');
  };

  const loginUser = async (credentials) => {
    const user = await api.auth.login(credentials);
    setCurrentUser(user);
    await loadData();
    setDataError('');
    return user;
  };

  const registerUser = async (details) => {
    const user = await api.auth.register(details);
    setCurrentUser(user);
    await loadData();
    setDataError('');
    return user;
  };

  const logoutUser = async () => {
    try {
      await api.auth.logout();
      setCurrentUser(null);
      setUsers([]);
      setEnrollments([]);
      setDataError('');
      return true;
    } catch (error) {
      setDataError(error.message);
      return false;
    }
  };

  const addMatch = async (match) => {
    const newMatch = await api.matches.create(match);
    setMatches((currentMatches) => [...currentMatches, newMatch]);
    setDataError('');
    return newMatch;
  };

  const updateMatch = async (matchId, updatedMatch) => {
    const savedMatch = await api.matches.update(matchId, updatedMatch);
    setMatches((currentMatches) => currentMatches.map((match) => (
      match.id === matchId ? savedMatch : match
    )));
    setDataError('');
    return savedMatch;
  };

  const addEnrollment = async (enrollment) => {
    const newEnrollment = await api.enrollments.create(enrollment);
    setEnrollments((currentEnrollments) => [newEnrollment, ...currentEnrollments]);
    setDataError('');
    return newEnrollment;
  };

  const deleteUser = async (userId) => {
    await api.users.remove(userId);
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    setEnrollments((currentEnrollments) => currentEnrollments.filter(
      (enrollment) => enrollment.userId !== userId,
    ));
  };

  const toggleBlockUser = async (userId) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    const updatedUser = await api.users.setBlocked(userId, !user.isBlocked);
    setUsers((currentUsers) => currentUsers.map((item) => (
      item.id === userId ? updatedUser : item
    )));
  };

  const deleteMatch = async (matchId) => {
    await api.matches.remove(matchId);
    setMatches((currentMatches) => currentMatches.filter((match) => match.id !== matchId));
    setEnrollments((currentEnrollments) => currentEnrollments.filter(
      (enrollment) => enrollment.matchId !== matchId,
    ));
  };

  return (
    <AppContext.Provider value={{
      users,
      matches,
      enrollments,
      currentUser,
      theme,
      dataLoading,
      dataError,
      loginUser,
      registerUser,
      logoutUser,
      addMatch,
      deleteMatch,
      updateMatch,
      addEnrollment,
      deleteUser,
      toggleBlockUser,
      toggleTheme,
      refreshData: loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
};
