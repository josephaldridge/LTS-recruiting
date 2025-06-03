import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import icon from '../assets/liberty-tax-icon.png';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Candidates', icon: <PeopleIcon />, path: '/candidates' },
  { text: 'Interviews', icon: <EventNoteIcon />, path: '/interviews' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-appleGlass backdrop-blur-md rounded-2xl shadow-glass border border-appleBorder p-6 flex flex-col gap-4 min-h-screen">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src={icon} alt="Liberty Tax" style={{ width: 40, height: 40 }} />
        <Box>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Liberty Tax
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'white' }}>
            Recruiting System
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </nav>
  );
};

export default Navigation; 