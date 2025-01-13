import React from "react";
import { useTranslation } from "next-i18next";
import { Box, Typography, Tooltip,useTheme } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import deleteIcon from '../../public/images/deleteIcon.svg';
import editIcon from '../../public/images/editIcon.svg';
import cohortIcon from '../../public/images/apartment.svg';


import Image from "next/image";
import { TelemetryEventType } from "@/utils/app.constant";
import { telemetryFactory } from "@/utils/telemetry";

interface ActionCellProps {
  onEdit: (rowData: any) => void;
  onDelete: (rowData: any) => void;
  reassignCohort?: (rowData: any) => void;
  reassignType?: string;
  rowData: any;
  disable: boolean;
  userAction?:boolean
}

const ActionIcon: React.FC<ActionCellProps> = ({
  rowData,
  onEdit,
  onDelete,
  reassignCohort,
  userAction=false,
  disable = false,
  reassignType
}) => {
  const { t } = useTranslation();
  const theme = useTheme<any>();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
        pointerEvents: disable ? "none" : "auto",
      }}
    >
      <Tooltip title={t("COMMON.EDIT")}>
        <Box
          onClick={() => {
            onEdit(rowData);
            const windowUrl = window.location.pathname;
            const cleanedUrl = windowUrl.replace(/^\//, '');
            const env = cleanedUrl.split("/")[0];
        
            const telemetryInteract = {
              context: {
                env: env,
                cdata: [],
              },
              edata: {
                id: rowData?.cohortId?'click-edit-delete-action:'+rowData?.cohortId:rowData?.userId? 'edit-on-delete-action:'+rowData?.userId:'edit-on-delete-action',

                type: TelemetryEventType.CLICK,
                subtype: '',
                pageid: cleanedUrl,
              },
            };
            telemetryFactory.interact(telemetryInteract);
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            color: disable ? theme?.palette?.secondary.contrastText : "",
            backgroundColor:"#E3EAF0",
            p:"10px"


          }}
        >
<Image src={editIcon} alt="" />
          {/* <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.EDIT")}
          </Typography> */}
        </Box>
      </Tooltip>
      <Tooltip title={t("COMMON.DELETE")}>
        <Box
          onClick={() => {

            onDelete(rowData);
            const windowUrl = window.location.pathname;
            const cleanedUrl = windowUrl.replace(/^\//, '');
            const env = cleanedUrl.split("/")[0];
        
            const telemetryInteract = {
              context: {
                env: env,
                cdata: [],
              },
              edata: {
                id: rowData?.cohortId?'click-on-delete-action:'+rowData?.cohortId:rowData?.userId? 'click-on-delete-action:'+rowData?.userId:'click-on-delete-action',
                type: TelemetryEventType.CLICK,
                subtype: '',
                pageid: cleanedUrl,
              },
            };
            telemetryFactory.interact(telemetryInteract);
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            color: disable ? theme?.palette?.secondary.contrastText : "",
            backgroundColor:"#F8EFE7",
            p:"10px"
          }}
        >
        <Image src={deleteIcon} alt="" />
{/* 
          <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.DELETE")}
          </Typography> */}
        </Box>
      </Tooltip>

     { userAction && reassignType && ( <Tooltip title={reassignType}>
        <Box
          onClick={() => {
            if(reassignCohort)
            {
              reassignCohort(rowData);
              const windowUrl = window.location.pathname;
              const cleanedUrl = windowUrl.replace(/^\//, '');
              const env = cleanedUrl.split("/")[0];
          
              const telemetryInteract = {
                context: {
                  env: env,
                  cdata: [],
                },
                edata: {
                  id: 'click-on-reassign-action:'+rowData?.userId,
                  type: TelemetryEventType.CLICK,
                  subtype: '',
                  pageid: cleanedUrl,
                },
              };
              telemetryFactory.interact(telemetryInteract);
            }

          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            color: disable ? theme?.palette?.secondary.contrastText : "",
            backgroundColor:"#E5E5E5",
            p:"10px"
          }}
        >
        <Image src={cohortIcon} alt=""  />
{/* 
          <Typography variant="body2" fontFamily={"Poppins"}>
            {t("COMMON.DELETE")}
          </Typography> */}
        </Box>
      </Tooltip>)}
      
    </Box>
  );
};

export default ActionIcon;
