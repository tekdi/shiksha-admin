import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import Image, { StaticImageData } from "next/image";
import placeholderImage from "../../public/placeholderImage.png";
import router from "next/router";
import { fetchContent } from "@/services/PlayerService";
import { ContentCardsTypes, FileType } from "@/utils/app.constant";

interface ResourceCardProps {
  title: string;
  // type: string;
  resource: string;
  identifier: string;
  appIcon?: string;
  mimeType?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  // type,
  resource,
  identifier,
  appIcon,
  mimeType
}) => {
  

  const openPlayers = () => {
    sessionStorage.setItem("previousPage", window.location.href);
    if (resource === "Course") {
      router.push(`/course-hierarchy/${identifier}`);
    } else {
      router.push(`/play/content/${identifier}`);
    }
  };

  const getBackgroundImage = () => {
    if (appIcon) {
      return appIcon;
    } else if (ContentCardsTypes[mimeType as keyof FileType]?.BgImgPath?.src) {
      return ContentCardsTypes[mimeType as keyof FileType]?.BgImgPath?.src;
    } else {
      return placeholderImage.src;
    }
  }

  return (
      <Box
        onClick={openPlayers}
        sx={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <Box
          sx={{
            height: '204px',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 100%)',
              zIndex: 1,
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              zIndex: 2,
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Box>
        </Box>

        <Box
          sx={{
            height: '40px',
            background: '#ECE6F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderRadius: '0px 0px 16px 16px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src={ContentCardsTypes[mimeType as keyof FileType]?.imgPath}
              alt="Content Thumbnail"
              style={{ marginRight: '8px', height: '25px', width: '23px' }}
            />
            <span style={{ fontSize: '12px', color: '#1F1B13', fontWeight: 400 }}>
              {ContentCardsTypes[mimeType as keyof FileType]?.name}
            </span>
          </Box>
        </Box>
      </Box>
  );
};

export default ResourceCard;
