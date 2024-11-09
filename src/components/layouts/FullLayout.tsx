// import React, { useState } from "react";
// import {
//   useMediaQuery,
//   Container,
//   Box,
//   ThemeProvider,
//   createTheme,
//   Theme,
//   styled,
// } from "@mui/material";
// import Header from "./header/Header";
// import Sidebar from "./sidebar/Sidebar";
// import Footer from "./footer/Footer";
// import * as theme from '../theme/theme';
// import Dashboard from "@/pages/dashboard";
// import Facilitators from "@/pages/Faciliator";
// import about from "@/pages/about";
// const MainWrapper = styled("div")(() => ({
//   display: "flex",
//   minHeight: "100vh",
//   overflow: "hidden",
//   width: "100%",
// }));

// const PageWrapper = styled("div")(({ theme }: { theme: Theme }) => ({
//   display: "flex",
//   flex: "1 1 auto",
//   overflow: "hidden",
//   backgroundColor: theme.palette.background.default,
//   [theme.breakpoints.up("lg")]: {
//     paddingTop: "64px",
//   },
//   [theme.breakpoints.down("lg")]: {
//     paddingTop: "64px",
//   },
// }));

// type RouteKey = '/' | '/manage-users' | '/course-planner' | '/cohorts' | '/about';

// const componentMapping: Record<RouteKey, React.ComponentType> = {
//   "/": Dashboard,
//   "/manage-users": Facilitators,
//   "/course-planner": Dashboard,
//   "/cohorts": Dashboard,
//   "/about": about
// };

// interface FullLayoutProps {
//   children?: React.ReactNode;
// }

// const FullLayout: React.FC<FullLayoutProps> = () => {
//   const [isSidebarOpen, setSidebarOpen] = useState(true);
//   const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
//   const [activeComponent, setActiveComponent] = useState<RouteKey>("/");

//   const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

//   const ActiveComponent = componentMapping[activeComponent];

//   return (
//     <ThemeProvider theme={theme}>
//       <MainWrapper>
//         <Header
//           sx={{
//             paddingLeft: isSidebarOpen && lgUp ? "265px" : "",
//             backgroundColor: "black",
//           }}
//           toggleMobileSidebar={() => setMobileSidebarOpen(true)}
//         />
//         <Sidebar
//           isSidebarOpen={isSidebarOpen}
//           isMobileSidebarOpen={isMobileSidebarOpen}
//           onSidebarClose={() => setMobileSidebarOpen(false)}
//         //  onMenuItemClick={(href: RouteKey) => setActiveComponent(href)}
//         />
//         <PageWrapper>
//           <Container
//             maxWidth={false}
//             sx={{
//               paddingTop: "20px",
//               paddingLeft: isSidebarOpen && lgUp ? "280px!important" : "",
//             }}
//           >
//             <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
//               <ActiveComponent />
//             </Box>
//             <Footer />
//           </Container>
//         </PageWrapper>
//       </MainWrapper>
//     </ThemeProvider>
//   );
// };

// export default FullLayout;

import React from "react";
import {
  experimentalStyled,
  useMediaQuery,
  Container,
  Box,
} from "@mui/material";
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import Footer from "./footer/Footer";

const MainWrapper = experimentalStyled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  overflow: "hidden",
  width: "100%",
}));

const PageWrapper = experimentalStyled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",

  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.up("lg")]: {
    paddingTop: "64px",
  },
  [theme.breakpoints.down("lg")]: {
    paddingTop: "64px",
  },
}));

const FullLayout = ({ children }: any) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  return (
    <MainWrapper>
      <Header
        sx={{
          paddingLeft: isSidebarOpen && lgUp ? "265px" : "",
          backgroundColor: "#4d4639",
          boxshow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        }}
        toggleMobileSidebar={() => setMobileSidebarOpen(true)}
      />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper>
        <Container
          maxWidth={false}
          sx={{
            //  paddingTop: "20px",
            paddingLeft: isSidebarOpen && lgUp ? "280px!important" : "",
            backgroundColor: "#F3F5F8",
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
          <Footer />
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;
