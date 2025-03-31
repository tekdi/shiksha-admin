import { getUserDetailsInfo } from "@/services/UserList";
import { QueryKeys } from "@/utils/app.constant";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { firstLetterInUpperCase } from "./../utils/Helper";

const UserNameCell = ({ userId }: { userId: string }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUserName = async (userId: string) => {
      try {
        const userDetails = await queryClient.fetchQuery({
          queryKey: [QueryKeys.USER_READ, userId],
          queryFn: () => getUserDetailsInfo(userId, false),
        });

        const name = userDetails?.userData?.firstName;
        const lastName = userDetails?.userData?.lastName;
        setUserLastName(lastName);
        setUserName(name);
      } catch (error) {
        console.error("Error in fetching user name:", error);
      }
    };

    getUserName(userId);
  }, [userId]);

  if (userName === null) {
    return (
      <div>
        <Box sx={{ display: "flex" }}>
          <CircularProgress
            color="inherit"
            size={20}
            thickness={4}
            value={100}
          />
        </Box>
      </div>
    );
  }

  return (
    <div>
      {userName ? (
        `${firstLetterInUpperCase(userName)} ${firstLetterInUpperCase(userLastName)}`
      ) : (
        <Typography>-</Typography>
      )}
    </div>
  );
};

export default UserNameCell;
