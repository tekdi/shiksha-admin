import {  sendCredentialService } from "@/services/NotificationService";
import { getUserDetailsInfo } from "@/services/UserList";
import { useCallback } from "react";

const useNotification = () => {
  const getNotification = useCallback(async (userId: any, key: any, replacements?:any) => {
    try {
      //   const userId = localStorage.getItem("userId");

      // if (!userId) {
      //   console.error("User ID is not found in local storage.");
      //   return;
      // } 
      

      const userDetails = await getUserDetailsInfo(userId, false); 

      const deviceIds = userDetails?.userData?.deviceId;

     

      if (deviceIds && deviceIds.length > 0) {
        const recipients = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
        const result = await sendCredentialService({
          isQueue: false,
          context: "USER",
          key: key,
        replacements: replacements,
          push: {
            receipients: recipients, 
          },
        });

        console.log("Notification sent successfully:", result);
      } else {
        console.log("No deviceId found in user details.");
      }
    } catch (error) {
      console.error("Error in getNotification:", error);
    }
  }, []);

  return { getNotification };
};

export default useNotification;
