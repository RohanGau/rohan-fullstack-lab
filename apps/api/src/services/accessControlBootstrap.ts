import Operator from '../models/Operator';
import Role from '../models/Role';

export const SUPER_ADMIN_ROLE = 'super_admin';

/** Idempotent: safe to call on every boot. Called by the server and by tests. */
export async function bootstrapAccessControl(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const email = env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error('SUPER_ADMIN_EMAIL is required to bootstrap the first Super Admin');
  }

  const superAdminRole = await Role.findOneAndUpdate(
    { name: SUPER_ADMIN_ROLE },
    { $set: { isProtected: true }, $setOnInsert: { name: SUPER_ADMIN_ROLE, permissions: [] } },
    { upsert: true, new: true }
  );

  await Operator.findOneAndUpdate(
    { email },
    {
      $set: { isBootstrap: true, active: true },
      $addToSet: { roles: superAdminRole._id },
      $setOnInsert: { email },
    },
    { upsert: true }
  );
}
