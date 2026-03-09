import { createContext, useContext, useState, useCallback } from 'react';
import { UserRole } from '../types';

const mockUsers = {
  [UserRole.CUSTOMER]: {
    id: 'usr-001',
    name: 'Jane Mitchell',
    email: 'jane.mitchell@acmecorp.com',
    role: UserRole.CUSTOMER,
  },
  [UserRole.TM_TEAM]: {
    id: 'usr-100',
    name: 'David Chen',
    email: 'david.chen@security-team.com',
    role: UserRole.TM_TEAM,
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(UserRole.CUSTOMER);

  const user = mockUsers[role];

  const toggleRole = useCallback(() => {
    setRole((prev) =>
      prev === UserRole.CUSTOMER ? UserRole.TM_TEAM : UserRole.CUSTOMER
    );
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
