package business

import "testing"

func TestNormalizeLabelColor_Default(t *testing.T) {
	got, err := normalizeLabelColor("")
	if err != nil {
		t.Fatal(err)
	}
	if got != defaultLabelColor {
		t.Fatalf("got %q want %q", got, defaultLabelColor)
	}
}

func TestNormalizeLabelColor_Allowed(t *testing.T) {
	got, err := normalizeLabelColor("#F57C00")
	if err != nil {
		t.Fatal(err)
	}
	if got != "#f57c00" {
		t.Fatalf("got %q", got)
	}
}

func TestNormalizeLabelColor_Invalid(t *testing.T) {
	if _, err := normalizeLabelColor("#ffffff"); err == nil {
		t.Fatal("expected error for invalid color")
	}
}
