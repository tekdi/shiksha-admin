import { Box, Typography } from "@mui/material";

interface TemplatePreviewProps {
    template?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template = "" }) => {
    return (
        <Box
            sx={{
                padding: "16px",
                // backgroundImage: "url('/images/mobile.png')",
                 background:'white',
                backgroundSize: "cover",
                width: "100%",
                maxWidth: "420px",
                mt: 4,
                borderRadius: "8px",
                height: "600px",
                overflowY: "auto",
                overflowX: "hidden",
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Preview
            </Typography>
            <Box sx={{
                height: "500px",
                width: "400px",
                margin: "10px",
                marginBottom: "200px",
            }}>

            <div dangerouslySetInnerHTML={{ __html: template }} />
            </Box>
        </Box>
    );
};

export default TemplatePreview;
