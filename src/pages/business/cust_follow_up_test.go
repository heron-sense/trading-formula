package business

import (
	"testing"
	"time"
)

func TestNormalizeFollowUpContent(t *testing.T) {
	if _, err := normalizeFollowUpContent("  "); err == nil {
		t.Fatal("expected empty content error")
	}
	got, err := normalizeFollowUpContent("  电话沟通  ")
	if err != nil {
		t.Fatal(err)
	}
	if got != "电话沟通" {
		t.Fatalf("got %q", got)
	}
}

func TestNormalizeFollowUpCreatedAt_EmptyDefaultsNow(t *testing.T) {
	before := time.Now().Add(-time.Second)
	got, err := normalizeFollowUpCreatedAt("")
	if err != nil {
		t.Fatal(err)
	}
	if got.Before(before) || got.After(time.Now().Add(time.Second)) {
		t.Fatalf("unexpected default time %v", got)
	}
}

func TestNormalizeFollowUpCreatedAt_Parse(t *testing.T) {
	got, err := normalizeFollowUpCreatedAt("2024-06-01 14:30")
	if err != nil {
		t.Fatal(err)
	}
	if got.Format("2006-01-02 15:04") != "2024-06-01 14:30" {
		t.Fatalf("got %v", got)
	}
}

func TestNormalizeSummaryInput_MaxLen(t *testing.T) {
	runes := make([]rune, maxCustomerSummaryLen+1)
	for i := range runes {
		runes[i] = '概'
	}
	if _, err := normalizeSummaryInput(string(runes)); err == nil {
		t.Fatal("expected summary too long error")
	}
	ok := string(runes[:maxCustomerSummaryLen])
	got, err := normalizeSummaryInput(ok)
	if err != nil {
		t.Fatal(err)
	}
	if got != ok {
		t.Fatalf("unexpected value")
	}
}
