export interface AuthenticatedUser {
  userId: string;
  role: 'nurse' | 'doctor' | 'nutritionist' | 'pharmacist' | 'ministry' | 'administrator' | 'guardian';
  facilityId?: string;
}
