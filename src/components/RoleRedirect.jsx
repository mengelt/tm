import { Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export default function RoleRedirect() {
  const { role } = useAuth();
  return (
    <Redirect
      to={role === UserRole.CUSTOMER ? '/customer' : '/team'}
    />
  );
}
