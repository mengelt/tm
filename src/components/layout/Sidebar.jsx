import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const DRAWER_WIDTH = 260;

export default function Sidebar() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const customerItems = [
    { label: 'My Submissions', path: '/customer', icon: <DashboardIcon /> },
    { label: 'New Request', path: '/customer/new', icon: <AddCircleOutlineIcon /> },
  ];

  const teamItems = [
    { label: 'Review Queue', path: '/team', icon: <GroupsIcon /> },
  ];

  const items = role === UserRole.CUSTOMER ? customerItems : teamItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <Toolbar
        sx={{
          px: 2.5,
          gap: 1.5,
        }}
      >
        <ShieldIcon color="primary" sx={{ fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="primary" lineHeight={1.2}>
            TMR Hub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Threat Model Review
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, pt: 1 }}>
        {items.map((item) => {
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
    </Drawer>
  );
}

export { DRAWER_WIDTH };
