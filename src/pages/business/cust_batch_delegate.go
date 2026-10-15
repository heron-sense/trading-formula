package business

import (
	"context"
	"strings"
	"unicode/utf8"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
)

func normalizeCustIDs(raw []string) ([]string, error) {
	seen := make(map[string]struct{}, len(raw))
	out := make([]string, 0, len(raw))
	for _, id := range raw {
		id = strings.TrimSpace(id)
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	if len(out) == 0 {
		return nil, eris.New("custIds is required")
	}
	return out, nil
}

func normalizeOwner(rawID, rawName string) (id, name string, err error) {
	id = strings.TrimSpace(rawID)
	name = strings.TrimSpace(rawName)
	if id == "" {
		return "", "", eris.New("ownerId is required")
	}
	if utf8.RuneCountInString(id) > 64 {
		return "", "", eris.New("ownerId exceeds 64 characters")
	}
	if name == "" {
		return "", "", eris.New("ownerName is required")
	}
	if utf8.RuneCountInString(name) > 64 {
		return "", "", eris.New("ownerName exceeds 64 characters")
	}
	return id, name, nil
}

// BatchAssignCustomers sets owner_id / owner_name for the given customer ids.
func (d *Delegate) BatchAssignCustomers(ctx context.Context, rawIDs []string, rawOwnerID, rawOwnerName string) (updated int, ownerID, ownerName string, err error) {
	ids, err := normalizeCustIDs(rawIDs)
	if err != nil {
		return 0, "", "", err
	}
	ownerID, ownerName, err = normalizeOwner(rawOwnerID, rawOwnerName)
	if err != nil {
		return 0, "", "", err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	n, err := session.In("id", ids).Cols("owner_id", "owner_name").Update(&PotentialCust{
		OwnerID:   ownerID,
		OwnerName: ownerName,
	})
	if err != nil {
		return 0, "", "", eris.Wrap(err, "batch assign potential_cust")
	}
	return int(n), ownerID, ownerName, nil
}

// BatchDeleteCustomers deletes customers by id.
func (d *Delegate) BatchDeleteCustomers(ctx context.Context, rawIDs []string) (deleted int, err error) {
	ids, err := normalizeCustIDs(rawIDs)
	if err != nil {
		return 0, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	n, err := session.In("id", ids).Delete(new(PotentialCust))
	if err != nil {
		return 0, eris.Wrap(err, "batch delete potential_cust")
	}
	return int(n), nil
}
