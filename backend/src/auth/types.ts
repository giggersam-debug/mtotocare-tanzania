export interface AuthenticatedUser {
  userId: string;
  role: 'nurse' | 'doctor' | 'nutritionist' | 'pharmacist' | 'ministry' | 'guardian';
  facilityId?: string;
}
