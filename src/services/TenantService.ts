import Cookies from "js-cookie";
import { fetchTenantConfig, TenantConfig } from "@/utils/fetchTenantConfig";

class TenantService {
  private static instance: TenantService;
  private tenantId: string = "";
  private tenantConfig: TenantConfig | null = null;

  private constructor() {
    const tenantId = Cookies.get("tenantId");
    if (tenantId) {
      this.tenantId = tenantId;
    }
  }

  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  public getTenantId(): string {
    return this.tenantId;
  }

  public setTenantId(tenantId: string) {
    this.tenantId = tenantId;
    Cookies.set("tenantId", tenantId);
  }

  public async getTenantConfig(): Promise<TenantConfig> {
    if (!this.tenantConfig) {
      this.tenantConfig = await fetchTenantConfig(this.tenantId);
    }
    if (!this.tenantConfig) {
      throw new Error("Failed to fetch tenant configuration");
    }
    return this.tenantConfig;
  }
}

export default TenantService.getInstance();
