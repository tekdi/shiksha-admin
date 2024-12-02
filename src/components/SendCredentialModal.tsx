import { Box, Button, Divider, Modal, Typography } from '@mui/material';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import CloseIcon from '@mui/icons-material/Close';
import { showToastMessage } from './Toastify';
import { sendCredentialService } from '@/services/NotificationService';
import { FormContextType , Role} from "@/utils/app.constant";

interface SendCredentialModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
 // isLearnerAdded?: boolean;
  userType?:string;
  handleBackAction: () => void;


}

const SendCredentialModal: React.FC<SendCredentialModalProps> = ({
  open,
  onClose,
  email,
 // isLearnerAdded,
  userType,
  handleBackAction
}) => {
  console.log(email)
  const { t } = useTranslation();
  const theme = useTheme<any>();
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '65%',
    boxShadow: 24,
    bgcolor: '#fff',
    borderRadius: '16px',
    '@media (min-width: 600px)': {
      width: '450px',
    },
  };
  // const handleAction = async () => {
  //   onClose();
  // };

  const handleBackActionForLearner = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      aria-labelledby="child-modal-title"
      aria-describedby="child-modal-description"
    >
      <Box sx={{ ...style }}>
        <Box
          display={'flex'}
          justifyContent={'space-between'}
          sx={{ padding: '18px 16px' }}
        >
          <Typography
            variant="h2"
            sx={{
              color: theme.palette.warning['A200'],
              fontSize: '14px',
            }}
            component="h2"
          >
            {t('COMMON.NEW', { role: userType })}
          </Typography>
          <CloseIcon
            sx={{
              cursor: 'pointer',
              color: theme.palette.warning['A200'],
            }}
            onClick={onClose}
          />
        </Box>
        <Divider />
        <Box
          sx={{
            padding: '18px 16px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: theme.palette.warning['400'],
              fontSize: '14px',
            }}
            component="h2"
            marginRight="30px"
          >
            {userType === Role.STUDENT
              ? t('COMMON.CREDENTIALS_EMAILED_OF_LEARNER',  { email })
              : userType === Role.TEAM_LEADER
              ? t('COMMON.CREDENTIALS_EMAILED_OF_TEAM_LEADER', { email })
              : t('COMMON.CREDENTIALS_EMAILED_OF_FACILITATOR', { email })}
          </Typography>
        </Box>

        <Box mt={1.5}>
          <Divider />
        </Box>
        <Box
          p="18px"
          display="flex"
         justifyContent="flex-end"
         gap="8px"
  alignItems="center"
        >
          {userType === Role.STUDENT ? (
            <Button
              sx={{ boxShadow: 'none', marginLeft:"45%"}}
              variant="contained"
              onClick={handleBackActionForLearner}
            
            >
              {t('COMMON.OKAY')}
            </Button>
          ) : (
            <>
              <Button
                sx={{ boxShadow: 'none' }}
                variant="outlined"
                onClick={handleBackAction}
              >
                {t('COMMON.BACK')}
              </Button>
              <Button
                variant="contained"
                type="submit"
                form="dynamic-form"
                sx={{
                  fontSize: '14px',
                  fontWeight: '500',
                  width: 'auto',
                  height: '40px',
                }}
                color="primary"
              >
                {t('COMMON.SEND_CREDENTIALS')}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default SendCredentialModal;
