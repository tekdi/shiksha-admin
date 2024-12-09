import { firstLetterInUpperCase } from "@/utils/Helper";
import { DataKey, DateFormat, Status } from "@/utils/app.constant";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Grid,
  Paper,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { format } from "date-fns";
import { ITableProps, Table } from "ka-table";
import { PagingPosition, SortDirection, SortingMode } from "ka-table/enums";
import "ka-table/style.css";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ActionIcon from "./ActionIcon";
import UserNameCell from "./UserNameCell";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

interface KaTableComponentProps {
  columns: ITableProps["columns"];
  data?: ITableProps["data"];
  offset?: number;
  limit?: number;
  PagesSelector?: any;
  PageSizeSelector?: any;
  pageSizes?: any;
  onDelete?: any;
  onEdit?: any;
  reassignCohort?: any;
  onChange?: any;
  extraActions: {
    name: string;
    onClick: (rowData: any) => void;
    icon: React.ElementType;
  }[];
  paginationEnable?: boolean;
  showIcons?: boolean;
  noDataMessage?: any;
  pagination?: boolean;
  reassignType?: string;
  onActivate?: any;
}

const KaTableComponent: React.FC<KaTableComponentProps> = ({
  columns,
  data,
  limit,
  PagesSelector,
  PageSizeSelector,
  paginationEnable = true,
  onEdit,
  onDelete,
  reassignCohort,
  pageSizes,
  noDataMessage,
  pagination = true,
  reassignType,
  onActivate,
}) => {
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const handleCheckboxChange = (rowId: number) => {
    setSelectedRowIds((prevSelected) =>
      prevSelected.includes(rowId)
        ? prevSelected.filter((id) => id !== rowId)
        : [...prevSelected, rowId]
    );
  };
  const tableProps: ITableProps = {
    columns,
    data,
    rowKeyField: "id",
    sortingMode: SortingMode.Single,
    ...(pagination && {
      paging: {
        enabled: paginationEnable,
        pageIndex: 0,
        pageSize: limit,
        pageSizes: pageSizes,
        position: PagingPosition.Bottom,
      },
    }),
  };

  const handleActivateClick = (rowData: any) => {
    onActivate && onActivate(rowData);
  };

  return (
    <Paper>
      <div className="ka-table-wrapper">
        <Table
          {...tableProps}
          childComponents={{
            pagingSizes: {
              content: (props) =>
                !isMobile ? <PageSizeSelector {...props} /> : <></>,
            },

            sortIcon: {
              content: ({ column }: any) => {
                const up =
                  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cG9seWdvbiBwb2ludHM9IjI1NS45ODksMTY5LjQ3OCAxNjUuNjg1LDMyMC4wMDYgMzQ2LjMxNSwzMjAuMDA2IAkJIi8+DQoJPC9nPg0KPC9nPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGQ9Ik00MjYuNjY3LDBIODUuMzMzQzM4LjI3MiwwLDAsMzguMjkzLDAsODUuMzMzdjM0MS4zMzNDMCw0NzMuNzI4LDM4LjI3Miw1MTIsODUuMzMzLDUxMmgzNDEuMzMzDQoJCQlDNDczLjcyOCw1MTIsNTEyLDQ3My43MjgsNTEyLDQyNi42NjdWODUuMzMzQzUxMiwzOC4yOTMsNDczLjcyOCwwLDQyNi42NjcsMHogTTQwMi41NiwzNTEuODUxDQoJCQljLTMuNzk3LDYuNjc3LTEwLjg4LDEwLjgxNi0xOC41NiwxMC44MTZIMTI4Yy03LjY4LDAtMTQuNzg0LTQuMTM5LTE4LjU2LTEwLjgxNmMtMy43OTctNi42NzctMy42OTEtMTQuODkxLDAuMjU2LTIxLjQ4Mw0KCQkJbDEyOC0yMTMuMzMzYzcuNzIzLTEyLjg2NCwyOC44ODUtMTIuODY0LDM2LjU4NywwbDEyOCwyMTMuMzMzQzQwNi4yNTEsMzM2Ljk2LDQwNi4zNTcsMzQ1LjE3Myw0MDIuNTYsMzUxLjg1MXoiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==";
                const down =
                  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBkPSJNNDI2LjY2NywwSDg1LjMzM0MzOC4yNzIsMCwwLDM4LjI5MywwLDg1LjMzM3YzNDEuMzMzQzAsNDczLjcyOCwzOC4yNzIsNTEyLDg1LjMzMyw1MTJoMzQxLjMzMw0KCQkJQzQ3My43MjgsNTEyLDUxMiw0NzMuNzI4LDUxMiw0MjYuNjY3Vjg1LjMzM0M1MTIsMzguMjkzLDQ3My43MjgsMCw0MjYuNjY3LDB6IE00MDIuMjgzLDE4MS42NTNsLTEyOCwyMTMuMzMzDQoJCQljLTMuODYxLDYuNDIxLTEwLjc5NSwxMC4zNDctMTguMjgzLDEwLjM0N2MtNy41MDksMC0xNC40NDMtMy45MjUtMTguMzA0LTEwLjM0N2wtMTI4LTIxMy4zMzMNCgkJCWMtMy45NDctNi41OTItNC4wNTMtMTQuODA1LTAuMjc3LTIxLjQ4M2MzLjc5Ny02LjY5OSwxMC44OC0xMC44MzcsMTguNTgxLTEwLjgzN2gyNTZjNy42OCwwLDE0Ljc2Myw0LjEzOSwxOC41NiwxMC44MzcNCgkJCUM0MDYuMzM2LDE2Ni44NDgsNDA2LjI1MSwxNzUuMDYxLDQwMi4yODMsMTgxLjY1M3oiLz4NCgk8L2c+DQo8L2c+DQo8Zz4NCgk8Zz4NCgkJPHBvbHlnb24gcG9pbnRzPSIxNjUuNjg3LDE5Mi4wMTMgMjU1Ljk5MSwzNDIuNTQxIDM0Ni4yOTUsMTkyLjAxMyAJCSIvPg0KCTwvZz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K";
                return (
                  <img
                    src={
                      column.sortDirection === SortDirection.Ascend ? up : down
                    }
                    style={{ width: 12, position: "relative", top: 1 }}
                    alt="sort direction"
                  />
                );
              },
            },
            pagingPages: {
              content: (props) => <PagesSelector {...props} />,
            },
            cell: {
              content: (props) => {
                if (props.column.key === DataKey.ACTIONS) {
                  return (
                    <ActionIcon
                      rowData={props.rowData}
                      onEdit={onEdit}
                      reassignCohort={reassignCohort}
                      onDelete={onDelete}
                      userAction={props.rowData?.userId}
                      disable={props.rowData?.status === Status.ARCHIVED}
                      reassignType={reassignType}
                      onActivate={handleActivateClick}
                    />
                  );
                }
                if (
                  props.column.key === DataKey?.UPDATED_AT &&
                  props.rowData?.updatedAt
                ) {
                  console.log(props.rowData?.updatedAt);
                  return format(
                    props.rowData?.updatedAt,
                    DateFormat.YYYY_MM_DD
                  );
                } else if (
                  props.column.key === DataKey?.CREATED_AT &&
                  props.rowData?.createdAt
                ) {
                  return format(
                    props.rowData?.createdAt,
                    DateFormat.YYYY_MM_DD
                  );
                } else if (props.column.key === DataKey.CREATED_BY) {
                  return <UserNameCell userId={props.rowData?.createdBy} />;
                } else if (props.column.key === DataKey.UPDATED_BY) {
                  return <UserNameCell userId={props?.rowData?.updatedBy} />;
                } else if (props.column.key === DataKey.ACTIVE_MEMBER) {
                  return (
                    <Typography color={"green"}>
                      {props.rowData?.totalActiveMembers
                        ? props.rowData?.totalActiveMembers
                        : "-"}
                    </Typography>
                  );
                } else if (props.column.key === DataKey.ARCHIVED_MEMBERS) {
                  return (
                    <Typography color={"error"}>
                      {props.rowData?.totalArchivedMembers
                        ? props.rowData?.totalArchivedMembers
                        : "-"}
                    </Typography>
                  );
                }
                if (props.column.key === DataKey.STATUS) {
                  if (props.rowData?.status === Status.ARCHIVED) {
                    return (
                      <Chip
                        label={t("COMMON.INACTIVE")}
                        color="error"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        sx={{ fontSize: isMobile ? "xx-small" : "" }}
                      />
                    );
                  } else {
                    return (
                      <Chip
                        label={firstLetterInUpperCase(props?.rowData?.status)}
                        color="success"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        sx={{ fontSize: isMobile ? "xx-small" : "" }}
                      />
                    );
                  }
                }
                if (props.column.key === DataKey.NAME) {
                  return firstLetterInUpperCase(props?.rowData?.name);
                }
                if (props.column.key === DataKey.CENTERS) {
                  return (
                    <>
                      {props?.rowData?.centers?.length > 0 ? (
                        props.rowData.centers.map(
                          (center: string, index: number) => {
                            const [location, classes, time] =
                              center?.split(", ");

                            return (
                              <div key={index}>
                                <Tooltip title={center} placement="right-start">
                                  <Box>
                                    <Box
                                      display={"flex"}
                                      sx={{ wordBreak: "break-word" }}
                                      mt={2}
                                    >
                                      <EventAvailableIcon fontSize="small" />
                                      <Typography component="div">
                                        {location}
                                      </Typography>
                                    </Box>

                                    <Typography color="textSecondary">
                                      {classes}
                                    </Typography>
                                    <Typography
                                      color="textSecondary"
                                      display={"flex"}
                                    >
                                      {time}
                                    </Typography>
                                    {index <
                                      props.rowData.centers.length - 1 && (
                                      <Divider />
                                    )}
                                  </Box>
                                </Tooltip>
                              </div>
                            );
                          }
                        )
                      ) : (
                        <Typography>-</Typography>
                      )}
                    </>
                  );
                }

                if (props.column.key === DataKey.CLASS_NAME) {
                  const name = props?.rowData?.className;

                  if (name && name.length > 0) {
                    const [location, classes, time] = name.split(", ");

                    return (
                      <Tooltip title={name} placement="right-start">
                        <Box>
                          <Box
                            display={"flex"}
                            sx={{ wordBreak: "break-word" }}
                          >
                            <EventAvailableIcon fontSize="small" />
                            <Typography component="div">{location}</Typography>
                          </Box>

                          <Typography color="textSecondary">
                            {classes}
                          </Typography>
                          <Typography color="textSecondary" display="flex">
                            {time}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  } else {
                    return <Typography>-</Typography>;
                  }
                }

                if (props.column.key === DataKey.MOBILE) {
                  return props?.rowData?.mobile ? (
                    <Typography> {props?.rowData?.mobile}</Typography>
                  ) : (
                    "-"
                  );
                }

                if (props.column.key === "selection-cell") {
                  return (
                    <Checkbox
                      checked={selectedRowIds.includes(props?.rowData?.id)}
                      onChange={() => handleCheckboxChange(props?.rowData?.id)}
                    />
                  );
                }

                return <div className="table-cell">{props?.value}</div>;
              },
            },
            dataRow: {
              elementAttributes: ({ rowData }) => {
                // Condition to disable or style the row
                const isDisabled = rowData.status === Status.ARCHIVED;

                return {
                  className: isDisabled ? "disabled-row" : "",
                  style: isDisabled
                    ? { pointerEvents: "none", opacity: 0.5 }
                    : {},
                };
              },
            },

            // headCell: {
            //   content: (props) => {
            //     return <div className="table-header">{props?.column?.title}</div>;
            //   },
            // },
          }}
          noData={{
            text: data && data.length === 0 ? noDataMessage || "" : undefined,
          }}
        />
      </div>
    </Paper>
  );
};

export default KaTableComponent;
