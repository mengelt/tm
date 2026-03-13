import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Paper,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const NAV_WIDTH = 240;

const navItems = [
  { label: 'My Submissions', path: '/customer', icon: <DashboardIcon /> },
  { label: 'Review Queue', path: '/team', icon: <GroupsIcon /> },
];

export default function Sidebar() {
  const { user, role, toggleRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Paper
      elevation={0}
      sx={{
        width: NAV_WIDTH,
        minWidth: NAV_WIDTH,
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 24,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ShieldIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="primary" lineHeight={1.2}>
            TMR Hub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Threat Model Review
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, pt: 1, pb: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={selected}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'white' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
            <PersonIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={role === UserRole.TM_TEAM}
              onChange={toggleRole}
              size="small"
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              {role === UserRole.TM_TEAM ? 'TM Team View' : 'Customer View'}
            </Typography>
          }
          sx={{ ml: 0 }}
        />
      </Box>
    </Paper>
  );
}

export { NAV_WIDTH };
