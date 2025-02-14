import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DataType } from 'ka-table/enums';
import KaTableComponent from '../KaTableComponent';
import { deleteNotificationTemplate, getNotificationTemplates } from '@/services/NotificationTemplateService';
import { ITableProps } from 'ka-table';
import { QueryKeys } from '@/utils/app.constant';
import { showToastMessage } from '../Toastify';
import ConfirmationModal from '../ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { useMediaQuery } from "@mui/material";
import { Theme } from "@mui/system";
import { getNotificationTableData } from '@/data/tableColumns';

interface TemplateTableProps {
    searchKey: string;
    context: string;
}

const TemplateTable: React.FC<TemplateTableProps> = ({ searchKey = '', context }) => {
    const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
    

    const [confirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false);
    const [templateToBeDeleted, setTemplateToBeDeleted] = useState<any>(null);

    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const router = useRouter();

    // Fetch data using TanStack Query
    const { data: templates = [], isLoading, isError, error } = useQuery({
        queryKey: [QueryKeys.GET_ALL_NOTIFICATION_TEMPLATE, context],
        queryFn: async () => {
            const response = await getNotificationTemplates({ context });
            return Array.isArray(response) ? response : [];
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1, // Retry once on failure
    });

    // Filter templates based on searchKey
    const filteredTemplates = useMemo(() => {
        return searchKey
            ? templates.filter(template =>
                template.title.toLowerCase().includes(searchKey.toLowerCase())
            )
            : templates;
    }, [searchKey, templates]);

    const deleteTemplate = async (templateId: number) => {
        try {
            // Call deleteNotificationTemplate API
            const response = await deleteNotificationTemplate(templateId);
            queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_ALL_NOTIFICATION_TEMPLATE], exact: false });
            console.log('Template deleted:', response);
            showToastMessage(t("NOTIFICATION.TEMPLATE_DELETED_SUCCESS", {
                templateId: templateId,
              }), 'success');

        } catch (error) {
            console.error('Error deleting template', error);
            showToastMessage('Error deleting template', 'error');
        }
    }

    const onEdit = (template: any) => {
        console.log('Edit template with ID:', template);
        router.push(`/notification-templates/update/${template.key}`)
        router.push({
            pathname: `/notification-templates/update/${template.key}`,
            query: {
              context: context,
            }
          });

    }

    const onDelete = async (template: any) => {
        console.log('Delete template with ID:', template.actionId);
        setTemplateToBeDeleted(template);
        setConfirmationModalOpen(true);
    }

    if (isLoading) return <p>Loading...</p>
    if (isError) return <p>Error loading data.</p>

    return (
        <>
            <KaTableComponent              columns={getNotificationTableData(t, isMobile)}
 data={filteredTemplates} rowKeyField={'actionId'} extraActions={[]} paginationEnable={false} onEdit={onEdit} onDelete={onDelete} />
            {
                confirmationModalOpen &&
                <ConfirmationModal
                    message={t("NOTIFICATION.DELETE_TEMPLATE_ALERT")}
                    handleAction={() => deleteTemplate(templateToBeDeleted?.actionId)}
                    buttonNames={{ primary: t("COMMON.YES"), secondary: t("COMMON.CANCEL") }
                    }
                    handleCloseModal={() => setConfirmationModalOpen(false)}
                    modalOpen={confirmationModalOpen}
                />
            }
        </>
    )
};

export default TemplateTable;   
