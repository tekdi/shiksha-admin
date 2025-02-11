import React from "react";
import { Chip, Stack } from "@mui/material";
import { firstLetterInUpperCase } from "@/utils/Helper";

interface TemplateTypeChips {
    keys: string[];
}

const TemplateTypeChip: React.FC<TemplateTypeChips> = ({ keys }) => {
    return (
        <Stack direction="row" spacing={1} style={{justifyContent: 'center'}}>
            {keys?.map((key: string, index: number) => (
                <Chip key={index} label={firstLetterInUpperCase(key)} size="small" />
            ))}
        </Stack>
    );
}

export default TemplateTypeChip;
