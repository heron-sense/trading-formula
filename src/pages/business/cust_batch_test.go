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

func TestNormalizeOwner(t *testing.T) {
	if _, _, err := normalizeOwner("", "张三"); err == nil {
		t.Fatal("expected ownerId required")
	}
	if _, _, err := normalizeOwner("u1", "  "); err == nil {
		t.Fatal("expected ownerName required")
	}
	id, name, err := normalizeOwner(" u1 ", " 张三 ")
	if err != nil {
		t.Fatal(err)
	}
	if id != "u1" || name != "张三" {
		t.Fatalf("got %q %q", id, name)
	}
}
