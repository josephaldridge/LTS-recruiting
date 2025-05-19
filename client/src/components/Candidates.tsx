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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist';
import axiosInstance from '../utils/axios';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const API_BASE = process.env.REACT_APP_API_URL || '';

const departments = [
  { label: 'Technical Support', value: 'technical', display: 'Tier 1 Technical Support Representative' },
  { label: 'Financial Products Support', value: 'financial', display: 'Financial Product Support Representative' },
  { label: 'Customer Care Center', value: 'customer', display: 'Customer Service Agent' },
];

const statusColors = {
  'Interview Scheduled': 'primary',
  'Under Review': 'warning',
  'Hired': 'success',
  'Rejected': 'error',
} as const;

const extractFieldsFromResume = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  // Simple regexes for demo purposes
  const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return {
    name: nameMatch ? nameMatch[0] : '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    city: '',
    state: '',
  };
};

interface CandidatesProps {
  user: any;
}

const Candidates: React.FC<CandidatesProps> = ({ user }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    city: '',
    state: '',
    resume: null as File | null,
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/candidates');
        setCandidates(res.data);
      } catch (err) {
        setCandidates([]);
      }
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCandidates = candidates.filter((candidate) =>
    (selectedDepartment === '' || candidate.department === selectedDepartment) &&
    (selectedStatus === '' || candidate.status === selectedStatus) &&
    Object.values(candidate).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddCandidate = async () => {
    try {
      let formData = new FormData();
      Object.entries(newCandidate).forEach(([key, value]) => {
        if (value) formData.append(key, value as any);
      });
      const res = await axiosInstance.post('/api/candidates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCandidates(prev => [res.data, ...prev]);
      setOpenDialog(false);
      setNewCandidate({
        name: '', email: '', phone: '', department: '', position: '', city: '', state: '', resume: null,
      });
    } catch (err) {
      // Optionally handle error
      alert('Failed to add candidate.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>Candidates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#E31837', width: 'fit-content', mb: 2, '&:hover': { backgroundColor: '#b00000' } }}
          onClick={() => setOpenDialog(true)}
        >
          Add Candidate
        </Button>
      </Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          select
          label="Filter by Department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          sx={{ width: 250 }}
        >
          <MenuItem value="">All Departments</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.value} value={dept.value}>{dept.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Filter by Status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          sx={{ width: 250 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {Object.keys(statusColors).map((status) => (
            <MenuItem key={status} value={status}>{status}</MenuItem>
          ))}
        </TextField>
      </Box>
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search candidates..."
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#E31837' }}>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Department</TableCell>
              <TableCell sx={{ color: 'white' }}>Position</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Applied Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Contact</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidates
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((candidate) => (
                <TableRow
                  key={candidate.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                >
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{departments.find(d => d.value === candidate.department)?.display}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    <Chip
                      label={candidate.status}
                      color={statusColors[candidate.status as keyof typeof statusColors]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{candidate.applied_date || candidate.appliedDate}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{candidate.email}</Typography>
                      <Typography variant="body2">{candidate.phone}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); /* edit logic */ }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); /* delete logic */ }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCandidates.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Candidate</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Name" fullWidth value={newCandidate.name} onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })} />
            <TextField label="Email" fullWidth value={newCandidate.email} onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })} />
            <TextField label="Phone" fullWidth value={newCandidate.phone} onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select label="Department" value={newCandidate.department} onChange={e => setNewCandidate({ ...newCandidate, department: e.target.value })}>
                {departments.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>{dept.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Position" fullWidth value={newCandidate.position} onChange={e => setNewCandidate({ ...newCandidate, position: e.target.value })} />
            <TextField label="City" fullWidth value={newCandidate.city} onChange={e => setNewCandidate({ ...newCandidate, city: e.target.value })} />
            <TextField label="State" fullWidth value={newCandidate.state} onChange={e => setNewCandidate({ ...newCandidate, state: e.target.value })} />
            <Button variant="outlined" component="label" sx={{ borderColor: '#E31837', color: '#E31837' }}>
              Upload Resume
              <input
                type="file"
                hidden
                onChange={async e => {
                  const file = e.target.files ? e.target.files[0] : null;
                  if (file) {
                    const fields = await extractFieldsFromResume(file);
                    setNewCandidate(prev => ({ ...prev, resume: file, ...fields }));
                  }
                }}
              />
            </Button>
            {newCandidate.resume && <Typography variant="body2">Selected: {newCandidate.resume.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: '#E31837' }} onClick={handleAddCandidate}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates; 