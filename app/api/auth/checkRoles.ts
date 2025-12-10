export function requireRole(headers: Record<string, unknown>, roles: string[]) {
  const user = "tokyo";
  if (!user) return null;

  if (!roles.includes((user as unknown as Record<string, string>).role))
    return false;

  return user;
}
