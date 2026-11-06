package business

// StaffRole is the per-client role catalog.
type StaffRole struct {
	CliAbbr string `xorm:"pk varchar(32) 'cli_abbr'" json:"cliAbbr"`
	Role    string `xorm:"pk varchar(32) 'role'" json:"role"`
	SortNo  int    `xorm:"int notnull default(0) 'sort_no'" json:"sortNo"`
}

func (StaffRole) TableName() string {
	return "staff_role"
}

// UserStaffRole assigns one role to an EdDSA user within a client.
type UserStaffRole struct {
	CliAbbr string `xorm:"pk varchar(32) 'cli_abbr'" json:"cliAbbr"`
	UserID  string `xorm:"pk varchar(64) 'user_id'" json:"userId"`
	Role    string `xorm:"varchar(32) notnull 'role'" json:"role"`
}

func (UserStaffRole) TableName() string {
	return "user_staff_role"
}

// StaffRoleStat is one role and how many users are assigned to it.
type StaffRoleStat struct {
	Role  string `json:"role"`
	Count int64  `json:"count"`
}

// StaffRoleAssignment is one user's current role.
type StaffRoleAssignment struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
}

// StaffRolesResponse is GET /api/business/staff-roles payload.
type StaffRolesResponse struct {
	Success     bool                  `json:"success"`
	Message     string                `json:"message,omitempty"`
	Data        []StaffRoleStat       `json:"data"`
	Assignments []StaffRoleAssignment `json:"assignments"`
}

// AddStaffRoleRequest is POST /api/business/staff-role body.
type AddStaffRoleRequest struct {
	CliAbbr string `json:"cliAbbr"`
	Role    string `json:"role"`
}

// AddStaffRoleResponse is POST /api/business/staff-role payload.
type AddStaffRoleResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	CliAbbr string `json:"cliAbbr,omitempty"`
	Role    string `json:"role,omitempty"`
}

// DeleteStaffRoleResponse is DELETE /api/business/staff-role payload.
type DeleteStaffRoleResponse struct {
	Success          bool   `json:"success"`
	Message          string `json:"message,omitempty"`
	CliAbbr          string `json:"cliAbbr,omitempty"`
	Role             string `json:"role,omitempty"`
	ClearedFromUsers int64  `json:"clearedFromUsers"`
}

// UpdateUserStaffRoleRequest is PUT /api/business/user-staff-role body.
type UpdateUserStaffRoleRequest struct {
	CliAbbr string `json:"cliAbbr"`
	UserID  string `json:"userId"`
	Role    string `json:"role"`
}

// UpdateUserStaffRoleResponse is PUT /api/business/user-staff-role payload.
type UpdateUserStaffRoleResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	UserID  string `json:"userId,omitempty"`
	Role    string `json:"role,omitempty"`
}
