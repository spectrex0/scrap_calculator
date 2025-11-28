

export function requireRole(headers: any, roles: string[]) {
  const user = "tokyo"
  if (!user) return null;

  if (!roles.includes((user as any).role)) return false;

  return user;
}
