# Permission Levels Guide

SpokeStack uses role-based access control (RBAC) to manage what users can see and do.

---

## Permission Levels

### Admin
**Full platform access**

| Module | Access |
|--------|--------|
| All Modules | Full CRUD |
| User Management | Full access |
| Settings | Full access |
| Billing | Full access |
| Superadmin | If granted |

Typical users: IT Administrators, Founders, Operations Lead

---

### Leadership
**Strategic oversight access**

| Module | Access |
|--------|--------|
| All Standard Modules | Full CRUD |
| RFP | Full access |
| Team | View all |
| Resources | Full access |
| Admin | View only |

Typical users: Directors, VPs, C-Suite

---

### Team Lead
**Team management access**

| Module | Access |
|--------|--------|
| Briefs | Assign to team |
| Time | View team entries |
| Leave | Approve team requests |
| Team | View own team |
| Resources | View capacity |
| Projects | View assigned |

Typical users: Department Heads, Senior Managers

---

### Staff
**Standard employee access**

| Module | Access |
|--------|--------|
| Briefs | Own assignments |
| Time | Own entries |
| Leave | Own requests |
| Team | View directory |
| SpokeChat | Full access |

Typical users: Designers, Developers, Account Managers

---

### Freelancer
**Limited contractor access**

| Module | Access |
|--------|--------|
| Briefs | Assigned only |
| Time | Own entries |
| SpokeChat | Limited channels |

Typical users: External contractors, Freelancers

---

### Client
**Portal-only access**

| Module | Access |
|--------|--------|
| Portal Dashboard | Own data |
| Approvals | Own deliverables |
| Deliverables | Download own |
| Reports | Own analytics |

Typical users: External clients

---

## Module-Level Permissions

Some modules have granular permissions:

### Briefs
- `brief:create` - Submit new briefs
- `brief:assign` - Assign to team members
- `brief:approve` - Approve submissions
- `brief:delete` - Delete briefs

### Time Tracking
- `time:log` - Log own time
- `time:view_team` - View team entries
- `time:approve` - Approve timesheets
- `time:edit_any` - Edit any entry

### Leave
- `leave:request` - Request leave
- `leave:approve` - Approve requests
- `leave:admin` - Manage policies

### RFP
- `rfp:view` - View pipeline
- `rfp:create` - Create RFPs
- `rfp:manage` - Full management

---

## Custom Roles

Admins can create custom roles:

1. Go to **Admin** > **Settings** > **Roles**
2. Click **Create Role**
3. Name the role
4. Select permissions
5. Save

Assign custom roles when adding/editing users.

---

## Permission Inheritance

- Higher roles inherit lower role permissions
- Admin > Leadership > Team Lead > Staff > Freelancer
- Client role is separate (portal-only)

---

## Best Practices

1. **Principle of Least Privilege** - Grant minimum necessary access
2. **Regular Audits** - Review permissions quarterly
3. **Document Changes** - Log permission updates
4. **Offboarding** - Deactivate users promptly when they leave

---

*Back to: [Admin Dashboard](./admin-dashboard.md)*
