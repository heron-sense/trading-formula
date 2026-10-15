package business

import (
	"reflect"
	"testing"
)

func TestRemoveTagFromTags(t *testing.T) {
	got, removed := removeTagFromTags([]string{"VIP", "重点", "VIP"}, "VIP")
	if !removed {
		t.Fatal("expected removed")
	}
	want := []string{"重点"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v want %#v", got, want)
	}
}

func TestRemoveTagFromTags_Missing(t *testing.T) {
	in := []string{"VIP"}
	got, removed := removeTagFromTags(in, "重点")
	if removed {
		t.Fatal("expected not removed")
	}
	if !reflect.DeepEqual(got, in) {
		t.Fatalf("got %#v want %#v", got, in)
	}
}
