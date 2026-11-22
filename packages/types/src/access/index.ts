/** An Operator as the API returns it (never includes the Google account's identifier). */
export interface IOperatorDto {
  id: string;
  email: string;
  /** Role names. */
  roles: string[];
  active: boolean;
  /** Created from configuration; cannot be deactivated or lose Super Admin. */
  isBootstrap: boolean;
  /** Whether they have signed in with Google yet. */
  hasSignedIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRoleDto {
  id: string;
  name: string;
  /** Only a Super Admin may change or grant a protected Role. */
  isProtected: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/** POST /operators: pre-register someone by email, optionally with initial Roles. */
export interface CreateOperatorRequest {
  email: string;
  roles?: string[];
}

/** PUT /operators/:id/roles: replace the Operator's Roles. */
export interface AssignRolesRequest {
  roles: string[];
}

/** POST /roles and PUT /roles/:id. */
export interface RoleRequest {
  name?: string;
  permissions?: string[];
}
