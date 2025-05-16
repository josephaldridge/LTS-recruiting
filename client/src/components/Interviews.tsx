import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const statusColors = {
  'Scheduled': 'primary',
  'Completed': 'success',
  'Cancelled': 'error',
  'Rescheduled': 'warning',
} as const;

const Interviews: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/interviews`);
        setInterviews(res.data);
      } catch (err) {
        setInterviews([]);
      }
      setLoading(false);
    };
    fetchInterviews();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredInterviews = interviews.filter((interview: any) =>
    Object.values(interview).some((value: any) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const today = dayjs().format('YYYY-MM-DD');
  const now = dayjs();
  const pastInterviews = filteredInterviews.filter((i: any) => dayjs(i.date).isBefore(today));
  const todayInterviews = filteredInterviews.filter((i: any) => i.date === today);
  const upcomingInterviews = filteredInterviews.filter((i: any) => dayjs(i.date).isAfter(today));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Interviews</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ backgroundColor: 'primary.main' }}
        >
          Schedule Interview
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search interviews..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {[{
        label: "Today's Interviews",
        data: todayInterviews
      }, {
        label: 'Upcoming Interviews',
        data: upcomingInterviews
      }, {
        label: 'Past Interviews',
        data: pastInterviews
      }].map(section => (
        <Box key={section.label} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{section.label}</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Interviewer</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {section.data.length === 0 ? (
                  <TableRow><TableCell colSpan={7}><Typography color="text.secondary">No interviews</Typography></TableCell></TableRow>
                ) : (
                  section.data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>{interview.candidateName}</TableCell>
                        <TableCell>{interview.position}</TableCell>
                        <TableCell>{interview.interviewer}</TableCell>
                        <TableCell>
                          {interview.date} at {interview.time}
                        </TableCell>
                        <TableCell>{interview.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={interview.status}
                            color={statusColors[interview.status as keyof typeof statusColors]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={section.data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Box>
      ))}

      {/* Schedule Interview Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Interview</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Candidate"
              fullWidth
              select
              defaultValue=""
            >
              <MenuItem value="1">John Doe</MenuItem>
              <MenuItem value="2">Jane Smith</MenuItem>
            </TextField>
            <TextField
              label="Interviewer"
              fullWidth
              select
              defaultValue=""
            >
              <MenuItem value="1">Sarah Johnson</MenuItem>
              <MenuItem value="2">Mike Wilson</MenuItem>
            </TextField>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Interview Type</InputLabel>
              <Select label="Interview Type" defaultValue="">
                <MenuItem value="in-person">In-Person</MenuItem>
                <MenuItem value="virtual">Virtual</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Interviews; 