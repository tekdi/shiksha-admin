import React, { useState } from "react";
import {
  useForm,
  Controller,
  SubmitHandler,
  FieldErrorsImpl,
} from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
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
  Grid,
} from "@mui/material";
import TemplatePreview from "./TemplatePreview";
import { showToastMessage } from "../Toastify";
import Loader from "../Loader";
import {
  createNotificationTemplate,
  TemplatePayload,
  updateNotificationTemplate
} from "@/services/NotificationTemplateService";
import { useRouter } from "next/router";
import { QueryKeys } from "@/utils/app.constant";
import { useQueryClient } from "@tanstack/react-query";
import { INotificationTemplate } from "@/utils/Interfaces";
import { useTranslation } from 'next-i18next';
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
  status: "unpublished" | "published";
  email: NotificationTypeDetails;
  push: NotificationTypeDetails;
  sms: NotificationTypeDetails;
}

// Notification Types
const notificationTypes = [
  { name: "Email", value: "email" },
  { name: "Push", value: "push" },
  { name: "SMS", value: "sms" },
];

// Sample Email Template
const SAMPLE_EMAIL_TEMPLATE = `<!DOCTYPE html><html> <head> <meta charset='UTF-8' /> <meta name='viewport' content='width=device-width, initial-scale=1.0' /> <title>Email Notification</title> </head> <body style=' font-family: Arial, sans-serif; margin: 0; padding: 30px 0px; background-color: #f5f5f5; ' > <table class='email-container' cellspacing='0' cellpadding='0' style=' width: 100%; border-radius: 15px; max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #ddd; ' > <tr> <td class='email-header' style='text-align: center; padding: 20px'> <img src='https://prahtam-images-data.s3.ap-south-1.amazonaws.com/image1056.png' alt='Pratham Logo' /> </td> </tr> <tr> <td> <hr class='divider' style='margin: 0; border: none; border-top: 3px solid #fbb03b' /> </td> </tr> <tr> <td class='email-body' style='padding: 20px'> <h1 class='email-title' style='font-size: 22px; color: #1f1b13; font-weight: bold' > Your Credentials for SCP Facilitator's Account </h1> <p class='email-text' style='font-size: 16px; color: #1f1b13; line-height: 1.6' > Dear {FirstName},<br />We are pleased to inform you that your account has been successfully created. Below are the login details: </p> <div class='email-highlight' style=' background-color: #f8efe7; border-left: 4px solid #fbb03b; padding: 10px; margin: 20px 0; border-radius: 8px; font-size: 14px; color: #333; line-height: 1.5; ' > <div> <div style='color: #4a4640; font-size: 12px; font-weight: 400'> Username: {UserName} </div> <div style=' color: #4a4640; font-size: 12px; font-weight: 400; margin-top: 5px; ' > Password: {Password} </div> </div> </div> <div> <p style='font-size:16px;color:#1f1b13;line-height:1.6;'> Please <a href='{appUrl}' style='color:#0d599e;font-weight:bold;text-decoration:none' target='_blank'>click here</a> to log in. We recommend resetting your password after your first login. </p> </div> </td> </tr> <tr> <td class='email-footer' style=' background-color: #f3edf7; padding: 20px; text-align: center; font-size: 12px; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; ' > <p style=' font-size: 12px; color: #635e57; margin-bottom: 15px; font-weight: 400; ' > Pratham is an innovative learning organization created to improve the quality of education in India. </p> <div class='social-icons' style='margin: 15px 0'> <a href='https://www.linkedin.com/company/pratham/' style='margin: 0 5px' ><img src='https://prahtam-images-data.s3.ap-south-1.amazonaws.com/linkdIn.png' alt='LinkedIn' style='width: 24px; height: 24px' /></a> <a href='https://www.facebook.com/PrathamEducationFoundation' style='margin: 0 5px' ><img src='https://prahtam-images-data.s3.ap-south-1.amazonaws.com/facebooklogo.png' alt='Facebook' style='width: 24px; height: 24px' /></a> <a href='https://www.instagram.com/prathameducation' style='margin: 0 5px' ><img src='https://prahtam-images-data.s3.ap-south-1.amazonaws.com/instagramlogo.png' alt='Instagram' style='width: 24px; height: 24px' /></a> <a href='http://www.youtube.com/@PrathamEducationFoundation' style='margin: 0 5px' ><img src='https://prahtam-images-data.s3.ap-south-1.amazonaws.com/youtube-iconlogo.png' alt='YouTube' style='width: 24px; height: 24px' /></a> <a href='https://x.com/Pratham_India' style='margin: 0 5px' ><img src='https://prahtam-images-data.s3.ap-south-1.amazonaws.com/twitter-logo.png' alt='Twitter' style='width: 24px; height: 24px' /></a> </div> <p style=' line-height: 1.5; font-size: 12px; color: #635e57; margin-top: 10px; line-height: 1.5; font-weight: 400; ' > Y.B. Chavan Center, 4th Floor,<br /> Gen. J. Bhosale Marg, Nariman Point<br /> Mumbai, Maharashtra - 400021 </p> </td> </tr> </table> </body></html>`;
// Validation Schema
const validationSchema = yup.object().shape({
  // context: yup.string().required('Context is required'),
  title: yup.string().required("Title is required"),
  key: yup
    .string()
    .required("Key is required")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Key can only contain letters, numbers, underscores, and hyphens"
    ),
  status: yup
    .string()
    .oneOf(["unpublished", "published"])
    .required("Status is required"),

  // Custom validation to ensure at least one notification type is fully filled
  email: yup.object().shape({
    subject: yup
      .string()
      .test(
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
    body: yup
      .string()
      .test(
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
    subject: yup
      .string()
      .test(
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
    body: yup
      .string()
      .test(
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
    subject: yup
      .string()
      .test(
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
    body: yup
      .string()
      .test(
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
});

interface TemplateDetailsProps {
  templateDetails?: INotificationTemplate;
  isUpdate?: boolean;
}

const AddTemplateForm: React.FC<TemplateDetailsProps> = ({
  templateDetails,
  isUpdate = false,
}) => {
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  // Initialize react-hook-form with validation schema
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<NotificationFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      // context: 'TEST',
      title: templateDetails?.title || "",
      key: templateDetails?.key || "",
      status: templateDetails?.status || "unpublished",
      email: {
        subject: templateDetails?.templates?.email?.subject || "",
        body: templateDetails?.templates?.email?.body || "",
      },
      push: {
        subject: templateDetails?.templates?.push?.subject || "",
        body: templateDetails?.templates?.push?.body || "",
      },
      sms: {
        subject: templateDetails?.templates?.sms?.subject || "",
        body: templateDetails?.templates?.sms?.body || "",
      },
    },
  });

  // Watch email body to control preview
  const emailBody = watch("email.body") || "";

  const makeAPICall = async (payload: TemplatePayload) => {
    setLoading(true);
      try {
        let response;
        if (isUpdate) {
            delete (payload as { key?: string }).key;
            response = await updateNotificationTemplate(templateDetails?.actionId as number, payload);
        } else {
            response = await createNotificationTemplate(payload);
        }

        console.log("response", response);
        if (response?.responseCode === 'Created') {
            showToastMessage(t("NOTIFICATION.TEMPLATE_ADDED_SUCCESS"), "success");
        } else if (response?.responseCode === "OK") {
            showToastMessage(t("NOTIFICATION.TEMPLATE_UPDATED_SUCCESS"), "success");
        }        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GET_ALL_NOTIFICATION_TEMPLATE],
          exact: false,
        });
        router.push("/notification-templates");
      }
     catch (error) {
      console.error("Error in uploading data:", error);
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
        showToastMessage(t("NOTIFICATION.PLEASE_FILL_REQUIRED_FIELDS"), "warning");
      return;
    }

    let payload: TemplatePayload = {
      context: "USER", //data.context,
      title: data.title,
      key: data.key,
      status: data.status,
    };

    if (isEmailFilled) {
      payload.email = {
        subject: data.email.subject as string,
        body: data.email.body as string,
      };
    } else if (isPushFilled) {
      payload.push = {
        subject: data.push.subject as string,
        body: data.push.body as string,
      };
    } else {
      payload.sms = {
        subject: data.sms.subject as string,
        body: data.sms.body as string,
      };
    }

    console.log("Form submitted:", data);
    // Typically, you would send the data to an API here
    makeAPICall(payload);
  };

  const applyEmailTemplate = () => {
    setValue("email.body", SAMPLE_EMAIL_TEMPLATE);
  };

  const handleReset = () => {
    reset();
    setPreview(false);
  };

  return (
    <>
      <Grid container spacing={2}>
              <Grid xs={preview ? 8 :12} item>
          <Box
            sx={{
              mt: 4,
              boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
              borderRadius: "16px",
            }}
          >
                      <Box sx={{ p: 2, height: 'calc(100vh - 248px)', overflowY:'auto' }}>
              <Typography variant="h4" gutterBottom>
                {isUpdate ? "Update Template" : "Add new template"}
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 4 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                        <InputLabel id="status-label">{t("FORM.STATUS")}</InputLabel>
                        <Select
                          {...field}
                          labelId="status-label"
                          label="Status"
                        >
                          <MenuItem value="unpublished">{t("NOTIFICATION.UNPUBLISHED")}</MenuItem>
                          <MenuItem value="published">{t("NOTIFICATION.PUBLISHED")}</MenuItem>
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
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {template.name}{t("NOTIFICATION.TEMPLATE")}                                                    
                        </Typography>

                        {template.value === "email" && (
                          <>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={applyEmailTemplate}
                            >
                                                    {t("NOTIFICATION.USE_SAMPLE_TEMPLATE")}                            </Button>
                            {emailBody?.length > 0 && !preview && (
                              <Button
                                sx={{
                                  "@media (max-width: 780px)": {
                                    display: "none",
                                  },
                                  ml: 2,
                                }}
                                variant="outlined"
                                size="small"
                                onClick={() => setPreview(true)}
                              >
                                                     {t("NOTIFICATION.PREVIEW")}                               </Button>
                            )}
                          </>
                        )}
                      </Box>

                      <Controller
                        name={
                          `${template.value}.subject` as
                            | "email.subject"
                            | "push.subject"
                            | "sms.subject"
                        }
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Subject"
                            fullWidth
                            error={
                              !!(
                                errors[
                                  template.value as keyof NotificationFormData
                                ] as FieldErrorsImpl<NotificationTypeDetails>
                              )?.subject
                            }
                            helperText={
                              (
                                errors[
                                  template.value as keyof NotificationFormData
                                ] as FieldErrorsImpl<NotificationTypeDetails>
                              )?.subject?.message
                            }
                          />
                        )}
                      />

                      <Controller
                        name={
                          template.value === "email"
                            ? "email.body"
                            : template.value === "push"
                              ? "push.body"
                              : "sms.body"
                        }
                        control={control}
                        render={({ field }) => (
                          <TextareaAutosize
                            {...field}
                            minRows={3}
                            placeholder={`${template.name} Body`}
                            style={{
                              padding: "8px",
                              borderColor: (
                                errors[
                                  template.value as keyof NotificationFormData
                                ] as FieldErrorsImpl<NotificationTypeDetails>
                              )?.body
                                ? "red"
                                : "#ccc",
                              borderRadius: "4px",
                              fontFamily: "inherit",
                              // width: '100%'
                            }}
                          />
                        )}
                      />
                      {(
                        errors[
                          template.value as keyof NotificationFormData
                        ] as FieldErrorsImpl<NotificationTypeDetails>
                      )?.body && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {
                            (
                              errors[
                                template.value as keyof NotificationFormData
                              ] as FieldErrorsImpl<NotificationTypeDetails>
                            ).body?.message
                          }
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
                <Box mt={4} display="flex" justifyContent="right" gap={2}>
                  <Button variant="outlined" onClick={handleReset}>
                  {t("NOTIFICATION.RESET")}
                  </Button>
                  <Button variant="contained" type="submit" color="primary">
                  {isUpdate ? t("NOTIFICATION.UPDATE_TEMPLATE") : t("NOTIFICATION.ADD_TEMPLATE")}                  </Button>
                </Box>
              </form>
            </Box>
          </Box>
        </Grid>
              <Grid xs={preview ? 4 : 0} item>
          <Box sx={{display:'flex', justifyContent:'center'}}>
                      {preview && emailBody?.length > 0 && (
                          <Box sx={{ "@media (max-width: 780px)": { display: "none" } }}>
                              <TemplatePreview template={emailBody} />
                          </Box>
                      )}
          </Box>
        </Grid>
      </Grid>
      {loading && <Loader showBackdrop={true} />}
    </>
  );
};

export default AddTemplateForm;