import React from 'react';
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

// Mock data - would come from API
const mockHiringStats = {
  totalApplications: 156,
  interviewsConducted: 42,
  offersMade: 35,
  hiresCompleted: 28,
  averageTimeToHire: '14 days',
  positionsOpen: 12,
};

const mockTopPositions = [
  { position: 'Tax Preparer', applications: 85, hired: 15 },
  { position: 'Customer Service', applications: 45, hired: 8 },
  { position: 'Office Manager', applications: 26, hired: 5 },
];

const mockRecentHires = [
  { name: 'John Doe', position: 'Tax Preparer', startDate: '2024-02-01' },
  { name: 'Jane Smith', position: 'Customer Service', startDate: '2024-02-05' },
  { name: 'Mike Johnson', position: 'Tax Preparer', startDate: '2024-02-10' },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
}> = ({ title, value, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Recruitment Reports
      </Typography>

      <Grid container spacing={3}>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1, display: 'flex' }}>
          <StatCard title="Total Applications" value={mockHiringStats.totalApplications} />
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1, display: 'flex' }}>
          <StatCard title="Interviews Conducted" value={mockHiringStats.interviewsConducted} />
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1, display: 'flex' }}>
          <StatCard title="Offers Made" value={mockHiringStats.offersMade} />
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1, display: 'flex' }}>
          <StatCard title="Hires Completed" value={mockHiringStats.hiresCompleted} />
        </Box>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: '50%' }, p: 1, display: 'flex' }}>
          <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Positions
            </Typography>
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
                  {mockTopPositions.map((row) => (
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
        </Box>
        <Box sx={{ flexBasis: { xs: '100%', md: '50%' }, p: 1, display: 'flex' }}>
          <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Hires
            </Typography>
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
                  {mockRecentHires.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.position}</TableCell>
                      <TableCell>{row.startDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Box sx={{ flexBasis: '100%', p: 1, display: 'flex' }}>
          <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Key Metrics
            </Typography>
            <Grid container spacing={2}>
              <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1, display: 'flex' }}>
                <StatCard title="Average Time to Hire" value={mockHiringStats.averageTimeToHire} />
              </Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: '50%', md: '25%' }, p: 1, display: 'flex' }}>
                <StatCard title="Positions Open" value={mockHiringStats.positionsOpen} />
              </Box>
            </Grid>
          </Paper>
        </Box>
      </Grid>
    </Box>
  );
};

export default Reports; 