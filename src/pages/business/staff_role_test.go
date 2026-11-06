package business

import "testing"

func TestNormalizeStaffRole(t *testing.T) {
	role, err := normalizeStaffRole("  销售  ")
	if err != nil {
		t.Fatal(err)
	}
	if role != "销售" {
		t.Fatalf("role = %q", role)
	}

	if _, err := normalizeStaffRole("   "); err == nil {
		t.Fatal("expected empty role to fail")
	}

	long := make([]rune, maxStaffRoleLen+1)
	for i := range long {
		long[i] = '角'
	}
	if _, err := normalizeStaffRole(string(long)); err == nil {
		t.Fatal("expected overlong role to fail")
	}
}
