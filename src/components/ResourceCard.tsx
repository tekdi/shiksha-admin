import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image'; 
import placeholderImage from '../../public/placeholderImage.png'; 

interface ResourceCardProps {
  title: string;
  type: string;  
  resource: string; 
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, type, resource }) => {
  return (
    <Card sx={{ width: 150, height: 180, borderRadius: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: 100, backgroundColor: '#f5f5f5', borderRadius: '10px' }}
        >
          <Image
            src={placeholderImage} 
            alt="Resource Placeholder"
            width={100}  
            height={100} 
            style={{ borderRadius: '10px' }}
          />
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {type}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
