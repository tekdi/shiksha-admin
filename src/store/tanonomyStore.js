/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { persist } from "zustand/middleware";

const taxonomyStore = create(
  persist(
    (set) => ({
      state: [],
      board: "",
      taxonomyMedium: "",
      taxonomyGrade: "",
      taxonomyType: "",
      taxonomySubject: "",
      resources: "",
      setState: (newState) => set((state) => ({ state: newState })),
      setBoard: (newBoard) => set((state) => ({ board: newBoard })),
      setTaxonomyMedium: (newTaxonomyMedium) =>
        set((state) => ({ taxonomyMedium: newTaxonomyMedium })),
      setTaxonomyGrade: (newTaxonomyGrade) =>
        set((state) => ({ taxonomyGrade: newTaxonomyGrade })),
      setTaxonomyType: (newTaxonomyType) =>
        set((state) => ({ taxonomyType: newTaxonomyType })),
      setTaxonomySubject: (newTaxonomySubject) =>
        set((state) => ({ taxonomySubject: newTaxonomySubject })),
      setResources: (newResources) =>
        set((state) => ({ resources: newResources })),
    }),
    {
      name: "taxonomy",
      getStorage: () => localStorage,
    }
  )
);

export default taxonomyStore;
