import { Box, Typography } from "@mui/material";

interface TemplatePreviewProps {
    template?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template = "" }) => {
    return (
        <Box
            sx={{
                height: "500px",
                width: "400px",
                margin: "10px",
                marginBottom: "200px",
            }}
        >
            <div className="mobile-frame">
                <div className="notch"></div>
                <div className="screen">
                    <div
                        className="content-main"
                        dangerouslySetInnerHTML={{ __html: template }}
                    ></div>
                </div>
            </div>
        </Box>
    );
};

export default TemplatePreview;
