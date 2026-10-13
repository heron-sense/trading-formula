package business

import (
	"context"
	"fmt"
	"log"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
	"xorm.io/builder"
)

func (d *Delegate) ensureEmployeeTable() error {
	if err := essentials.Sync(new(Employee)); err != nil {
		return eris.Wrap(err, "sync employee")
	}

	session := essentials.NewSession(context.Background())
	defer session.Close()
	count, err := session.Count(new(Employee))
	if err != nil {
		return eris.Wrap(err, "count employee")
	}
	if count > 0 {
		return nil
	}

	seed := []Employee{
		{ID: "e1", CompanyID: "co-demo", UserID: "", Name: "陈晨", Email: "chenchen@demo.co", Phone: "138-1000-0001", Title: "总经理", Department: "管理层", Status: "active", HiredAt: "2020-01-08"},
		{ID: "e2", CompanyID: "co-demo", UserID: "", Name: "林晓", Email: "linxiao@demo.co", Phone: "138-1000-0002", Title: "销售经理", Department: "销售部", Status: "active", HiredAt: "2021-03-15"},
		{ID: "e3", CompanyID: "co-demo", UserID: "", Name: "王蕾", Email: "wanglei@demo.co", Phone: "138-1000-0003", Title: "客户经理", Department: "销售部", Status: "active", HiredAt: "2022-06-01"},
		{ID: "e4", CompanyID: "co-demo", UserID: "", Name: "赵凯", Email: "zhaokai@demo.co", Phone: "138-1000-0004", Title: "分析师", Department: "研究部", Status: "pending", HiredAt: "2024-09-12"},
		{ID: "e5", CompanyID: "co-demo", UserID: "", Name: "周敏", Email: "zhoumin@demo.co", Phone: "138-1000-0005", Title: "人事专员", Department: "人事部", Status: "inactive", HiredAt: "2019-11-20"},
		{ID: "e6", CompanyID: "co-other", UserID: "", Name: "外司员工", Email: "other@other.co", Phone: "139-2000-0001", Title: "顾问", Department: "咨询", Status: "active", HiredAt: "2023-01-01"},
	}
	if _, err := session.Insert(&seed); err != nil {
		return eris.Wrap(err, "seed employee")
	}
	log.Printf("seeded employee with %d rows", len(seed))
	return nil
}

func employeeKeywordCond(keyword string) builder.Cond {
	if keyword == "" {
		return builder.NewCond()
	}
	return builder.Or(
		builder.Like{"name", keyword},
		builder.Like{"email", keyword},
		builder.Like{"phone", keyword},
		builder.Like{"title", keyword},
		builder.Like{"department", keyword},
	)
}

// ResolveCompanyID finds the company of the logged-in user.
// If the user is not bound yet, bind them into co-demo so the list is usable after login.
func (d *Delegate) ResolveCompanyID(ctx context.Context, userID string) (string, error) {
	if userID == "" {
		return "", eris.New("user_id is required")
	}
	session := essentials.NewSession(ctx)
	defer session.Close()

	var me Employee
	has, err := session.Where("user_id = ?", userID).Get(&me)
	if err != nil {
		return "", eris.Wrap(err, "get employee by user_id")
	}
	if has && me.CompanyID != "" {
		return me.CompanyID, nil
	}

	// Auto-bind current login user into demo company (first unbound seat or new row).
	var seat Employee
	hasSeat, err := session.Where("company_id = ? AND (user_id = '' OR user_id IS NULL)", "co-demo").
		OrderBy("id ASC").Get(&seat)
	if err != nil {
		return "", eris.Wrap(err, "find unbound employee seat")
	}
	if hasSeat {
		seat.UserID = userID
		if _, err := session.Where("id = ?", seat.ID).Cols("user_id").Update(&seat); err != nil {
			return "", eris.Wrap(err, "bind user_id to employee")
		}
		return seat.CompanyID, nil
	}

	row := Employee{
		ID:         fmt.Sprintf("e-user-%s", userID),
		CompanyID:  "co-demo",
		UserID:     userID,
		Name:       "新员工",
		Email:      "",
		Phone:      "",
		Title:      "员工",
		Department: "未分配",
		Status:     "active",
		HiredAt:    "",
	}
	if _, err := session.Insert(&row); err != nil {
		return "", eris.Wrap(err, "insert employee for current user")
	}
	return row.CompanyID, nil
}

func (d *Delegate) ListEmployees(ctx context.Context, req ListEmployeesRequest) (items []Employee, total int64, companyID string, active, pending, inactive int64, err error) {
	page := req.Page
	limit := req.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	companyID, err = d.ResolveCompanyID(ctx, req.UserID)
	if err != nil {
		return nil, 0, "", 0, 0, 0, err
	}

	cond := builder.And(
		builder.Eq{"company_id": companyID},
		employeeKeywordCond(req.Keyword),
	)

	countSession := essentials.NewSession(ctx)
	defer countSession.Close()
	total, err = countSession.Where(cond).Count(new(Employee))
	if err != nil {
		return nil, 0, companyID, 0, 0, 0, eris.Wrap(err, "count employee")
	}

	listSession := essentials.NewSession(ctx)
	defer listSession.Close()
	items = make([]Employee, 0, limit)
	err = listSession.Where(cond).
		OrderBy("id ASC").
		Limit(limit, (page-1)*limit).
		Find(&items)
	if err != nil {
		return nil, 0, companyID, 0, 0, 0, eris.Wrap(err, "find employee")
	}

	active, err = countEmployeesByStatus(ctx, companyID, "active")
	if err != nil {
		return nil, 0, companyID, 0, 0, 0, err
	}
	pending, err = countEmployeesByStatus(ctx, companyID, "pending")
	if err != nil {
		return nil, 0, companyID, 0, 0, 0, err
	}
	inactive, err = countEmployeesByStatus(ctx, companyID, "inactive")
	if err != nil {
		return nil, 0, companyID, 0, 0, 0, err
	}

	return items, total, companyID, active, pending, inactive, nil
}

func countEmployeesByStatus(ctx context.Context, companyID, status string) (int64, error) {
	session := essentials.NewSession(ctx)
	defer session.Close()
	n, err := session.Where("company_id = ? AND status = ?", companyID, status).Count(new(Employee))
	if err != nil {
		return 0, eris.Wrap(err, fmt.Sprintf("count employee status=%s", status))
	}
	return n, nil
}
