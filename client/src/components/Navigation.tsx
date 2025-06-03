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
    <nav className="flex flex-col gap-2 h-full">
      <Box className="flex items-center gap-3 mb-8">
        <img src={icon} alt="Liberty Tax" className="w-10 h-10" />
        <div>
          <Typography variant="h6" className="text-blue-900 font-bold">Liberty Tax</Typography>
          <Typography variant="subtitle2" className="text-blue-700">Recruiting System</Typography>
        </div>
      </Box>
      <Divider className="bg-blue-200 mb-4" />
      <List className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              className={`rounded-lg px-4 py-2 flex items-center gap-3 transition font-medium text-blue-900 hover:bg-blue-100/70 ${location.pathname === item.path ? 'bg-blue-200/80 shadow' : ''}`}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <ListItemIcon className="text-blue-700 min-w-0 mr-2">{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </nav>
  );
};

export default Navigation; 