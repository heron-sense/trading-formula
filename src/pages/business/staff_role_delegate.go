package business

import (
	"context"
	"strings"
	"unicode/utf8"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
)

const maxStaffRoleLen = 32

func (d *Delegate) ensureStaffRoleTables() error {
	if err := essentials.Sync(new(StaffRole)); err != nil {
		return eris.Wrap(err, "sync staff_role")
	}
	if err := essentials.Sync(new(UserStaffRole)); err != nil {
		return eris.Wrap(err, "sync user_staff_role")
	}
	return nil
}

func normalizeStaffRole(raw string) (string, error) {
	role := strings.TrimSpace(raw)
	if role == "" {
		return "", eris.New("role is required")
	}
	if utf8.RuneCountInString(role) > maxStaffRoleLen {
		return "", eris.Errorf("role must be at most %d characters", maxStaffRoleLen)
	}
	return role, nil
}

// ListStaffRoles returns the role catalog and current user assignments for one cli_abbr.
func (d *Delegate) ListStaffRoles(ctx context.Context, rawCliAbbr string) ([]StaffRoleStat, []StaffRoleAssignment, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return nil, nil, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	rows := make([]StaffRole, 0)
	if err := session.Where("cli_abbr = ?", cliAbbr).Asc("sort_no").Asc("role").Find(&rows); err != nil {
		return nil, nil, eris.Wrap(err, "list staff_role")
	}
	assigned := make([]UserStaffRole, 0)
	if err := session.Where("cli_abbr = ?", cliAbbr).Find(&assigned); err != nil {
		return nil, nil, eris.Wrap(err, "list user_staff_role")
	}

	counts := make(map[string]int64, len(rows))
	assignments := make([]StaffRoleAssignment, 0, len(assigned))
	for _, row := range assigned {
		if row.Role == "" || row.UserID == "" {
			continue
		}
		counts[row.Role]++
		assignments = append(assignments, StaffRoleAssignment{UserID: row.UserID, Role: row.Role})
	}

	stats := make([]StaffRoleStat, 0, len(rows))
	for _, row := range rows {
		if row.Role == "" {
			continue
		}
		stats = append(stats, StaffRoleStat{Role: row.Role, Count: counts[row.Role]})
	}
	return stats, assignments, nil
}

// AddStaffRole inserts a role into the catalog.
func (d *Delegate) AddStaffRole(ctx context.Context, rawCliAbbr, rawRole string) (string, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return "", err
	}
	role, err := normalizeStaffRole(rawRole)
	if err != nil {
		return "", err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	exists, err := session.Where("cli_abbr = ? AND role = ?", cliAbbr, role).Exist(new(StaffRole))
	if err != nil {
		return "", eris.Wrap(err, "check staff_role")
	}
	if exists {
		return "", eris.New("role already exists")
	}

	var maxSort int
	_, _ = session.SQL("SELECT IFNULL(MAX(sort_no), 0) FROM staff_role WHERE cli_abbr = ?", cliAbbr).Get(&maxSort)
	if _, err := session.Insert(&StaffRole{CliAbbr: cliAbbr, Role: role, SortNo: maxSort + 1}); err != nil {
		return "", eris.Wrap(err, "insert staff_role")
	}
	return role, nil
}

// DeleteStaffRole removes a catalog role and clears it from assigned users.
func (d *Delegate) DeleteStaffRole(ctx context.Context, rawCliAbbr, rawRole string) (int64, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return 0, err
	}
	role, err := normalizeStaffRole(rawRole)
	if err != nil {
		return 0, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()
	if err := session.Begin(); err != nil {
		return 0, eris.Wrap(err, "begin transaction")
	}

	exists, err := session.Where("cli_abbr = ? AND role = ?", cliAbbr, role).Exist(new(StaffRole))
	if err != nil {
		_ = session.Rollback()
		return 0, eris.Wrap(err, "check staff_role")
	}
	if !exists {
		_ = session.Rollback()
		return 0, eris.New("role not found")
	}

	cleared, err := session.Where("cli_abbr = ? AND role = ?", cliAbbr, role).Delete(new(UserStaffRole))
	if err != nil {
		_ = session.Rollback()
		return 0, eris.Wrap(err, "clear user_staff_role")
	}
	if _, err := session.Where("cli_abbr = ? AND role = ?", cliAbbr, role).Delete(new(StaffRole)); err != nil {
		_ = session.Rollback()
		return 0, eris.Wrap(err, "delete staff_role")
	}
	if err := session.Commit(); err != nil {
		return 0, eris.Wrap(err, "commit transaction")
	}
	return cleared, nil
}

// UpdateUserStaffRole sets or clears one user's role. An empty role clears the assignment.
func (d *Delegate) UpdateUserStaffRole(ctx context.Context, rawCliAbbr, rawUserID, rawRole string) (string, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return "", err
	}
	userID := strings.TrimSpace(rawUserID)
	if userID == "" {
		return "", eris.New("userId is required")
	}
	if utf8.RuneCountInString(userID) > 64 {
		return "", eris.New("userId must be at most 64 characters")
	}

	role := strings.TrimSpace(rawRole)
	if role != "" {
		role, err = normalizeStaffRole(role)
		if err != nil {
			return "", err
		}
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	if role == "" {
		if _, err := session.Where("cli_abbr = ? AND user_id = ?", cliAbbr, userID).Delete(new(UserStaffRole)); err != nil {
			return "", eris.Wrap(err, "clear user_staff_role")
		}
		return "", nil
	}

	exists, err := session.Where("cli_abbr = ? AND role = ?", cliAbbr, role).Exist(new(StaffRole))
	if err != nil {
		return "", eris.Wrap(err, "check staff_role")
	}
	if !exists {
		return "", eris.New("role not found")
	}

	row := UserStaffRole{CliAbbr: cliAbbr, UserID: userID, Role: role}
	has, err := session.Where("cli_abbr = ? AND user_id = ?", cliAbbr, userID).Exist(new(UserStaffRole))
	if err != nil {
		return "", eris.Wrap(err, "check user_staff_role")
	}
	if has {
		if _, err := session.Where("cli_abbr = ? AND user_id = ?", cliAbbr, userID).Cols("role").Update(&row); err != nil {
			return "", eris.Wrap(err, "update user_staff_role")
		}
		return role, nil
	}
	if _, err := session.Insert(&row); err != nil {
		return "", eris.Wrap(err, "insert user_staff_role")
	}
	return role, nil
}
