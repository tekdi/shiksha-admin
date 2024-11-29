import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useState } from "react";
import LogoIcon from "../logo/LogoIcon";
import Buynow from "./Buynow";
import Menuitems from "./MenuItems";
import {getFilteredMenuItems} from "./MenuItems";
const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: any) => {
  const [open, setOpen] = useState<number | null>(null);
  const filteredMenuItems = getFilteredMenuItems();

  const { t } = useTranslation();
  const lgUp = useMediaQuery((theme: any) => theme?.breakpoints?.up("lg"));
  const router = useRouter();
  const location = router.pathname;

  const handleClick = (index: number) => {
    setOpen((prevOpen) => (prevOpen === index ? null : index));
  };

  const SidebarContent = (
    <Box
      p={2}
      height="100%"
      bgcolor="#F8EFDA
"
      sx={{
        background: "linear-gradient(to bottom, white, #F8EFDA)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <LogoIcon />
      </Box>

      <Box mt={2}>
        <List>
          {filteredMenuItems?.map((item, index) => (
            <List component="li" disablePadding key={item.title}>
              <Tooltip placement="right-start" title={t(item.title)}>
                <ListItem
                  button
                  onClick={() => {
                    if (item.subOptions) {
                      handleClick(index);
                    } else {
                      router.push(item.href[0]);
                      onSidebarClose();
                    }
                  }}
                  selected={item.href?.includes(location)}
                  sx={{
                    mb: 1,

                    ...(item.href?.includes(location) && {
                      color: "black",
                      backgroundColor: (theme) =>
                        `${theme.palette.primary.main}!important`,
                      borderRadius: "100px",
                    }),
                  }}
                >
                  <ListItemIcon>
                    <Image src={item.icon} alt="" />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography variant="h2" sx={{ fontWeight: "700px" }}>
                      {t(item.title)}
                    </Typography>
                  </ListItemText>
                  {item.subOptions ? (
                    open === index ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )
                  ) : null}
                </ListItem>
              </Tooltip>

              {item.subOptions && (
                <Collapse in={open === index} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item?.subOptions?.map((subItem) => (
                      <Tooltip
                        title={t(subItem.title)}
                        placement="right-start"
                        key={subItem.title}
                      >
                        <ListItem
                          button
                          key={subItem.title}
                          onClick={() => {
                            router.push(subItem.href[0]);
                            onSidebarClose();
                          }}
                          selected={subItem.href.includes(location)}
                          sx={{
                            pl: 8,
                            ml: 2,
                            mb: 1,
                            ...(subItem.href.includes(location) && {
                              color: "black",
                              backgroundColor: (theme) =>
                                `${theme.palette.primary.main}!important`,
                              borderRadius: "100px",
                            }),
                          }}
                        >
                          <ListItemText>{t(subItem.title)}</ListItemText>
                        </ListItem>
                      </Tooltip>
                    ))}
                  </List>
                </Collapse>
              )}
            </List>
          ))}
        </List>
      </Box>
      <Buynow />
    </Box>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        variant="persistent"
        PaperProps={{
          sx: {
            width: "284px",
            border: "0 !important",
            boxShadow: "0px 7px 30px 0px rgb(113 122 131 / 11%)",
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      PaperProps={{
        sx: {
          width: "284px",
          border: "0 !important",
        },
      }}
      variant="temporary"
    >
      {SidebarContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  isMobileSidebarOpen: PropTypes.bool,
  onSidebarClose: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
};

export default Sidebar;
