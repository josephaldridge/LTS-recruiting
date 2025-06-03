import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Avatar,
  Chip,
  TextField,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
// @ts-ignore
import { Document, Page, pdfjs } from 'react-pdf';
import axiosInstance from '../utils/axios';
pdfjs.GlobalWorkerOptions.workerSrc =
  window.location.origin + '/pdf.worker.min.js';

const API_BASE = process.env.REACT_APP_API_URL || '';

// Mock candidate data
const mockCandidates = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    status: 'Interview Scheduled',
    position: 'Tax Preparer',
    appliedDate: '2024-01-15',
    department: 'technical',
    resume: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    demographics: {
      city: 'Dallas',
      state: 'TX',
    },
    notes: [
      { id: 1, text: 'Great phone interview. Very knowledgeable.', date: '2024-05-10 09:30', author: 'jane.smith@example.com' },
      { id: 2, text: 'Resume received and reviewed.', date: '2024-05-09 14:15', author: 'john.doe@example.com' },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 234-5678',
    status: 'Under Review',
    position: 'Tax Preparer',
    appliedDate: '2024-01-16',
    department: 'financial',
    resume: '',
    demographics: {
      city: 'Houston',
      state: 'TX',
    },
    notes: [
      { id: 1, text: 'Requested additional references.', date: '2024-05-11 11:00', author: 'jane.smith@example.com' },
    ],
  },
];

const departments = {
  technical: 'Tier 1 Technical Support Representative',
  financial: 'Financial Product Support Representative',
  customer: 'Customer Service Agent',
};

interface CandidateProfileProps {
  user: any;
}

type Note = {
  id: number;
  text: string;
  date?: string;
  author?: string;
  created_at?: string;
  author_email?: string;
};

const statusOptions = [
  'Needs Interview',
  'Interview Scheduled',
  'Under Review',
  'Submitted',
  'Hired',
];

const hiringLocations = [
  'Virginia Beach',
  'Hurst',
  'Remote',
];

