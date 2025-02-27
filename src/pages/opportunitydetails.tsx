// opportunitydetails
import { useState } from "react";
import { Card, CardContent, CardHeader, Typography, Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import { useTranslation } from "next-i18next";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import FormControlLabel from "@mui/material/FormControlLabel";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";


const opportunity = {
  id: 1,
  industry: "IT",
  description: "Software development internship.",
  status: "Open",
  workExperience: "6 months internship in React and Node.js",
  startDate: "2025-02-01",
  endDate: "2025-06-01",
  stipend: "$1000 per month",
  vacancies: 5,
  offerLetter: "Yes",
  skills: ["React", "Node.js", "JavaScript"],
};

const users = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));

export default function OpportunityDetail() {
    const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const toggleUserSelection = (id: any) => {
    setSelectedUsers((prev : any) =>
      prev.includes(id) ? prev.filter((userId : any) => userId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader title="Opportunity Details" />
        <CardContent>
          <Typography variant="h6">Industry: {opportunity.industry}</Typography>
          <Typography>Description: {opportunity.description}</Typography>
          <Typography>Status: {opportunity.status}</Typography>
          <Typography>Work Experience: {opportunity.workExperience}</Typography>
          <Typography>Start Date: {opportunity.startDate}</Typography>
          <Typography>End Date: {opportunity.endDate}</Typography>
          <Typography>Stipend: {opportunity.stipend}</Typography>
          <Typography>Vacancies: {opportunity.vacancies}</Typography>
          <Typography>Offer Letter: {opportunity.offerLetter}</Typography>
          <Typography>Skills: {opportunity.skills.join(", ")}</Typography>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Assign Youth
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Select Youth</DialogTitle>
        <DialogContent dividers style={{ maxHeight: "400px", overflowY: "auto" }}>
          <List>
            {users.map((user) => (
              <ListItem key={user.id} button onClick={() => toggleUserSelection(user.id)}>
                <FormControlLabel
                  control={<Checkbox checked={selectedUsers.includes(user.id)} />}
                  label={<ListItemText primary={user.name} />}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log("Assigned Youth:", selectedUsers);
              setOpen(false);
            }}
          >
            Assign
          </Button>
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