import { post } from './RestClient';

export const getNotificationTemplates = async ({
    context
}: { context: string }): Promise<any> => {
    const apiUrl: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/notification-templates/list`;
    try {
        const response = await post(apiUrl, {
            filters: {
                context,
            }
        });
        return response?.data?.result;
    } catch (error) {
        console.error('error in getting Notification Templates', error);

        throw error;
    }
};


