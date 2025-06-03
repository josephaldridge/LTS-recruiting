import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import theme from './theme';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Candidates from './components/Candidates';
import Interviews from './components/Interviews';
import Reports from './components/Reports';
import CandidateProfile from './components/CandidateProfile';
import Login from './components/Login';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import app from './firebase';

const auth = getAuth(app);

const LogoutButton: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ position: 'fixed', top: 16, right: 24, zIndex: 2000, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ color: '#002D72', fontWeight: 600 }}>{user?.email}</Box>
      <Button
        variant="contained"
        sx={{ bgcolor: '#E31837', color: 'white', fontWeight: 600 }}
        onClick={async () => {
          await signOut(auth);
          navigate('/');
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authChecked) return null;

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <LogoutButton user={user} />
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-appleGray to-white font-sans flex">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-64 h-full bg-gradient-to-b from-blue-200/70 to-blue-400/60 backdrop-blur-xl border-r border-blue-100 shadow-xl p-6">
            <Navigation />
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            <div className="flex-1 flex flex-col p-4 md:p-8">
              <Box component="main" className="flex-1 flex flex-col w-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/candidates" element={<Candidates user={user} />} />
                  <Route path="/candidates/:id" element={<CandidateProfile user={user} />} />
                  <Route path="/interviews" element={<Interviews />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </Box>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
