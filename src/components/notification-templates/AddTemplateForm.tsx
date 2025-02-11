import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler, FieldErrorsImpl } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Paper,
    TextareaAutosize,
} from '@mui/material';
import TemplatePreview from './TemplatePreview';
import { showToastMessage } from '../Toastify';
import Loader from '../Loader';
import { createNotificationTemplate, TemplatePayload } from '@/services/NotificationTemplateService';
import { useRouter } from 'next/router';
import { QueryKeys } from '@/utils/app.constant';
import { useQueryClient } from '@tanstack/react-query';
import { INotificationTemplate } from '@/utils/Interfaces';

// Interface for Notification Type Details
interface NotificationTypeDetails {
    subject?: string;
    body?: string;
}

// Interface for Full Form Data
interface NotificationFormData {
    // context: string;
    title: string;
    key: string;
    status: 'unpublished' | 'published';
    email: NotificationTypeDetails;
    push: NotificationTypeDetails;
    sms: NotificationTypeDetails;
}

// Notification Types
const notificationTypes = [
    { name: 'Email', value: 'email' },
    { name: 'Push', value: 'push' },
    { name: 'SMS', value: 'sms' },
];

// Sample Email Template 
const SAMPLE_EMAIL_TEMPLATE = `<p>Hello, <br/><br/>This is a sample email template. <br/><br/>Thanks, <br/>Team</p>`;

// Validation Schema
const validationSchema = yup.object().shape({
    // context: yup.string().required('Context is required'),
    title: yup.string().required('Title is required'),
    key: yup.string()
        .required('Key is required')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Key can only contain letters, numbers, underscores, and hyphens'),
    status: yup.string().oneOf(['unpublished', 'published']).required('Status is required'),

    // Custom validation to ensure at least one notification type is fully filled
    email: yup.object().shape({
        subject: yup.string().test(
            "subject-required",
            "Subject is required when body is provided",
            function (value) {
                const body = this.parent.body;
                if (body && body.trim().length > 0) {
                    return !!value && value.trim().length > 0; // Ensure subject is non-empty
                }
                return true; // If body is empty, subject is optional
            }
        ),
        body: yup.string().test(
            "body-required",
            "Body is required when subject is provided",
            function (value) {
                const subject = this.parent.subject;
                if (subject && subject.trim().length > 0) {
                    return !!value && value.trim().length > 0; // Ensure body is non-empty
                }
                return true; // If subject is empty, body is optional
            }
        ),
    }),
    push: yup.object().shape({
        subject: yup.string().test(
            "subject-required",
            "Subject is required when body is provided",
            function (value) {
                const body = this.parent.body;
                if (body && body.trim().length > 0) {
                    return !!value && value.trim().length > 0; // Ensure subject is non-empty
                }
                return true; // If body is empty, subject is optional
            }
        ),
        body: yup.string().test(
            "body-required",
            "Body is required when subject is provided",
            function (value) {
                const subject = this.parent.subject;
                if (subject && subject.trim().length > 0) {
                    return !!value && value.trim().length > 0; // Ensure body is non-empty
                }
                return true; // If subject is empty, body is optional
            }
        ),
    }),
    sms: yup.object().shape({
        subject: yup.string().test(
            "subject-required",
            "Subject is required when body is provided",
            function (value) {
                const body = this.parent.body;
                if (body && body.trim().length > 0) {
                    return !!value && value.trim().length > 0; // Ensure subject is non-empty
                }
                return true; // If body is empty, subject is optional
            }
        ),
        body: yup.string().test(
            "body-required",
            "Body is required when subject is provided",
            function (value) {
                const subject = this.parent.subject;
                if (subject && subject.trim().length > 0) {
                    return !!value && value.trim().length > 0; // Ensure body is non-empty
                }
                return true; // If subject is empty, body is optional
            }
        ),
    })
});

interface TemplateDetailsProps {
    templateDetails?: INotificationTemplate;
    isUpdate?: boolean;
}

