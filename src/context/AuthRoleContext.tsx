import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'STAFF';

interface AuthRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canViewCostPrice: boolean;
  canViewProfitMetrics: boolean;
  canModifyInventory: boolean;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const AuthRoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('ADMIN');

  const value: AuthRoleContextType = {
    role,
    setRole,
    canViewCostPrice: role === 'ADMIN',
    canViewProfitMetrics: role === 'ADMIN',
    canModifyInventory: true, // Both Staff and Admin can adjust quantities
  };

  return (
    <AuthRoleContext.Provider value={value}>
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
