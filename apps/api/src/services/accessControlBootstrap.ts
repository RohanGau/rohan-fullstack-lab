import {
  PROTECTED_ROLE_NAMES,
  SEEDED_ROLES,
  SEEDED_ROLE_PERMISSIONS,
} from '@fullstack-lab/constants';
import Operator from '../models/Operator';
import Role from '../models/Role';

export const SUPER_ADMIN_ROLE = SEEDED_ROLES.SUPER_ADMIN;

/**
 * Idempotent: safe to call on every boot. Called by the server and by tests.
 * Creates the seeded Roles that are missing, with their starting Permissions, and never
 * overwrites a Role's Permissions afterwards (administrators edit them). Whether a Role is
 * protected is always restored.
 */
export async function bootstrapAccessControl(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const email = env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error('SUPER_ADMIN_EMAIL is required to bootstrap the first Super Admin');
  }

  for (const name of Object.values(SEEDED_ROLES)) {
    await Role.findOneAndUpdate(
      { name },
      {
        $set: { isProtected: PROTECTED_ROLE_NAMES.includes(name) },
        $setOnInsert: { name, permissions: [...(SEEDED_ROLE_PERMISSIONS[name] ?? [])] },
      },
      { upsert: true }
    );
  }

  const superAdminRole = await Role.findOne({ name: SUPER_ADMIN_ROLE });
  await Operator.findOneAndUpdate(
    { email },
    {
      $set: { isBootstrap: true, active: true },
      $addToSet: { roles: superAdminRole!._id },
      $setOnInsert: { email },
    },
    { upsert: true }
  );
}
