package business

import "testing"

func TestNormalizeCustIDs(t *testing.T) {
	if _, err := normalizeCustIDs(nil); err == nil {
		t.Fatal("expected empty error")
	}
	got, err := normalizeCustIDs([]string{" a ", "", "a", "b"})
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 || got[0] != "a" || got[1] != "b" {
		t.Fatalf("got %#v", got)
	}
}

func TestNormalizeAssignee(t *testing.T) {
	if _, err := normalizeAssignee("  "); err == nil {
		t.Fatal("expected assignee required")
	}
	id, err := normalizeAssignee(" 04FxowNH1n2CAAux9y6Odh ")
	if err != nil {
		t.Fatal(err)
	}
	if id != "04FxowNH1n2CAAux9y6Odh" {
		t.Fatalf("got %q", id)
	}
}
