import { DataType, SortDirection } from "ka-table";

interface ColumnConfig {
  key: string;
  titleKey: string;
  width?: number;
  sortDirection?: SortDirection;
  isSortable?: boolean;
}

const generateColumns = (
  t: any,
  configs: ColumnConfig[],
  isMobile: boolean
) => {
  return configs.map((config) => ({
    key: config.key,
    title: t(config.titleKey).toUpperCase(),
    dataType: DataType.String,
    sortDirection: config.sortDirection,
    width: isMobile && config.width ? config.width : config.width || undefined,
    isSortable: config.isSortable,
  }));
};

export const getUserTableColumns = (t: any, isMobile: boolean) => {
  const configs: ColumnConfig[] = [
    { key: "name", titleKey: "TABLE_TITLE.NAME", width: 130 },
    // { key: "age", titleKey: "TABLE_TITLE.AGE", width: 70 },
    // { key: "gender", titleKey: "TABLE_TITLE.GENDER", width: 90 },
    { key: "mobile", titleKey: "TABLE_TITLE.MOBILE", width: 130 },
    // { key: "district", titleKey: "TABLE_TITLE.DISTRICT_BLOCK", width: 160 },
    // { key: "blocks", titleKey: "TABLE_TITLE.BLOCK", width: 130},
    { key: "centers", titleKey: "TABLE_TITLE.CENTER", width: 180 },
    // { key: "updatedBy", titleKey: "TABLE_TITLE.UPDATED_BY", width: 160 },
    { key: "createdBy", titleKey: "TABLE_TITLE.CREATED_BY", width: 130, sortDirection: SortDirection.Ascend },
    // { key: "createdAt", titleKey: "TABLE_TITLE.CREATED_DATE", width: 160, sortDirection: SortDirection.Ascend },
    // { key: "updatedAt", titleKey: "TABLE_TITLE.UPDATED_DATE", width: 160},
    { key: "actions", titleKey: "TABLE_TITLE.ACTIONS", width: 180 , isSortable: false },
  ];

  return generateColumns(t, configs, isMobile);
};

export const getTeacherColumns = (t: any, isMobile: boolean) => {
  const configs: ColumnConfig[] = [
    { key: "name", titleKey: "TABLE_TITLE.NAME", width: 130 },
    // { key: "age", titleKey: "TABLE_TITLE.AGE", width: 70 },
    // { key: "gender", titleKey: "TABLE_TITLE.GENDER", width: 90 },
    { key: "mobile", titleKey: "TABLE_TITLE.MOBILE", width: 130 },
    // { key: "district", titleKey: "TABLE_TITLE.DISTRICT_BLOCK", width: 160 },
    // { key: "blocks", titleKey: "TABLE_TITLE.BLOCK", width: 130},
    { key: "centers", titleKey: "TABLE_TITLE.CENTER", width: 180 },
    // { key: "updatedBy", titleKey: "TABLE_TITLE.UPDATED_BY", width: 160 },
    // { key: "createdBy", titleKey: "TABLE_TITLE.CREATED_BY", width: 130, sortDirection: SortDirection.Ascend },
    // { key: "createdAt", titleKey: "TABLE_TITLE.CREATED_DATE", width: 160, sortDirection: SortDirection.Ascend },
    // { key: "updatedAt", titleKey: "TABLE_TITLE.UPDATED_DATE", width: 160},
    { key: "actions", titleKey: "TABLE_TITLE.ACTIONS", width: 180 , isSortable: false },
  ];

  return generateColumns(t, configs, isMobile);
};

export const getTLTableColumns = (t: any, isMobile: boolean) => {
  const configs: ColumnConfig[] = [
    { key: "name", titleKey: "TABLE_TITLE.NAME", width: 130 },
    { key: "age", titleKey: "TABLE_TITLE.AGE", width: 70 },
    { key: "gender", titleKey: "TABLE_TITLE.GENDER", width: 90 },
    { key: "district", titleKey: "TABLE_TITLE.DISTRICT_BLOCK", width: 150 },
    // { key: "blocks", titleKey: "TABLE_TITLE.BLOCK", width: 130 },
    { key: "updatedBy", titleKey: "TABLE_TITLE.UPDATED_BY", width: 130,  },
    { key: "createdBy", titleKey: "TABLE_TITLE.CREATED_BY", width: 130,  },
    { key: "createdAt", titleKey: "TABLE_TITLE.CREATED_DATE", width: 160, },
    { key: "updatedAt", titleKey: "TABLE_TITLE.UPDATED_DATE", width: 160, },
    { key: "actions", titleKey: "TABLE_TITLE.ACTIONS", width: 170 , isSortable: false},
  ];

  return generateColumns(t, configs, isMobile);
};

export const getCenterTableData = (t: any, isMobile: boolean) => {
  const configs: ColumnConfig[] = [
    { key: "className", titleKey: "TABLE_TITLE.NAME", width: 250 },
    // { key: "customFieldValues", titleKey: "TABLE_TITLE.TYPE", width: 130 },
    // { key: "updatedBy", titleKey: "TABLE_TITLE.UPDATED_BY", width: 130 },
    { key: "createdBy", titleKey: "TABLE_TITLE.CREATED_BY", width: 130 },
    { key: "createdAt", titleKey: "TABLE_TITLE.CREATED_DATE", width: 130 },
    // { key: "updatedAt", titleKey: "TABLE_TITLE.UPDATED_DATE", width: 130 },

    {
      key: "totalActiveMembers",
      titleKey: "TABLE_TITLE.ACTIVE_LEARNERS",
      width: 130,
    },
    {
      key: "totalArchivedMembers",
      titleKey: "TABLE_TITLE.ARCHIVED_LEARNERS",
      width: 130,
    },
    { key: "actions", titleKey: "TABLE_TITLE.ACTIONS", width: 125 },
  ];

  return generateColumns(t, configs, isMobile);
};
