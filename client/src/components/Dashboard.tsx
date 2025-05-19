import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axiosInstance from '../utils/axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const departments = [
  { label: 'Technical Support', value: 'technical', display: 'Tier 1 Technical Support Representative' },
  { label: 'Financial Products Support', value: 'financial', display: 'Financial Product Support Representative' },
  { label: 'Customer Care Center', value: 'customer', display: 'Customer Service Agent' },
];

const StatCard = ({ title, value, icon, color, onClick }: any) => (
  <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={onClick}>
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
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [candidatesRes, interviewsRes] = await Promise.all([
          axiosInstance.get('/api/candidates'),
          axiosInstance.get('/api/interviews'),
        ]);
        setCandidates(candidatesRes.data);
        setInterviews(interviewsRes.data);
      } catch (err) {
        setCandidates([]);
        setInterviews([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter interviews for today and future
  const today = dayjs().format('YYYY-MM-DD');
  const upcomingInterviews = interviews.filter((i: any) => dayjs(i.date).isSame(today) || dayjs(i.date).isAfter(today));

  // Group upcoming interviews by department
  const interviewsByDept: Record<string, number> = {};
  upcomingInterviews.forEach((i: any) => {
    const dept = i.department || i.candidateDepartment || 'unknown';
    interviewsByDept[dept] = (interviewsByDept[dept] || 0) + 1;
  });

  // Helper to get department display name
  const getDeptDisplay = (value: string) => departments.find(d => d.value === value)?.label || value;

  // Stats
  const stats = [
    {
      title: 'Total Candidates',
      value: candidates.length,
      icon: <PeopleIcon sx={{ color: 'primary.main' }} />,
      color: '#E31837',
      onClick: () => setModal('candidates'),
    },
    {
      title: 'Interviews Scheduled',
      value: upcomingInterviews.length,
      icon: <EventNoteIcon sx={{ color: 'secondary.main' }} />,
      color: '#002D72',
      onClick: () => setModal('interviews'),
    },
    {
      title: 'Hired',
      value: candidates.filter(c => c.status === 'Hired').length,
      icon: <CheckCircleIcon sx={{ color: 'success.main' }} />,
      color: '#2e7d32',
      onClick: () => setModal('hired'),
    },
    {
      title: 'Pending Review',
      value: candidates.filter(c => c.status === 'Pending Review').length,
      icon: <ScheduleIcon sx={{ color: 'warning.main' }} />,
      color: '#ed6c02',
      onClick: () => setModal('pending'),
    },
  ];

  // Modal content
  const renderModalContent = () => {
    if (modal === 'candidates') {
      return (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c) => (
                <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setModal(null); navigate(`/candidates/${c.id}`); }}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{getDeptDisplay(c.department)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    if (modal === 'interviews') {
      return (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Interviews Scheduled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(interviewsByDept).map(([dept, count]) => (
                <TableRow key={dept}>
                  <TableCell>{getDeptDisplay(dept)}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    if (modal === 'hired' || modal === 'pending') {
      const status = modal === 'hired' ? 'Hired' : 'Pending Review';
      return (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.filter(c => c.status === status).map((c) => (
                <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setModal(null); navigate(`/candidates/${c.id}`); }}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{getDeptDisplay(c.department)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    return null;
  };

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
      <Dialog open={!!modal} onClose={() => setModal(null)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>
          {modal === 'candidates' && 'All Candidates'}
          {modal === 'interviews' && 'Upcoming Interviews by Department'}
          {modal === 'hired' && 'Hired Candidates'}
          {modal === 'pending' && 'Pending Review Candidates'}
          <IconButton
            aria-label="close"
            onClick={() => setModal(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>{renderModalContent()}</DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 