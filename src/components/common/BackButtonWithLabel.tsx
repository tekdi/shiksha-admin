import { Box, IconButton, Typography } from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface BackButtonWithLabelProps {
    label: string;
    previousPagePath?: string;
}

const BackButtonWithLabel: React.FC<BackButtonWithLabelProps> = ({ label, previousPagePath }) => {
    const router = useRouter();
    return (
        <Box
            sx={{ display: "flex", alignItems: "center", mb: 2, mt: 2 }}
            onClick={() => previousPagePath ? router.push(`/${previousPagePath}`) : router.back()}>
            <IconButton>
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h2">{label}</Typography>
        </Box>)
};

export default BackButtonWithLabel;