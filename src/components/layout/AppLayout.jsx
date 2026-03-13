import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Sidebar from './Sidebar';
import ChatBot from '../shared/ChatBot';

export default function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Outlet />
          </Box>
        </Box>
      </Container>
      <ChatBot />
    </Box>
  );
}
