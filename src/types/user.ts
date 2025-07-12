export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'NURSE' | 'PARENT';
  isActive: boolean;
  createdAt?: string;
  deletedAt?: string;
  deleteReason?: string;
}