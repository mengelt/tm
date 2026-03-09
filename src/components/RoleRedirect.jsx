import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export default function RoleRedirect() {
  const { role } = useAuth();
  return (
    <Navigate
      to={role === UserRole.CUSTOMER ? '/customer' : '/team'}
      replace
    />
  );
}
