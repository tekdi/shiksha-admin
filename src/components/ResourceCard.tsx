import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import Image, { StaticImageData } from "next/image";
import placeholderImage from "../../public/placeholderImage.png";
import router from "next/router";
import { getYouTubeThumbnail } from "@/utils/Helper";
import { fetchContent } from "@/services/PlayerService";

interface ResourceCardProps {
  title: string;
  type: string;
  resource: string;
  identifier: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  title,
  type,
  resource,
  identifier,
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | StaticImageData>(placeholderImage);

  useEffect(() => {
    const loadContent = async () => {
      try {
        if (identifier) {
          if (type === 'self') {
            const data = await fetchContent(identifier);
            if (data?.appIcon) {
              setThumbnailUrl(data.appIcon);
            }
            console.log("vivek", data);
          } else if (type.toLowerCase() === 'youtube') {
            const img = getYouTubeThumbnail(identifier);
            if (img) {
              setThumbnailUrl(img);
            }
          }
        }
      } catch (error) {
        console.error("Unable to fetch content", error);
      }
    }
    loadContent();

  }, [identifier, type])

  const openPlayers = () => {
    sessionStorage.setItem("previousPage", window.location.href);
    if (type === 'self') {
      router.push(`/play/content/${identifier}`);
    } else if (type.toLowerCase() === 'youtube') {
      window.open(identifier);
    }
  };

  return (
    <Card sx={{ width: 150, height: 180, borderRadius: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: 100, backgroundColor: "#f5f5f5", borderRadius: "10px" }}
          onClick={openPlayers}
        >
          <Image
            src={thumbnailUrl}
            alt="Resource Placeholder"
            width={100}
            height={100}
            style={{ borderRadius: "10px" }}
          />
        </Box>
        <Typography variant="subtitle1" sx={{
          mt: 1, whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
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
