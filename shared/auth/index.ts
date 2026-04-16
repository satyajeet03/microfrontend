export type UserRole = 'citizen' | 'operator' | 'admin';

export type PortalUser = {
  id: string;
  name: string;
  role: UserRole;
};

export function canAccessRoute(
  user: PortalUser | null,
  allowedRoles: UserRole[],
) {
  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}
