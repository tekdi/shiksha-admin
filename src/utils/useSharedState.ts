import { create } from "zustand";

const useSubmittedButtonStore = create((set) => ({
  submittedButtonStatus: false,
  setSubmittedButtonStatus: (status: boolean) =>
    set({ submittedButtonStatus: status }),

  createCenterStatus: false,
  setCreateCenterStatus: (status: boolean) =>
    set({ createCenterStatus: status }),

  reassignButtonStatus: false,
  setReassignButtonStatus: (status: boolean) =>
    set({ reassignButtonStatus: status }),
  adminInformation: {},
  setAdminInformation: (data: any) => set({ adminInformation: data }),
  //  setSubmittedButtonStatus: (status: boolean) => set({ submittedButtonStatus: status }),
  userEnteredEmail: "",
  noError: false,
  setNoError: (data: boolean) => set({ noError: data }),
  setUserEnteredEmail: (status: string) => set({ userEnteredEmail: status }),
  shouldFetch: true,
  setShouldFetch: (data: boolean) => set({ shouldFetch: data }),
  selectedBlockStore: "",
  setSelectedBlockStore: (status: string) =>
    set({ selectedBlockStore: status }),

  selectedDistrictStore: "",
  setSelectedDistrictStore: (status: string) =>
    set({ selectedDistrictStore: status }),

  selectedCenterStore: "",
  setSelectedCenterStore: (status: string) =>
    set({ selectedCenterStore: status }),
}));

export default useSubmittedButtonStore;
