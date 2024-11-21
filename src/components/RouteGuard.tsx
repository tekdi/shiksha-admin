import { Role, RoleId } from "@/utils/app.constant";
import { useRouter } from "next/router";
import { useEffect } from "react";

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminInfo = localStorage.getItem("adminInfo");

    if (!token || !adminInfo) {
      if (router.pathname !== "/login" && router.pathname !== "/logout") {
        if (typeof window !== 'undefined' && window.localStorage) {
          // Specify the keys you want to keep
          const keysToKeep = [
            'preferredLanguage',
            'mui-mode',
            'mui-color-scheme-dark',
            'mui-color-scheme-light',
            'hasSeenTutorial',
          ];
          // Retrieve the values of the keys to keep
          const valuesToKeep: { [key: string]: any } = {};
          keysToKeep.forEach((key: string) => {
            valuesToKeep[key] = localStorage.getItem(key);
          });
    
          // Clear all local storage
          localStorage.clear();
    
          // Re-add the keys to keep with their values
          keysToKeep.forEach((key: string) => {
            if (valuesToKeep[key] !== null) {
              // Check if the key exists and has a value
              localStorage.setItem(key, valuesToKeep[key]);
            }
          });
        }
        router.push("/logout");
      }
      return;
    }

    const user = JSON.parse(adminInfo);

    const allowedPaths = ["/workspace/content/create","/course-planner", "/subjectDetails","/stateDetails"];
    const isWorkspaceContent = router.pathname.startsWith("/workspace/content");
    const isCoursePlannerContent = router.pathname.startsWith("/course-planner")||router.pathname.startsWith("/subjectDetails")||router.pathname.startsWith("/stateDetails")||router.pathname.startsWith("/upload-editor")||router.pathname.startsWith("/sunbirdPlayers")||router.pathname.startsWith("/editor")||router.pathname.startsWith("/collection");


    if ((user.role === Role.SCTA ||user.role === Role.CCTA)&& !(allowedPaths.includes(router.pathname) || isWorkspaceContent || isCoursePlannerContent)) {
      if (router.pathname !== "/login" && router.pathname !== "/logout") {
        if (typeof window !== 'undefined' && window.localStorage) {
          // Specify the keys you want to keep
          const keysToKeep = [
            'preferredLanguage',
            'mui-mode',
            'mui-color-scheme-dark',
            'mui-color-scheme-light',
            'hasSeenTutorial',
          ];
          // Retrieve the values of the keys to keep
          const valuesToKeep: { [key: string]: any } = {};
          keysToKeep.forEach((key: string) => {
            valuesToKeep[key] = localStorage.getItem(key);
          });
    
          // Clear all local storage
          // localStorage.clear();
    
          // // Re-add the keys to keep with their values
          // keysToKeep.forEach((key: string) => {
          //   if (valuesToKeep[key] !== null) {
          //     // Check if the key exists and has a value
          //     localStorage.setItem(key, valuesToKeep[key]);
          //   }
          // });
        }
        router.push("/unauthorized");
      }
    }
  }, [router.pathname]);

  return <>{children}</>;
};

export default RouteGuard;
