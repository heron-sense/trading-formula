package business

import "testing"

func TestNormalizeStatusName(t *testing.T) {
	if _, err := normalizeStatusName("  "); err == nil {
		t.Fatal("expected empty error")
	}
	got, err := normalizeStatusName(" 活跃 ")
	if err != nil {
		t.Fatal(err)
	}
	if got != "活跃" {
		t.Fatalf("got %q", got)
	}
}
