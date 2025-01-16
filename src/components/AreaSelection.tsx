import { Role } from "@/utils/app.constant";
import { capitalizeFirstLetterOfEachWordInArray } from "@/utils/Helper";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import MultipleSelectCheckmarks from "./FormControl";
import { useRouter } from "next/router";

interface State {
  value: string;
  label: string;
}

interface District {
  value: string;
  label: string;
}

interface Block {
  value: string;
  label: string;
}
interface Centers {
  cohortId: string;
  name: string;
}
interface DropdownBoxProps {
  states: State[];
  districts: District[];
  blocks: Block[];
  allCenters?: Centers[];
  selectedState: string[];
  selectedDistrict: string[];
  selectedBlock: string[];
  selectedCenter?: any;
  inModal?: boolean;
  handleStateChangeWrapper: (
    selectedNames: string[],
    selectedCodes: string[]
  ) => Promise<void>;
  handleDistrictChangeWrapper: (
    selected: string[],
    selectedCodes: string[]
  ) => Promise<void>;
  handleBlockChangeWrapper: (
    selected: string[],
    selectedCodes: string[]
  ) => void;
  handleCenterChangeWrapper?: (
    selected: string[],
    selectedCodes: string[]
  ) => void;

  isMobile: boolean;
  isMediumScreen: boolean;
  isCenterSelection?: boolean;
  stateDefaultValue?: string;
  userType?: string;
  reAssignModal?: boolean;
  blockDefaultValue?: string;
  districtDefaultValue?: string;
}

const AreaSelection: React.FC<DropdownBoxProps> = ({
  states,
  districts,
  blocks,
  allCenters = [],
  selectedState,
  selectedDistrict,
  selectedBlock,
  selectedCenter = [],
  handleStateChangeWrapper,
  handleDistrictChangeWrapper,
  handleBlockChangeWrapper,
  isMobile,
  isMediumScreen,
  isCenterSelection = false,
  inModal = false,
  handleCenterChangeWrapper = () => { },
  stateDefaultValue,
  blockDefaultValue,
  districtDefaultValue,

  userType,
  reAssignModal = false,
}) => { 
  const router = useRouter();

  const {  center } = router.query;

  const { t } = useTranslation();
  const theme = useTheme<any>();
  const [singleState, setSingleState] = useState<boolean>(true);
  const [stateValue, setStateValue] = useState<string>("");
  const [stateCode, setStateCode] = useState<string>("");
  const isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down("sm")
  );
  // isSmallScreen=isMobile?true: false;
  const blockDisable = districtDefaultValue ? false : true;
  const shouldRenderSelectCheckmarks = !(
    reAssignModal && userType === Role.TEAM_LEADERS
  );
  return (
    <Box
      sx={{
        display: "flex",
        borderRadius: "8px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          "@media (max-width: 900px)": {
            flexDirection: "column",
          },
        }}
      >
        {userType && !reAssignModal && inModal === false && (
          <Box>
            <Typography marginTop="20px" variant="h1">
              {userType === Role.CONTENT_CREATOR ? t("SIDEBAR.SCTA") : userType}
            </Typography>
          </Box>
        )}

        {(<Box
          sx={{
            width: inModal ? "100%" : "62%",
            "@media (max-width: 900px)": {
              width: "100%",
            },
          }}
        >
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={inModal ? 12 : 6}
              md={inModal ? 12 : 4}
              lg={inModal ? 12 : isCenterSelection ? 3 : 4}
            >
              <MultipleSelectCheckmarks
                names={states?.map(
                  (state) =>
                    state.label?.toLowerCase().charAt(0).toUpperCase() +
                    state.label?.toLowerCase().slice(1)
                )}
                codes={states?.map((state) => state.value)}
                tagName={t("FACILITATORS.STATE")}
                selectedCategories={selectedState}
                onCategoryChange={handleStateChangeWrapper}
                disabled={stateDefaultValue !== t("COMMON.ALL_STATES")}
                overall={!inModal}
                defaultValue={stateDefaultValue}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={inModal ? 12 : 6}
              md={inModal ? 12 : 4}
              lg={inModal ? 12 : isCenterSelection ? 3 : 4}
            >
              <MultipleSelectCheckmarks
                names={districts?.map((district) => district.label)}
                codes={districts?.map((district) => district.value)}
                tagName={t("FACILITATORS.DISTRICT")}
                selectedCategories={selectedDistrict}
                onCategoryChange={handleDistrictChangeWrapper}
                disabled={
                  districts?.length <= 0 ||
                  (selectedState.length === 0 &&
                    stateDefaultValue === t("COMMON.ALL_STATES"))
                }
                overall={!inModal}
                defaultValue={
                  reAssignModal
                    ? districtDefaultValue
                    : selectedState.length > 0 && districts?.length === 0
                      ? t("COMMON.NO_DISTRICTS")
                      : t("COMMON.ALL_DISTRICTS")
                }
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={inModal ? 12 : 6}
              md={inModal ? 12 : 4}
              lg={inModal ? 12 : isCenterSelection ? 3 : 4}
            >
              {shouldRenderSelectCheckmarks && (
                <MultipleSelectCheckmarks
                  names={capitalizeFirstLetterOfEachWordInArray(
                    blocks?.length > 0 ? blocks.map((block) => block.label) : []
                    //  blocks.map((block) => block.label)

                  )}
                  codes={

                    blocks?.length > 0 ? blocks?.map((block) => block.value) : []
                    // blocks?.map((block) => block.value)
                  }
                  tagName={t("FACILITATORS.BLOCK")}
                  selectedCategories={capitalizeFirstLetterOfEachWordInArray(
                    selectedBlock
                  )}
                  onCategoryChange={handleBlockChangeWrapper}
                  disabled={
                    blocks?.length <= 0 ||
                    selectedDistrict?.length === 0 ||
                    selectedDistrict[0] === t("COMMON.ALL_DISTRICTS")
                  }
                  overall={!inModal}
                  defaultValue={
                    selectedDistrict?.length > 0 && (blocks?.length === 0)
                      ? t("COMMON.NO_BLOCKS")
                      : t("COMMON.ALL_BLOCKS")
                  }
                />
              )}
            </Grid>


            {isCenterSelection && (
              <Grid
                item
                xs={12}
                sm={inModal ? 12 : 6}
                md={inModal ? 12 : 4}
                lg={inModal ? 12 : isCenterSelection ? 3 : 4}
              >
                <MultipleSelectCheckmarks
                  names={capitalizeFirstLetterOfEachWordInArray(
                    allCenters?.map((center) => center.name)
                  )}
                  codes={allCenters?.map((center) => center.cohortId)}
                  tagName={t("CENTERS.CENTERS")}
                  selectedCategories={selectedCenter}
                  onCategoryChange={handleCenterChangeWrapper}
                  disabled={
                   (center&& !inModal)?false:
                    selectedBlock.length === 0 ||
                    selectedBlock[0] === t("COMMON.ALL_BLOCKS") ||
                    (selectedBlock?.length > 0 && allCenters?.length === 0)
                  }
                  overall={!inModal}
                  defaultValue={
                    selectedBlock?.length > 0 && allCenters?.length === 0
                      ? t("COMMON.NO_CENTERS")
                      : t("COMMON.ALL_CENTERS")
                  }
                />
              </Grid>
            )}

          </Grid>
        </Box>)}
      </Box>
    </Box>
  );
};

export default AreaSelection;
