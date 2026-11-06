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

func normalizeAssignee(raw string) (string, error) {
	assignee := strings.TrimSpace(raw)
	if assignee == "" {
		return "", eris.New("assignee is required")
	}
	if utf8.RuneCountInString(assignee) > 64 {
		return "", eris.New("assignee exceeds 64 characters")
	}
	return assignee, nil
}

// BatchAssignCustomers writes the employee's role id into potential_cust.assignee.
func (d *Delegate) BatchAssignCustomers(ctx context.Context, rawIDs []string, rawAssignee string) (updated int, assignee string, err error) {
	ids, err := normalizeCustIDs(rawIDs)
	if err != nil {
		return 0, "", err
	}
	assignee, err = normalizeAssignee(rawAssignee)
	if err != nil {
		return 0, "", err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	n, err := session.In("id", ids).Cols("assignee").Update(&PotentialCust{
		Assignee: assignee,
	})
	if err != nil {
		return 0, "", eris.Wrap(err, "batch assign potential_cust")
	}
	return int(n), assignee, nil
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