const CandidateProfile: React.FC<CandidateProfileProps> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [resumeOpen, setResumeOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [resume, setResume] = useState('');
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editCandidate, setEditCandidate] = useState<any>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/candidates/${id}`);
        setCandidate(res.data);
        setStatus(res.data.status);
      } catch (err) {
        setCandidate(null);
      }
      setLoading(false);
    };
    fetchCandidate();
  }, [id]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axiosInstance.get(`/api/notes/candidate/${id}`);
        setNotes(res.data);
      } catch (err) {
        setNotes([]);
      }
    };
    fetchNotes();
  }, [id]);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axiosInstance.get(`/api/resumes/candidate/${id}`);
        setResume(res.data.file_path);
        setResumeId(res.data.id);
      } catch (err) {
        setResume('');
        setResumeId(null);
      }
    };
    fetchResume();
  }, [id]);

  useEffect(() => {
    if (candidate) setEditCandidate(candidate);
  }, [candidate]);

  const handleStatusChange = async (e: any) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (candidate) {
      try {
        await axiosInstance.put(`/api/candidates/${id}`, { ...candidate, status: newStatus });
        setCandidate({ ...candidate, status: newStatus });
      } catch (err) {
        // Optionally show error
      }
    }
  };

  const handleAddNote = async () => {
    if (noteInput.trim()) {
      try {
        const res = await axiosInstance.post('/api/notes', { candidateId: id, text: noteInput });
        setNotes([res.data, ...notes]);
        setNoteInput('');
      } catch (err) {
        // Optionally show error
      }
    }
  };

  const handleDeleteResume = async () => {
    if (resumeId) {
      try {
        await axiosInstance.delete(`/api/resumes/${resumeId}`);
        setResume('');
        setResumeId(null);
      } catch (err) {
        setResumeError('Failed to delete resume.');
      }
    }
  };

  const handleReplaceResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('resume', file);
      try {
        const res = await axiosInstance.post(`/api/resumes/candidate/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setResume(res.data.file_path);
        setResumeId(res.data.id);
        setResumeError(null);
      } catch (err) {
        setResumeError('Failed to upload resume.');
      }
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditCandidate({ ...editCandidate, [field]: value });
  };
  const handleEditDemographics = (field: string, value: any) => {
    setEditCandidate({
      ...editCandidate,
      demographics: { ...editCandidate.demographics, [field]: value },
    });
  };
  const handleSave = async () => {
    try {
      await axiosInstance.put(`/api/candidates/${id}`, editCandidate);
      setCandidate(editCandidate);
      setEditMode(false);
    } catch (err) {
      // Optionally show error
    }
  };

  // Helper for location display
  const getLocation = () => {
    const city = candidate?.demographics?.city;
    const state = candidate?.demographics?.state;
    if (!city && !state) return 'N/A';
    if (!city) return `N/A, ${state}`;
    if (!state) return `${city}, N/A`;
    return `${city}, ${state}`;
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!candidate) return <Typography>Candidate not found.</Typography>;

  return (
    <Box className="w-full mt-8">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} className="mb-4 bg-white/40 hover:bg-white/60 text-gray-900 rounded-full px-6 py-2 font-medium transition shadow">
        Back
      </Button>
      <Paper className="p-8 rounded-2xl shadow-glass border border-appleBorder bg-appleGlass backdrop-blur-md">
        {/* Summary Bar */}
        <Box className="flex items-center gap-8 mb-6 flex-wrap">
          <Avatar className="w-20 h-20 mr-6 text-4xl bg-white/60 text-gray-900 shadow">{candidate?.name?.[0]}</Avatar>
          <Box className="flex-1 flex flex-wrap gap-8">
            <Box>
              <Typography variant="subtitle2">Name</Typography>
              {editMode ? (
                <TextField
                  label="Name"
                  value={editCandidate?.name || ''}
                  onChange={e => handleEditChange('name', e.target.value)}
                  size="small"
                />
              ) : (
                <Typography variant="h6">{candidate?.name || 'N/A'}</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Email</Typography>
              {editMode ? (
                <TextField
                  label="Email"
                  value={editCandidate?.email || ''}
                  onChange={e => handleEditChange('email', e.target.value)}
                  size="small"
                />
              ) : (
                <Chip label={candidate?.email || 'N/A'} />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Phone</Typography>
              {editMode ? (
                <TextField
                  label="Phone"
                  value={editCandidate?.phone || ''}
                  onChange={e => handleEditChange('phone', e.target.value)}
                  size="small"
                />
              ) : (
                <Chip label={candidate?.phone || 'N/A'} />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Status</Typography>
              {editMode ? (
                <Select
                  value={editCandidate?.status || ''}
                  onChange={e => handleEditChange('status', e.target.value)}
                  size="small"
                >
                  {statusOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              ) : (
                <Typography>{candidate?.status || 'N/A'}</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Position</Typography>
              {editMode ? (
                <TextField
                  value={editCandidate?.position || ''}
                  onChange={e => handleEditChange('position', e.target.value)}
                  size="small"
                />
              ) : (
                <Typography>{candidate?.position || 'N/A'}</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Department</Typography>
              {editMode ? (
                <Select
                  value={editCandidate?.department || ''}
                  onChange={e => handleEditChange('department', e.target.value)}
                  size="small"
                >
                  {Object.entries(departments).map(([val, label]) => (
                    <MenuItem key={val} value={val}>{label}</MenuItem>
                  ))}
                </Select>
              ) : (
                <Typography>{candidate?.department && departments.hasOwnProperty(candidate.department) ? departments[candidate.department as keyof typeof departments] : candidate?.department || 'N/A'}</Typography>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle2">Hiring Location</Typography>
              {editMode ? (
                <Select
                  value={editCandidate?.hiring_location || ''}
                  onChange={e => handleEditChange('hiring_location', e.target.value)}
                  size="small"
                >
                  {hiringLocations.map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              ) : (
                <Typography>{candidate?.hiring_location || 'N/A'}</Typography>
              )}
            </Box>
          </Box>
          <Box className="flex gap-4 items-center ml-auto">
            {!editMode ? (
              <Button variant="contained" onClick={() => setEditMode(true)}>Edit</Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleSave}>Save</Button>
            )}
            {editMode && (
              <Button variant="outlined" color="inherit" onClick={() => { setEditMode(false); setEditCandidate(candidate); }}>Cancel</Button>
            )}
          </Box>
        </Box>
        <Divider className="my-6" />
        <Box className="mb-4">
          <Typography variant="subtitle2">Resume</Typography>
          {resume ? (
            <Box className="flex gap-4 items-center">
              <Button variant="outlined" onClick={() => window.open(resume, '_blank')}>View Resume</Button>
              <Button variant="outlined" component="label">
                Upload Resume
                <input type="file" hidden onChange={handleReplaceResume} />
              </Button>
              <Button color="error" onClick={handleDeleteResume}>Delete Resume</Button>
            </Box>
          ) : (
            <Button variant="outlined" component="label">
              Upload Resume
              <input type="file" hidden onChange={handleReplaceResume} />
            </Button>
          )}
          {resumeError && <Typography color="error">{resumeError}</Typography>}
        </Box>
        <Divider className="my-6" />
        <Paper className="p-6 border-l-8 border-appleAccent max-h-96 overflow-auto bg-white/40 w-full rounded-xl">
          <Typography variant="h6" className="text-appleAccent mb-4">Notes</Typography>
          <Box className="flex gap-2 mb-2">
            <TextField
              fullWidth
              size="small"
              placeholder="Add a note..."
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
            />
            <Button variant="contained" className="bg-appleAccent" onClick={handleAddNote}>Add</Button>
          </Box>
          <Box className="max-h-64 overflow-y-auto pr-2">
            {notes.length === 0 && <Typography color="text.secondary">No notes yet.</Typography>}
            {notes.map(note => (
              <Paper key={note.id} className="p-2 mb-2 bg-white/80 border-l-4 border-appleAccent">
                <Typography className="font-medium">{note.text}</Typography>
                <Typography className="text-sm text-gray-500">{note?.created_at || note?.date} — {note?.author_email || note?.author || 'Unknown'}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Paper>
    </Box>
  );
};

export default CandidateProfile; 