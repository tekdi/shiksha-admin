import BackButtonWithLabel from "@/components/common/BackButtonWithLabel";
import AddTemplateForm from "@/components/notification-templates/AddTemplateForm";
import { getNotificationTemplateByKey } from "@/services/NotificationTemplateService";
import { QueryKeys } from "@/utils/app.constant";
import { INotificationTemplate } from "@/utils/Interfaces";
import { useQuery } from "@tanstack/react-query";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useTranslation } from 'next-i18next';

const UpdateTemplate: React.FC = () => {
    const router = useRouter();
    const { key } = router.query;
    const { context } = router.query; 

    const { t } = useTranslation();

    // Fetch data using TanStack Query
    const { data: templateResponse = null, isLoading, isError, error } = useQuery({
        queryKey: [QueryKeys.GET_NOTIFICATION_TEMPLATE_BY_KEY, { key }],
        queryFn: async () => {
            if (typeof key !== 'string') {
                // router.push('/notification-templates');
                throw new Error('Invalid key');
            }
            let response;
            if(context)
            {
             response = await getNotificationTemplateByKey({ key,context: context.toString() });
            }
            else{
                response = await getNotificationTemplateByKey({ key});

            }
            return response;
           
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1, // Retry once on failure
    });

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading data.</p>;
    return (
        <>

            {templateResponse?.length > 0 ?
                <>
                    <BackButtonWithLabel label={ t('NOTIFICATION.UPDATE_NOTIFICATION_TEMPLATE')} />
                    <AddTemplateForm templateDetails={templateResponse[0] as INotificationTemplate} isUpdate={true} />
                </>
                : null}
        </>)
}

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: "blocking",
    };
}

export async function getStaticProps({ locale, params }: any) {
    const { key } = params;

    return {
        props: {
            key,
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}

export default UpdateTemplate;
