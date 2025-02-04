import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataType } from 'ka-table/enums';
import KaTableComponent from '../KaTableComponent';
import { getNotificationTemplates } from '@/services/NotificationTemplateService';

interface TemplateTableProps {
    searchKey: string;
}

const TemplateTable: React.FC<TemplateTableProps> = ({ searchKey = '' }) => {
    const columns = [
        { key: 'actionId', title: 'ID', dataType: DataType.Number, width: 50 },
        { key: 'title', title: 'TITLE', dataType: DataType.String, width: 150 },
        { key: 'key', title: 'KEY', dataType: DataType.String, width: 130 },
        { key: 'context', title: 'CONTEXT', dataType: DataType.String, width: 80 },
        { key: 'status', title: 'STATUS', dataType: DataType.String, width: 130 },
        { key: 'createdBy', title: 'CREATED BY', dataType: DataType.String, width: 130 },
        { key: 'actions', title: 'ACTIONS', dataType: DataType.String, width: 125 }
    ];

    // Fetch data using TanStack Query
    const { data: templates = [], isLoading, isError } = useQuery({
        queryKey: ['notificationTemplates'],
        queryFn: async () => {
            const response = await getNotificationTemplates({ context: 'USER' });
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

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading data.</p>;

    return <KaTableComponent columns={columns} data={filteredTemplates} extraActions={[]} paginationEnable={false} />;
};

export default TemplateTable;
