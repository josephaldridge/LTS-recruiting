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
  Autocomplete,
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
pdfjsLib.GlobalWorkerOptions.workerSrc =
  window.location.origin + '/pdf.worker.min.js';

const API_BASE = process.env.REACT_APP_API_URL || '';

const departments = [
  { label: 'Technical Support', value: 'technical', display: 'Tier 1 Technical Support Representative' },
  { label: 'Financial Products Support', value: 'financial', display: 'Financial Product Support Representative' },
  { label: 'Customer Care Center', value: 'customer', display: 'Customer Service Agent' },
];

const statusColors = {
  'Needs Interview': 'warning',
  'Interview Scheduled': 'primary',
  'Under Review': 'info',
  'Submitted': 'secondary',
  'Hired': 'success',
} as const;

const hiringLocations = [
  'Virginia Beach',
  'Hurst',
  'Remote',
];

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [candidateToDelete, setCandidateToDelete] = useState<number | null>(null);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hiring_location: '',
    resume: null as File | null,
  });
  const [emailError, setEmailError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

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
      setEmailError('');
      if (!newCandidate.position) {
        alert('Position is required');
        return;
      }
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
        name: '', email: '', phone: '', department: '', position: '', hiring_location: '', resume: null,
      });
    } catch (err: any) {
      if (err.response && err.response.status === 409 && err.response.data?.error === 'Email already exists') {
        setEmailError('Email already exists');
      } else {
        alert('Failed to add candidate.');
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, candidateId: number) => {
    e.stopPropagation();
    setCandidateToDelete(candidateId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText.toLowerCase() === 'delete' && candidateToDelete) {
      try {
        await axiosInstance.delete(`/api/candidates/${candidateToDelete}`);
        setCandidates(prev => prev.filter(c => c.id !== candidateToDelete));
        setDeleteDialogOpen(false);
        setDeleteConfirmText('');
        setCandidateToDelete(null);
      } catch (err) {
        alert('Failed to delete candidate.');
      }
    }
  };

  return (
    <Box className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-glass border border-blue-100 p-4 w-full mx-auto">
      <Box className="flex flex-col mb-6">
        <Typography variant="h4" className="text-3xl font-semibold mb-4 text-gray-900 tracking-tight">Candidates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="bg-white/40 hover:bg-white/60 text-gray-900 rounded-full px-6 py-2 w-fit mb-4 transition font-medium shadow"
          onClick={() => setOpenDialog(true)}
        >
          Add Candidate
        </Button>
      </Box>
      <Box className="mb-4 flex gap-4">
        <Autocomplete
          options={candidates}
          getOptionLabel={(option) => option.name}
          value={selectedCandidate}
          onChange={(event, newValue) => {
            setSelectedCandidate(newValue);
          }}
          renderInput={(params) => <TextField {...params} label="Search Candidates" variant="outlined" />}
          loading={loading}
          sx={{ width: 300 }}
        />
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
      <TableContainer component={Paper} className="bg-white/30 rounded-xl shadow border border-appleBorder">
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
                  <TableCell>{departments.find(d => d.value === candidate.department)?.label}</TableCell>
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
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={(e) => handleDeleteClick(e, candidate.id)}
                    >
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
        <DialogTitle className="text-2xl font-semibold text-gray-900">Add New Candidate</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col gap-4 mt-2">
            <TextField label="Name" fullWidth value={newCandidate.name} onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })} />
            <TextField label="Email" fullWidth value={newCandidate.email} onChange={e => { setNewCandidate({ ...newCandidate, email: e.target.value }); setEmailError(''); }} error={!!emailError} helperText={emailError} />
            <TextField label="Phone" fullWidth value={newCandidate.phone} onChange={e => setNewCandidate({ ...newCandidate, phone: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select label="Department" value={newCandidate.department} onChange={e => setNewCandidate({ ...newCandidate, department: e.target.value })}>
                {departments.map((dept) => (
                  <MenuItem key={dept.value} value={dept.value}>{dept.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label="Position" 
              fullWidth 
              required
              value={newCandidate.position} 
              onChange={e => setNewCandidate({ ...newCandidate, position: e.target.value })} 
            />
            <FormControl fullWidth>
              <InputLabel>Hiring Location</InputLabel>
              <Select
                label="Hiring Location"
                value={newCandidate.hiring_location}
                onChange={e => setNewCandidate({ ...newCandidate, hiring_location: e.target.value })}
              >
                {hiringLocations.map(loc => (
                  <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
          <Button onClick={() => setOpenDialog(false)} className="rounded-full px-6 py-2 bg-white/40 hover:bg-white/60 text-gray-900 font-medium transition">Cancel</Button>
          <Button variant="contained" className="bg-appleAccent hover:bg-blue-600 rounded-full px-6 py-2 text-white font-medium transition" onClick={handleAddCandidate}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Candidate</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This action cannot be undone. Please type "delete" to confirm.
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type 'delete' to confirm"
            error={deleteConfirmText !== '' && deleteConfirmText.toLowerCase() !== 'delete'}
            helperText={deleteConfirmText !== '' && deleteConfirmText.toLowerCase() !== 'delete' ? 'Please type "delete" exactly' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setDeleteConfirmText('');
            setCandidateToDelete(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteConfirmText.toLowerCase() !== 'delete'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates; 