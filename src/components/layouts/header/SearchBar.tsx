import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, InputBase, Paper, useMediaQuery } from "@mui/material";
import { styled } from "@mui/system";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TelemetryEventType } from "@/utils/app.constant";
import { telemetryFactory } from "@/utils/telemetry";

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder: string;
}

const SearchBox = styled(Paper)<{ isSmallScreen: boolean }>(({ theme, isSmallScreen }) => ({
  padding: "2px 4px",
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: isSmallScreen ? "100%" : 900,
  borderRadius: "8px",
  backgroundColor:"#F0F0F0",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
  const [keyword, setKeyword] = useState("");
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down("sm"),
  );

  const validateKeyword = (keyword: string) => {
    return /^(\S+)( \S+)*$/.test(keyword.trim()) && !/\s{2,}/.test(keyword);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (keyword.trim().length >= 3 && validateKeyword(keyword)) {
        onSearch(keyword);
        const windowUrl = window.location.pathname;
        const cleanedUrl = windowUrl.replace(/^\//, '');
        const env = cleanedUrl.split("/")[0];
        const telemetryInteract = {
          context: {
            env: env,
            cdata: [],
          },
          edata: {
            id: 'search-input:'+keyword,
            type: TelemetryEventType.SEARCH,
            subtype: '',
            pageid: cleanedUrl,
          },
        };
        telemetryFactory.interact(telemetryInteract);
      }
    }, 500); // Debounce delay of 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Replace multiple spaces with a single space
    const normalizedValue = value.replace(/\s{2,}/g, " ").trimStart();
    setKeyword(normalizedValue);

    if (value === "") {
      onSearch("");
    }
  };

  const handleClear = () => {
    setKeyword("");
    onSearch("");
  };

  return (
    <SearchBox isSmallScreen={isSmallScreen}>
      <StyledInputBase
        placeholder={placeholder}
        value={keyword}
        onChange={handleInputChange}
        inputProps={{ "aria-label": "search" }}
      />
      {keyword && (
        <IconButton
          type="button"
          onClick={handleClear}
          aria-label="clear"
        >
          <CloseIcon />
        </IconButton>
      )}
      <IconButton
        type="button"
        onClick={() => onSearch(keyword)}
        disabled={keyword.trim().length < 3}
      >
        <SearchIcon />
      </IconButton>
    </SearchBox>
  );
};

export default SearchBar;
