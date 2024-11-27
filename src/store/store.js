import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      pid: "",
      // state: "",
      // district: "",
      // block: "",
      isActiveYearSelected: '',
      // setPid: (newPid) => set((state) => ({ pid: newPid })),
      // setPid: (newPid) => set((state) => ({ pid: newPid })),
      // setPid: (newPid) => set((state) => ({ pid: newPid })),
      // setPid: (newPid) => set((state) => ({ pid: newPid })),
      setIsActiveYearSelected: (newYear) => set(() => ({ isActiveYearSelected: newYear })),
    }),
    {
      name: "adminAppStore",
      getStorage: () => localStorage,
    }
  )
);

export const store = {
  getState: useStore.getState,
  setState: useStore.setState,
};

export default useStore;
