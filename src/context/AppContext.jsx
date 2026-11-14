import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('cricket_users');
    return saved ? JSON.parse(saved) : [
      { id: '1', username: 'admin', contactNumber: '0000000000', city: 'All', role: 'admin' }
    ];
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('cricket_matches');
    return saved ? JSON.parse(saved) : [];
  });

  const [enrollments, setEnrollments] = useState(() => {
    const saved = localStorage.getItem('cricket_enrollments');
    return saved ? JSON.parse(saved) : [];
  });

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
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cricket_theme', theme);
  }, [theme]);

  useEffect(() => localStorage.setItem('cricket_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('cricket_matches', JSON.stringify(matches)), [matches]);
  useEffect(() => localStorage.setItem('cricket_enrollments', JSON.stringify(enrollments)), [enrollments]);
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

  const addMatch = (match) => {
    const newMatch = { ...match, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setMatches([...matches, newMatch]);
  };

  const updateMatch = (matchId, updatedMatch) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, ...updatedMatch } : m));
  };

  const addEnrollment = (enrollment) => {
    const newEnrollment = { ...enrollment, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setEnrollments([...enrollments, newEnrollment]);
  };

  const deleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
    setEnrollments(enrollments.filter(e => e.userId !== userId));
  };

  const deleteMatch = (matchId) => {
    setMatches(matches.filter(m => m.id !== matchId));
    setEnrollments(enrollments.filter(e => e.matchId !== matchId));
  };

  const toggleBlockUser = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u
    ));
  };

  return (
    <AppContext.Provider value={{
      users, matches, enrollments, currentUser, theme, recentLogins,
      loginUser, logoutUser, addMatch, deleteMatch, updateMatch, addEnrollment, deleteUser,
      toggleBlockUser, toggleTheme, removeRecentLogin
    }}>
      {children}
    </AppContext.Provider>
  );
};