const AddTemplateForm: React.FC<TemplateDetailsProps> = ({ templateDetails, isUpdate = false }) => {
    const [preview, setPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    // Initialize react-hook-form with validation schema
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset
    } = useForm<NotificationFormData>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            // context: 'TEST',
            title: templateDetails?.title || '',
            key: templateDetails?.key || '',
            status: templateDetails?.status || 'unpublished',
            email: { subject: templateDetails?.templates?.email?.subject || '', body: templateDetails?.templates?.email?.body || '' },
            push: { subject: templateDetails?.templates?.push?.subject || '', body: templateDetails?.templates?.push?.body || '' },
            sms: { subject: templateDetails?.templates?.sms?.subject || '', body: templateDetails?.templates?.sms?.body || '' },
        }
    });

    // Watch email body to control preview
    const emailBody = watch('email.body') || '';

    const makeAPICall = async (payload: TemplatePayload) => {
        setLoading(true);
        try {
            const response = await createNotificationTemplate(payload);
            if (response?.responseCode === 'Created') {
                showToastMessage("Template Added Successfully!", "success");
                queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_ALL_NOTIFICATION_TEMPLATE], exact: false });
                router.push('/notification-templates');
            }
        } catch (error) {
            console.error('Error in uploading data:', error);
        } finally {
            setLoading(false);
        }
    }

    // Handle form submission
    const onSubmit: SubmitHandler<NotificationFormData> = (data) => {
        // Validate: at least one template must have both subject and body filled
        const isEmailFilled = data.email.subject?.trim() && data.email.body?.trim();
        const isPushFilled = data.push.subject?.trim() && data.push.body?.trim();
        const isSmsFilled = data.sms.subject?.trim() && data.sms.body?.trim();

        if (!isEmailFilled && !isPushFilled && !isSmsFilled) {
            showToastMessage("Please fill in at least one template with both subject and body.", "warning");
            return;
        }

        let payload: TemplatePayload = {
            context: 'USER', //data.context,
            title: data.title,
            key: data.key,
            status: data.status
        }

        if (isEmailFilled) {
            payload.email = { subject: data.email.subject as string, body: data.email.body as string };
        } else if (isPushFilled) {
            payload.push = { subject: data.push.subject as string, body: data.push.body as string }
        } else {
            payload.sms = { subject: data.sms.subject as string, body: data.sms.body as string }
        }

        console.log('Form submitted:', data);
        // Typically, you would send the data to an API here
        makeAPICall(payload);

    };

    const applyEmailTemplate = () => {
        setValue('email.body', SAMPLE_EMAIL_TEMPLATE);
    };

    const handleReset = () => {
        reset();
        setPreview(false);
    };

    return (
        <>

            <Box display={'flex'} flexDirection={'row'} gap={4} justifyContent={'space-around'}>
                <Paper elevation={0} sx={{ p: 2, maxWidth: 800, mt: 4, width: '100%' }}>
                    <Typography variant="h4" gutterBottom>
                        {isUpdate ? 'Update Template' : 'Add new template'}
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* <Controller
                                name="context"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Context"
                                        fullWidth
                                        helperText={errors?.context?.message || "Context is used to group templates, e.g., TEST, USER"}
                                        error={!!errors.context}
                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                    />
                                )}
                            /> */}

                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Title"
                                        fullWidth
                                        rows={2}
                                        error={!!errors.title}
                                        helperText={errors.title?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="key"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Key"
                                        fullWidth
                                        error={!!errors.key}
                                        helperText={errors.key?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.status}>
                                        <InputLabel id="status-label">Status</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="status-label"
                                            label="Status"
                                        >
                                            <MenuItem value="unpublished">Unpublished</MenuItem>
                                            <MenuItem value="published">Published</MenuItem>
                                        </Select>
                                        {errors.status && (
                                            <Typography color="error" variant="body2">
                                                {errors.status.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />

                            {notificationTypes.map((template) => (
                                <Box
                                    key={template.value}
                                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                            {template.name} Template
                                        </Typography>

                                        {template.value === 'email' && (
                                            <>
                                                <Button
                                                    variant='outlined'
                                                    size='small'
                                                    onClick={applyEmailTemplate}
                                                >
                                                    Use Sample Template
                                                </Button>
                                                {emailBody?.length > 0 && !preview && (
                                                    <Button
                                                        sx={{
                                                            '@media (max-width: 780px)': { display: 'none' },
                                                            ml: 2
                                                        }}
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => setPreview(true)}
                                                    >
                                                        Preview
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </Box>

                                    <Controller
                                        name={`${template.value}.subject` as 'email.subject' | 'push.subject' | 'sms.subject'}
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Subject"
                                                fullWidth
                                                error={!!(errors[template.value as keyof NotificationFormData] as FieldErrorsImpl<NotificationTypeDetails>)?.subject}
                                                helperText={(errors[template.value as keyof NotificationFormData] as FieldErrorsImpl<NotificationTypeDetails>)?.subject?.message}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name={template.value === 'email' ? 'email.body' : template.value === 'push' ? 'push.body' : 'sms.body'}
                                        control={control}
                                        render={({ field }) => (
                                            <TextareaAutosize
                                                {...field}
                                                minRows={3}
                                                placeholder={`${template.name} Body`}
                                                style={{
                                                    padding: '8px',
                                                    borderColor: (errors[template.value as keyof NotificationFormData] as FieldErrorsImpl<NotificationTypeDetails>)?.body ? 'red' : '#ccc',
                                                    borderRadius: '4px',
                                                    fontFamily: 'inherit',
                                                    width: '100%'
                                                }}
                                            />
                                        )}
                                    />
                                    {(errors[template.value as keyof NotificationFormData] as FieldErrorsImpl<NotificationTypeDetails>)?.body && (
                                        <Typography
                                            color="error"
                                            variant="body2"
                                            sx={{ mt: 1 }}
                                        >
                                            {(errors[template.value as keyof NotificationFormData] as FieldErrorsImpl<NotificationTypeDetails>).body?.message}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Box>
                        <Box mt={4} display="flex" justifyContent="right" gap={2}>
                            <Button variant="outlined" onClick={handleReset}>Reset</Button>
                            <Button variant="contained" type="submit" color="primary">
                                {isUpdate ? 'Update Template' : 'Add new template'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
                {
                    preview && emailBody?.length > 0 && (
                        <Box sx={{ '@media (max-width: 780px)': { display: 'none' } }}>
                            <TemplatePreview template={emailBody} />
                        </Box>
                    )
                }
            </Box>
            {
                loading && <Loader showBackdrop={true} />
            }

        </>
    );
};

export default AddTemplateForm;