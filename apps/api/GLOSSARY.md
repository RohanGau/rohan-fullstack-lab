# Admin Access

How people are identified and authorized to operate the admin panel and the API behind it.

## Language

**Operator**:
A person who signs in to the admin panel with a Google account and has been pre-registered by email. Distinct from a site **User**.
_Avoid_: admin user, user, account

**Admin panel**:
The web application **Operators** use to manage the site's content and inbox and to administer **Operators** and **Roles**. It shows only what an Operator's **Permissions** allow.
_Avoid_: admin console, admin app, admin dashboard

**Permission**:
A single named capability an **Operator** may exercise, such as writing blog posts or deleting contacts. Every guarded action maps to exactly one permission.
_Avoid_: privilege, right, scope

**Permission catalogue**:
The fixed list of every **Permission** that exists. It is defined in code; nobody can add a permission at runtime.
_Avoid_: permission registry, permission table

**Role**:
A named bundle of **Permissions** that is assigned to **Operators**. Operators gain permissions only through roles.
_Avoid_: group, level, profile

**Super Admin**:
The **Role** that implicitly holds every **Permission**, including ones added later. Only a Super Admin can grant it. It cannot be edited or deleted, and the bootstrap Operator cannot lose it.
_Avoid_: root, owner, superuser

**Admin**:
The **Role** that manages Operators and all **Roles** except the **Protected roles**. It holds every **Permission** except those reserved to **Super Admin**.
_Avoid_: administrator, manager

**Protected role**:
A **Role** that only a **Super Admin** may change or grant: **Super Admin** and **Admin**.
_Avoid_: system role, locked role

## Relationships

- An **Operator** holds one or more **Roles**
- A **Role** bundles zero or more **Permissions** drawn from the **Permission catalogue**
- **Super Admin** is a **Role** that holds the whole **Permission catalogue** implicitly
- An **Admin** may create, edit, delete and assign any **Role** that is not a **Protected role**
- Only an **Operator** who has been pre-registered can sign in; unknown Google accounts are rejected

## Flagged ambiguities

- "role" also appears in the skills glossary as **Triage role**, an unrelated issue label. Resolved: the two live in separate contexts; **Role** here always means a bundle of **Permissions**.
- "user" was used for both site visitors and admin-panel people. Resolved: admin-panel people are **Operators**.
