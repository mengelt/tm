import {
  AppBar,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export default function Header() {
  const { user, role, toggleRole } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" color="text.primary">
          {role === UserRole.CUSTOMER ? 'Customer Portal' : 'TM Team Dashboard'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={role === UserRole.TM_TEAM}
                onChange={toggleRole}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                {role === UserRole.TM_TEAM ? 'TM Team View' : 'Customer View'}
              </Typography>
            }
          />
          <Chip
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
              </Avatar>
            }
            label={user.name}
            variant="outlined"
            size="small"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
