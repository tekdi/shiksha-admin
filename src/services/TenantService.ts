import Cookies from "js-cookie";

class TenantService {
  private static instance: TenantService;
  private tenantId: string = '';

  private constructor() {
    const tenantId = Cookies.get("tenantId");
    if (tenantId) {
      this.tenantId = tenantId;
    }
  }

  // Singleton pattern to ensure a single instance
  public static getInstance(): TenantService {
    if (!TenantService.instance) {
        TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  public getTenantId() {
    return this.tenantId;
  }

  public setTenantId(tenantId: string) {
    this.tenantId = tenantId;
    Cookies.set("tenantId", tenantId);
  }
}

export default TenantService.getInstance();
