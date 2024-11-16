import React, { useEffect, useRef, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import config from "../../../../config.json";
import PropTypes from "prop-types";
import Image from "next/image";
import TranslateIcon from "@mui/icons-material/Translate";
import Menu from "@mui/material/Menu";
import SearchBar from "./SearchBar";
import { useRouter } from "next/router";
import deleteIcon from '../../../../public/images/Language_icon.png';

import { useTranslation } from "next-i18next";
import { createTheme, useTheme } from "@mui/material/styles";
import Profile from "./Profile";
import { AcademicYear } from "@/utils/Interfaces";
import useStore from "@/store/store";
import { useQueryClient } from '@tanstack/react-query';

const Header = ({ sx, customClass, toggleMobileSidebar, position }: any) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const [lang, setLang] = useState("");
  const queryClient = useQueryClient();

  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const setIsActiveYearSelected = useStore(
    (state: { setIsActiveYearSelected: any }) => state.setIsActiveYearSelected
  );

  const [selectedLanguage, setSelectedLanguage] = useState(lang);
  const [academicYearList, setAcademicYearList] = useState<AcademicYear[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const [language, setLanguage] = useState(selectedLanguage);
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const lang = localStorage.getItem("preferredLanguage") || "en";
      setLanguage(lang);
      const storedList = localStorage.getItem("academicYearList");
      try {
        const parsedList = storedList ? JSON.parse(storedList) : [];
        const modifiedList = parsedList.map((item: { isActive: any; session: any; }) => {
          if (item.isActive) {
            return { ...item, session: `${item.session} (${t('COMMON.ACTIVE')})` };
          }
          return item;
        }); 
        setAcademicYearList(modifiedList);
        const selectedAcademicYearId = localStorage.getItem("academicYearId");
        setSelectedSessionId(selectedAcademicYearId ?? "");
      } catch (error) {
        console.error("Error parsing stored academic year list:", error);
        setAcademicYearList([]);
        setSelectedSessionId("");
      }
    }
  }, [setLanguage]);

  const handleSelectChange = (event: SelectChangeEvent) => {
    setSelectedSessionId(event.target.value);
    console.log("selected academic year id", event.target.value);
    localStorage.setItem("academicYearId", event.target.value);
    // Check if the selected academic year is active
    const selectedYear = academicYearList?.find(
      (year) => year.id === event.target.value
    );
    const isActive = selectedYear ? selectedYear.isActive : false;
    // localStorage.setItem('isActiveYearSelected', JSON.stringify(isActive));
    setIsActiveYearSelected(isActive);

    queryClient.clear();
 // window.location.reload();
    window.location.href = "/centers";
  };

  const handleChange = (event: SelectChangeEvent) => {
    const newLocale = event.target.value;
    setLanguage(newLocale);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("preferredLanguage", newLocale);
      router.replace(router.pathname, router.asPath, { locale: newLocale });
    }
  };
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event);
    setAnchorEl(event.currentTarget);
    console.log(anchorEl);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMenuItemClick = (newLocale: any) => {
    console.log(newLocale);
    setLanguage(newLocale);
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("preferredLanguage", newLocale);
      router.replace(router.pathname, router.asPath, { locale: newLocale });
    }
    handleClose();
  };
  return (
    <AppBar sx={sx} position={position} elevation={0} className={customClass}>
      <Toolbar sx={{ gap: "15px" }}>
        <IconButton
          size="large"
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "flex",
            },
          }}
        >
          <FeatherIcon icon="menu" size="20" />
        </IconButton>
        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        {/* <SearchBar
          placeholder={t("NAVBAR.SEARCHBAR_PLACEHOLDER")}
          backgroundColor={theme.palette.background.default}
        /> */}
        {/* ------------ End Menu icon ------------- */}

        <Box flexGrow={1} />
        <Box sx={{ flexBasis: "20%" }}>
          {/* <FormControl className="drawer-select" sx={{ width: '100%' }}> */}
          <Select
            onChange={handleSelectChange}
            value={selectedSessionId}
            className="select-languages"
            displayEmpty
            sx={{
              borderRadius: "0.5rem",
              // color: theme.palette.warning['200'],
              width: "100%",
              marginBottom: "0rem",
              height: "30px",
              color: "#fff",
              border: "1px solid #fff",
              "& .MuiSvgIcon-root": {
                color: "#fff",
              },
            }}
          >
            {academicYearList.map(({ id, session }) => (
              <MenuItem key={id} value={id}>
                {session}
              </MenuItem>
            ))}
          </Select>
          {/* </FormControl> */}
        </Box>
        <Box
          sx={{
            display: "flex",
            // gap:"10px",
            backgroundColor: "white",
            padding: "5px",
            alignItems: "center",
            justifyContent: "center",
            height: "20px",
            width: "45px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
          onClick={handleClick}
        >
          {/* <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? "long-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleClick}
          >
            <TranslateIcon />

          </IconButton> */}
          <Image src={deleteIcon} alt="" 
          width={30}
          />




        </Box>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              // maxHeight: ITEM_HEIGHT * 4.5,
              width: "20ch",
            },
          }}
        >
          {config.languages.map((lang) => (
            <MenuItem
              value={lang.code}
              key={lang.code}
              onClick={() => handleMenuItemClick(lang.code)}
              sx={{
                backgroundColor:
                  lang.code === language ? "rgba(0, 0, 0, 0.08)" : "inherit",
                "&:hover": {
                  backgroundColor:
                    lang.code === language
                      ? "rgba(0, 0, 0, 0.12)"
                      : "rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              {lang.label}
            </MenuItem>
          ))}
        </Menu>
        <Profile />
        {/* ------------------------------------------- */}
        {/* Profile Dropdown */}
        {/* ------------------------------------------- */}
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
  customClass: PropTypes.string,
  position: PropTypes.string,
  toggleSidebar: PropTypes.func,
  toggleMobileSidebar: PropTypes.func,
};

export default Header;
