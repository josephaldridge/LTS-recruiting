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
  Grid,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axiosInstance from '../utils/axios';

const departments = [
  { label: 'Technical Support', value: 'technical', display: 'Tier 1 Technical Support Representative' },
  { label: 'Financial Products Support', value: 'financial', display: 'Financial Product Support Representative' },
  { label: 'Customer Care Center', value: 'customer', display: 'Customer Service Agent' },
];

const statusConfig = {
  'Needs Interview': {
    icon: <ScheduleIcon />,
    color: '#ed6c02',
    modalTitle: 'Candidates Needing Interview',
  },
  'Interview Scheduled': {
    icon: <EventNoteIcon />,
    color: '#1976d2',
    modalTitle: 'Scheduled Interviews',
  },
  'Under Review': {
    icon: <AssignmentIcon />,
    color: '#0288d1',
    modalTitle: 'Candidates Under Review',
  },
  'Submitted': {
    icon: <SendIcon />,
    color: '#9c27b0',
    modalTitle: 'Submitted Candidates',
  },
  'Hired': {
    icon: <CheckCircleIcon />,
    color: '#2e7d32',
    modalTitle: 'Hired Candidates',
  },
};

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

  // Get counts for each status
  const statusCounts = Object.keys(statusConfig).reduce((acc, status) => {
    acc[status] = candidates.filter(c => c.status === status).length;
    return acc;
  }, {} as Record<string, number>);

  // Get department breakdown
  const departmentBreakdown = departments.reduce((acc, dept) => {
    const deptCandidates = candidates.filter(c => c.department === dept.value);
    acc[dept.value] = {
      label: dept.label,
      total: deptCandidates.length,
      statuses: Object.keys(statusConfig).reduce((statusAcc, status) => {
        statusAcc[status] = deptCandidates.filter(c => c.status === status).length;
        return statusAcc;
      }, {} as Record<string, number>)
    };
    return acc;
  }, {} as Record<string, { label: string; total: number; statuses: Record<string, number> }>);

  // Calculate totals
  const totals = {
    total: candidates.length,
    statuses: statusCounts
  };

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
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((c) => (
                <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => { setModal(null); navigate(`/candidates/${c.id}`); }}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{getDeptDisplay(c.department)}</TableCell>
                  <TableCell>{c.status}</TableCell>
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
    if (Object.keys(statusConfig).includes(modal || '')) {
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
              {candidates.filter(c => c.status === modal).map((c) => (
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
    <Box className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-glass border border-blue-100 p-4 w-full mx-auto mt-2">
      <Typography variant="h4" className="text-3xl font-semibold mb-4 text-gray-900 tracking-tight">Dashboard</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Status Breakdown
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Grid item xs={12} sm={6} md={4} key={status}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
                }}
                onClick={() => setModal(status)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: `${config.color}15`,
                        borderRadius: '50%',
                        p: 1,
                        mr: 2,
                      }}
                    >
                      {React.cloneElement(config.icon, { sx: { color: config.color } })}
                    </Box>
                    <Typography variant="h6">{status}</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {statusCounts[status]}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Department Status Breakdown
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                {Object.keys(statusConfig).map(status => (
                  <TableCell key={status} align="right">{status}</TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map(dept => (
                <TableRow key={dept.value}>
                  <TableCell>{dept.label}</TableCell>
                  {Object.keys(statusConfig).map(status => (
                    <TableCell 
                      key={status} 
                      align="right"
                      sx={{ 
                        color: statusConfig[status as keyof typeof statusConfig].color,
                        fontWeight: 'medium'
                      }}
                    >
                      {departmentBreakdown[dept.value]?.statuses[status] || 0}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {departmentBreakdown[dept.value]?.total || 0}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                {Object.keys(statusConfig).map(status => (
                  <TableCell 
                    key={status} 
                    align="right"
                    sx={{ 
                      color: statusConfig[status as keyof typeof statusConfig].color,
                      fontWeight: 'bold'
                    }}
                  >
                    {totals.statuses[status]}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {totals.total}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={!!modal} onClose={() => setModal(null)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>
          {modal === 'candidates' && 'All Candidates'}
          {modal === 'interviews' && 'Upcoming Interviews by Department'}
          {Object.keys(statusConfig).includes(modal || '') && statusConfig[modal as keyof typeof statusConfig]?.modalTitle}
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