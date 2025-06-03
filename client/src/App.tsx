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
        <div className="min-h-screen bg-gradient-to-br from-appleGray to-white font-sans">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="col-span-2 md:col-span-2 lg:col-span-2">
                <div className="bg-appleGlass backdrop-blur-md rounded-2xl shadow-glass border border-appleBorder p-8 mb-8">
                  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                    <Navigation />
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/candidates" element={<Candidates user={user} />} />
                        <Route path="/candidates/:id" element={<CandidateProfile user={user} />} />
                        <Route path="/interviews" element={<Interviews />} />
                        <Route path="/reports" element={<Reports />} />
                      </Routes>
                    </Box>
                  </Box>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-appleGlass backdrop-blur-md rounded-2xl shadow-glass border border-appleBorder p-8">
                  {/* Sidebar or extra info */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
