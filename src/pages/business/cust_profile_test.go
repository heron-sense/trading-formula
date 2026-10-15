package business

import "testing"

func TestNormalizeCustName(t *testing.T) {
	if _, err := normalizeCustName("  "); err == nil {
		t.Fatal("expected empty name error")
	}
	got, err := normalizeCustName("  张三  ")
	if err != nil {
		t.Fatal(err)
	}
	if got != "张三" {
		t.Fatalf("got %q", got)
	}
	runes := make([]rune, maxCustNameLen+1)
	for i := range runes {
		runes[i] = '名'
	}
	if _, err := normalizeCustName(string(runes)); err == nil {
		t.Fatal("expected name too long error")
	}
}

func TestNormalizeCustPhoneAndEmail(t *testing.T) {
	phone, err := normalizeCustPhone(" 13800138000 ")
	if err != nil {
		t.Fatal(err)
	}
	if phone != "13800138000" {
		t.Fatalf("got phone %q", phone)
	}
	email, err := normalizeCustEmail("  a@b.com ")
	if err != nil {
		t.Fatal(err)
	}
	if email != "a@b.com" {
		t.Fatalf("got email %q", email)
	}
	longPhone := make([]rune, maxCustPhoneLen+1)
	for i := range longPhone {
		longPhone[i] = '1'
	}
	if _, err := normalizeCustPhone(string(longPhone)); err == nil {
		t.Fatal("expected phone too long error")
	}
}
