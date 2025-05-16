import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  // These would typically come from an API
  const stats = [
    {
      title: 'Total Candidates',
      value: 156,
      icon: <PeopleIcon sx={{ color: 'primary.main' }} />,
      color: '#E31837',
    },
    {
      title: 'Interviews Scheduled',
      value: 42,
      icon: <EventNoteIcon sx={{ color: 'secondary.main' }} />,
      color: '#002D72',
    },
    {
      title: 'Hired',
      value: 28,
      icon: <CheckCircleIcon sx={{ color: 'success.main' }} />,
      color: '#2e7d32',
    },
    {
      title: 'Pending Review',
      value: 86,
      icon: <ScheduleIcon sx={{ color: 'warning.main' }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Recruitment Dashboard
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        {stats.map((stat) => (
          <Box key={stat.title} sx={{ flex: 1, minWidth: 200, display: 'flex' }}>
            <StatCard {...stat} />
          </Box>
        ))}
      </Box>
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>
        <Typography color="text.secondary">
          No recent activity to display
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard; 