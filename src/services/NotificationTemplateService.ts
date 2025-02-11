import { deleteApi, patch, post } from './RestClient';

interface TemplateTypeDetails {
    subject: string;
    body: string;
}

export interface TemplatePayload {
    context: string;
    title: string;
    key: string;
    status: string;
    email?: TemplateTypeDetails;
    sms?: TemplateTypeDetails;
    push?: TemplateTypeDetails;
}

const API_URL: string = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/notification-templates`;

export const getNotificationTemplates = async ({ context }: { context: string }): Promise<any> => {
    try {
        const response = await post(`${API_URL}/list`, {
            filters: {
                context,
            }
        });
        return response?.data?.result?.sort((a: any, b: any) => a.actionId - b.actionId).map((template: any) => ({
            ...template,
            templateType: Object.keys(template.templates)
        }));
    } catch (error) {
        console.error('error in getting Notification Templates', error);

        throw error;
    }
};


export const getNotificationTemplateByKey = async ({ key, context = 'USER' }: { key: string, context?: string }): Promise<any> => {
    try {
        const response = await post(`${API_URL}/list`, {
            filters: { key, context }
        });
        return response?.data?.result?.sort((a: any, b: any) => a.actionId - b.actionId).map((template: any) => ({
            ...template,
            templateType: Object.keys(template.templates)
        }));
    } catch (error) {
        console.error('error in getting Notification Templates', error);

        throw error;
    }
};

export const createNotificationTemplate = async (payload: TemplatePayload): Promise<any> => {
    try {
        const response = await post(API_URL, payload);
        return response?.data;
    } catch (error) {
        console.error('error in creating Notification Template', error);
        throw error;
    }
};

export const updateNotificationTemplate = async (templateId: number, payload: Partial<TemplatePayload>): Promise<any> => {
    try {
        const response = await patch(`${API_URL}/${templateId}`, payload);
        return response?.data;
    } catch (error) {
        console.error('error in updating Notification Template', error);

        throw error;
    }
};

export const deleteNotificationTemplate = async (templateId: number): Promise<any> => {
    try {
        const response = await deleteApi(`${API_URL}/${templateId}`);
        return response?.data;
    } catch (error) {
        console.error('error in deleting Notification Template', error);

        throw error;
    }
};



