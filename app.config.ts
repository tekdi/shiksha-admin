export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "";
if (!TENANT_ID) {
  console.warn('NEXT_PUBLIC_TENANT_ID is not set in the environment variables.');
}

export const FRAMEWORK_ID = process.env.NEXT_PUBLIC_FRAMEWORK_ID || "";
if (!FRAMEWORK_ID) {
  console.warn('NEXT_PUBLIC_FRAMEWORK_ID is not set in the environment variables.');
}

export const CONTENT_FRAMEWORK_ID = process.env.NEXT_PUBLIC_CONTENT_FRAMEWORK_ID || "";
if (!CONTENT_FRAMEWORK_ID) {
  console.warn('NEXT_PUBLIC_CONTENT_FRAMEWORK_ID is not set in the environment variables.');
}

