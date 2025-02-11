export interface TenantConfig {
  CHANNEL_ID: string;
  CONTENT_FRAMEWORK: string;
  COLLECTION_FRAMEWORK: string;
}

/**
 * Fetches Tenant Configuration dynamically.
 * - Supports both client & server environments
 * - Accepts `tenantId` explicitly (optional)
 */
export const fetchTenantConfig = async (tenantId?: string, req?: any): Promise<TenantConfig | null> => {
  try {
    // If `tenantId` is not provided, get it dynamically from TenantService
    const resolvedTenantId = tenantId

    if (!resolvedTenantId) {
      console.error("Tenant ID is required but not found");
      return null;
    }

    // Fetch from API with the tenantId
    const response = await fetch(`/api/tenantConfig?tenantId=${resolvedTenantId}`, {
      method: "GET",
      credentials: "include", // Ensures cookies are sent in client requests
    });

    if (!response.ok) throw new Error("Tenant not found");

    const { CHANNEL_ID, CONTENT_FRAMEWORK, COLLECTION_FRAMEWORK } = await response.json();
    return { CHANNEL_ID, CONTENT_FRAMEWORK, COLLECTION_FRAMEWORK };
  } catch (error) {
    console.error("Error fetching tenant config:", error);
    return null;
  }
};
