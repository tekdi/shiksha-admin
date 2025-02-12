import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
} from "@mui/material";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";


const initialOpportunities = [
  { id: 1, industry: "IT", status: "Open", startDate: "2025-02-01", endDate: "2025-06-01", vacancies: 5 },
  { id: 2, industry: "Healthcare", status: "Closed", startDate: "2025-01-15", endDate: "2025-05-15", vacancies: 3 },
];

type Opportunity = {
  id: number;
  industry: string;
  status: string;
  startDate: string;
  endDate: string;
  vacancies: number;
};

export default function JobOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities);
  const [form, setForm] = useState<Partial<Opportunity>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (isEditing && form.id !== undefined) {
      setOpportunities(opportunities.map((opp) => (opp.id === form.id ? { ...opp, ...form } : opp)));
    } else {
      setOpportunities([...opportunities, { ...form, id: Date.now() } as Opportunity]);
    }
    setForm({});
    setIsEditing(false);
    setOpenDialog(false);
  };

  const handleEdit = (opp: Opportunity) => {
    setForm(opp);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId !== null) {
      setOpportunities(opportunities.filter((opp) => opp.id !== deleteId));
      setDeleteId(null);
    }
    setConfirmDelete(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Job Opportunities</h1>
      <div className="mb-4 flex justify-between">
        <TextField placeholder="Search opportunities..." variant="outlined" size="small" className="w-1/3" />
        <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          New Opportunity
        </Button>
      </Box>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Industry</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Vacancies</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {opportunities.map((opp) => (
              <TableRow key={opp.id}>
                <TableCell>{opp.industry}</TableCell>
                <TableCell>{opp.status}</TableCell>
                <TableCell>{opp.startDate}</TableCell>
                <TableCell>{opp.endDate}</TableCell>
                <TableCell>{opp.vacancies}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleEdit(opp)}>
                    Edit
                  </Button>
                  <Button color="secondary" onClick={() => { setDeleteId(opp.id); setConfirmDelete(true); }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{isEditing ? "Edit Opportunity" : "Add Opportunity"}</DialogTitle>
        <DialogContent>
          <TextField name="industry" label="Industry" fullWidth margin="dense" value={form.industry || ""} onChange={handleInputChange} />
          <TextField name="status" label="Status" fullWidth margin="dense" value={form.status || ""} onChange={handleInputChange} />
          <TextField name="startDate" label="Start Date" type="date" fullWidth margin="dense" value={form.startDate || ""} onChange={handleInputChange} />
          <TextField name="endDate" label="End Date" type="date" fullWidth margin="dense" value={form.endDate || ""} onChange={handleInputChange} />
          <TextField name="vacancies" label="Vacancies" type="number" fullWidth margin="dense" value={form.vacancies || ""} onChange={handleInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{isEditing ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this opportunity?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}