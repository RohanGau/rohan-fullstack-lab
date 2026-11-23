# 05: Operator administration

**What to build:** Super Admins and Admins review, pre-register, assign Roles to, and deactivate Operators from the new Admin panel, within the limits the Admin Access glossary defines.

**Blocked by:** 03, SSO-04 (Operator pre-registration and deactivation), SSO-05 (Role management and Protected roles)

**Status:** done

- [x] The Operators list shows each Operator's email, Roles and whether they are active
- [x] An Operator can be pre-registered by email, and a Role can be assigned or removed
- [x] A Super Admin can assign any Role, including Super Admin and Admin
- [x] An Admin sees the controls to grant a Protected role, or to change a Super Admin's Roles, disabled with a reason
- [x] The bootstrap Super Admin is shown locked and cannot be demoted, deactivated or deleted from the panel
- [x] Deactivating an Operator asks for confirmation and takes effect immediately
- [x] Operators without the matching Permissions do not see the screens at all
- [x] Behaviour tests cover Super Admin, Admin and other Roles, each locked and refused case, and server-side errors
