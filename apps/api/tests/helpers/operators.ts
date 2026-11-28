import Operator from '../../src/models/Operator';
import Role from '../../src/models/Role';
import { issueAuthTokens } from '../../src/services/authTokens';

/** An Operator holding the named Roles, as if an administrator had registered them. */
export async function createOperator(
  email: string,
  roleNames: string[] = [],
  options: { active?: boolean } = {}
) {
  const roles = await Role.find({ name: { $in: roleNames } });
  return Operator.create({ email, roles: roles.map((r) => r._id), active: options.active ?? true });
}

/** The access token an Operator would hold after signing in (sign-in itself is tested elsewhere). */
export async function accessTokenFor(operator: { id: string; email: string }): Promise<string> {
  const { accessToken } = await issueAuthTokens({
    id: operator.id,
    role: 'admin',
    email: operator.email,
  });
  return accessToken;
}

export async function operatorWithToken(email: string, roleNames: string[] = []) {
  const operator = await createOperator(email, roleNames);
  return { operator, token: await accessTokenFor(operator) };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
