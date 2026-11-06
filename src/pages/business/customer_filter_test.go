package business

import (
	"strings"
	"testing"

	"xorm.io/builder"
)

func TestCustomerListCond_Assignee(t *testing.T) {
	empty := customerListCond(ListCustomersRequest{})
	sql, args, err := builder.ToSQL(empty)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "assignee = ''") || !strings.Contains(sql, "assignee IS NULL") {
		t.Fatalf("expected empty assignee filter, got %q", sql)
	}
	if len(args) != 0 {
		t.Fatalf("empty role should not add args, got %#v", args)
	}

	scoped := customerListCond(ListCustomersRequest{RoleID: "04FxowNH1n2CAAux9y6Odh"})
	sql, args, err = builder.ToSQL(scoped)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "assignee = ?") || !strings.Contains(sql, "assignee = ''") {
		t.Fatalf("expected role-or-empty assignee filter, got %q", sql)
	}
	if len(args) != 1 || args[0] != "04FxowNH1n2CAAux9y6Odh" {
		t.Fatalf("unexpected args: %#v", args)
	}
}

func TestCustomerListCond_AssigneeScope(t *testing.T) {
	allRoles := customerListCond(ListCustomersRequest{
		RoleID:        "role-a",
		AssigneeScope: allRolesAssigneeScope,
	})
	sql, args, err := builder.ToSQL(allRoles)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Count(sql, "assignee = ''") < 2 || !strings.Contains(sql, "assignee IS NULL") {
		t.Fatalf("expected visibility plus empty-assignee filter, got %q", sql)
	}
	if len(args) != 1 || args[0] != "role-a" {
		t.Fatalf("unexpected args: %#v", args)
	}

	oneRole := customerListCond(ListCustomersRequest{
		RoleID:        "role-a",
		AssigneeScope: "role-b",
	})
	sql, args, err = builder.ToSQL(oneRole)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "assignee = ?") || !strings.Contains(sql, "assignee=?") {
		t.Fatalf("expected viewer role and selected role, got %q", sql)
	}
	if len(args) != 2 || args[0] != "role-a" || args[1] != "role-b" {
		t.Fatalf("unexpected args: %#v", args)
	}
}

func TestCustomerListCond_Name(t *testing.T) {
	cond := customerListCond(ListCustomersRequest{Name: "张三"})
	sql, args, err := builder.ToSQL(cond)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "name LIKE") {
		t.Fatalf("expected name LIKE in sql, got %q args=%v", sql, args)
	}
	if len(args) != 1 || args[0] != "%张三%" {
		t.Fatalf("unexpected args: %#v", args)
	}
}

func TestCustomerListCond_TagsAny(t *testing.T) {
	cond := customerListCond(ListCustomersRequest{Tags: []string{"VIP", "重点"}})
	sql, args, err := builder.ToSQL(cond)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "JSON_CONTAINS") {
		t.Fatalf("expected JSON_CONTAINS, got %q", sql)
	}
	if !strings.Contains(sql, " OR ") {
		t.Fatalf("expected OR for multi tags, got %q", sql)
	}
	if len(args) != 2 {
		t.Fatalf("expected 2 args, got %#v", args)
	}
}

func TestCustomerListCond_Untagged(t *testing.T) {
	cond := customerListCond(ListCustomersRequest{Tag: untaggedFilterSentinel})
	sql, _, err := builder.ToSQL(cond)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "JSON_LENGTH") {
		t.Fatalf("expected untagged JSON_LENGTH filter, got %q", sql)
	}
}

func TestCustomerListCond_DateRanges(t *testing.T) {
	cond := customerListCond(ListCustomersRequest{
		RegistrationDateFrom: "2024-01-01",
		RegistrationDateTo:   "2024-12-31",
		LastContactFrom:      "2025-01-01",
		LastContactTo:        "2025-12-31",
	})
	sql, args, err := builder.ToSQL(cond)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "registration_date >=") || !strings.Contains(sql, "registration_date <=") {
		t.Fatalf("missing registration_date range: %q", sql)
	}
	if !strings.Contains(sql, "last_contact >=") || !strings.Contains(sql, "last_contact <=") {
		t.Fatalf("missing last_contact range: %q", sql)
	}
	if len(args) != 4 {
		t.Fatalf("expected 4 date args, got %#v", args)
	}
}

func TestCustomerListCond_Combined(t *testing.T) {
	cond := customerListCond(ListCustomersRequest{
		Name:                 "李",
		Tags:                 []string{"VIP"},
		RegistrationDateFrom: "2024-01-01",
		LastContactTo:        "2025-12-31",
	})
	sql, args, err := builder.ToSQL(cond)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(sql, "name LIKE") || !strings.Contains(sql, "JSON_CONTAINS") {
		t.Fatalf("expected name+tag filters, got %q", sql)
	}
	if len(args) < 3 {
		t.Fatalf("expected >=3 args, got %#v", args)
	}
}
