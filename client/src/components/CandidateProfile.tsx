import React, { useState } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
// @ts-ignore
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  date: string;
  author?: string;
};

const CandidateProfile: React.FC<CandidateProfileProps> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const candidate = mockCandidates.find(c => c.id === Number(id));
  const [notes, setNotes] = useState<Note[]>(candidate ? [...candidate.notes] : []);
  const [noteInput, setNoteInput] = useState('');
  const [resumeOpen, setResumeOpen] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);

  if (!candidate) return <Typography>Candidate not found.</Typography>;

  const handleAddNote = () => {
    if (noteInput.trim()) {
      setNotes([{ id: Date.now(), text: noteInput, date: new Date().toLocaleString(), author: user?.email }, ...notes]);
      setNoteInput('');
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 4, px: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2, color: '#E31837' }}>
        Back to Candidates
      </Button>
      <Paper sx={{ p: 3, borderTop: '6px solid #E31837', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#E31837', mr: 2 }}>
            {candidate.name[0]}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{candidate.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">{departments[candidate.department as 'technical' | 'financial' | 'customer']}</Typography>
            <Chip label={candidate.status} color="primary" size="small" sx={{ mt: 1 }} />
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#E31837' }}>Contact Info</Typography>
            <Typography>Email: {candidate.email}</Typography>
            <Typography>Phone: {candidate.phone}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#E31837' }}>Demographics</Typography>
            <Typography>City: {candidate.demographics.city}</Typography>
            <Typography>State: {candidate.demographics.state}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#E31837' }}>Resume</Typography>
            {candidate.resume ? (
              <Button
                variant="outlined"
                sx={{ borderColor: '#E31837', color: '#E31837', mt: 1 }}
                onClick={() => setResumeOpen(true)}
              >
                View Resume
              </Button>
            ) : (
              <Typography>No resume uploaded.</Typography>
            )}
          </Box>
        </Box>
      </Paper>
      <Paper sx={{ p: 3, borderLeft: '6px solid #E31837', maxHeight: 350, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ color: '#E31837', mb: 2 }}>Notes</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add a note..."
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
          />
          <Button variant="contained" sx={{ bgcolor: '#E31837' }} onClick={handleAddNote}>Add</Button>
        </Box>
        <Box sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
          {notes.length === 0 && <Typography color="text.secondary">No notes yet.</Typography>}
          {notes.map(note => (
            <Paper key={note.id} sx={{ p: 2, mb: 2, background: '#fff7f7', borderLeft: '4px solid #E31837' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{note.text}</Typography>
              <Typography variant="caption" color="text.secondary">{note.date} — {note.author || 'Unknown'}</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
      <Dialog open={resumeOpen} onClose={() => setResumeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Resume
          <IconButton onClick={() => setResumeOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ height: 600, overflow: 'auto', background: '#f5f5f5' }}>
          <Document
            file={candidate.resume}
            onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
            loading={<Typography>Loading PDF...</Typography>}
            error={<Typography color="error">Failed to load PDF.</Typography>}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} width={700} />
            ))}
          </Document>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CandidateProfile; 