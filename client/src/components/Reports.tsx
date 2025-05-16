import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || '';

const Reports: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [topPositions, setTopPositions] = useState<any[]>([]);
  const [recentHires, setRecentHires] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(`${API_BASE}/api/reports/stats`);
        setStats(statsRes.data);
        const topRes = await axios.get(`${API_BASE}/api/reports/top-positions`);
        setTopPositions(topRes.data);
        const hiresRes = await axios.get(`${API_BASE}/api/reports/recent-hires`);
        setRecentHires(hiresRes.data);
      } catch (err) {
        setStats({});
        setTopPositions([]);
        setRecentHires([]);
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Recruitment Reports
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/candidates')}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Total Candidates</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>{stats.totalApplications ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/interviews')}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Interviews Scheduled</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>{stats.interviewsConducted ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/candidates?status=Hired')}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Hired</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>{stats.hiresCompleted ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/candidates?status=Pending Review')}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>Pending Review</Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>{stats.pendingReview ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Positions</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Position</TableCell>
                    <TableCell align="right">Applications</TableCell>
                    <TableCell align="right">Hired</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPositions.map((row: any) => (
                    <TableRow key={row.position}>
                      <TableCell>{row.position}</TableCell>
                      <TableCell align="right">{row.applications}</TableCell>
                      <TableCell align="right">{row.hired}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Hires</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Start Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentHires.map((row: any) => (
                    <TableRow key={row.name + row.startDate}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.position}</TableCell>
                      <TableCell>{row.startDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 