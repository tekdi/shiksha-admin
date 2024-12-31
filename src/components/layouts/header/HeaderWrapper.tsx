import React from "react";
import Header from "@/components/layouts/header/Header";
import { useTheme } from "@mui/material/styles";
import { Box, useMediaQuery } from "@mui/material";
const HeaderWrapper = () => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const theme = useTheme();
  const lgUp = useMediaQuery(theme?.breakpoints?.up("lg"));

  return (
    <Header
      sx={{
        zIndex: -1,
        width: isSidebarOpen && lgUp ? "78%" : "100%",
        paddingLeft: isSidebarOpen && lgUp ? "265px" : "",
        backgroundColor: "#4d4639",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        // paddingBottom: "1rem",
      }}
      toggleMobileSidebar={() => setMobileSidebarOpen(true)}
      showIcon={false}
    />
  );
};

export default HeaderWrapper;
