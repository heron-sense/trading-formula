package business

import (
	"context"
	"fmt"
	"log"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
	"xorm.io/builder"
)

// Delegate holds customer query logic against potential_cust.
type Delegate struct{}

func NewDelegate() *Delegate {
	d := &Delegate{}
	if err := d.ensureTable(); err != nil {
		log.Printf("potential_cust sync warning: %v", err)
	}
	if err := d.ensureEmployeeTable(); err != nil {
		log.Printf("employee sync warning: %v", err)
	}
	return d
}

func (d *Delegate) ensureTable() error {
	// Only ensure schema; do not seed demo rows (imports are the data source).
	if err := essentials.Sync(new(PotentialCust)); err != nil {
		return eris.Wrap(err, "sync potential_cust")
	}
	return nil
}

func keywordCond(keyword string) builder.Cond {
	if keyword == "" {
		return builder.NewCond()
	}
	return builder.Or(
		builder.Like{"name", keyword},
		builder.Like{"email", keyword},
		builder.Like{"company", keyword},
		builder.Like{"phone", keyword},
	)
}

func (d *Delegate) ListCustomers(ctx context.Context, req ListCustomersRequest) (items []Customer, total int64, active, pending, inactive int64, err error) {
	page := req.Page
	limit := req.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	cond := keywordCond(req.Keyword)

	countSession := essentials.NewSession(ctx)
	defer countSession.Close()
	total, err = countSession.Where(cond).Count(new(PotentialCust))
	if err != nil {
		return nil, 0, 0, 0, 0, eris.Wrap(err, "count potential_cust")
	}

	listSession := essentials.NewSession(ctx)
	defer listSession.Close()
	items = make([]Customer, 0, limit)
	err = listSession.Where(cond).
		OrderBy("id ASC").
		Limit(limit, (page-1)*limit).
		Find(&items)
	if err != nil {
		return nil, 0, 0, 0, 0, eris.Wrap(err, "find potential_cust")
	}

	active, err = countByStatus(ctx, "active")
	if err != nil {
		return nil, 0, 0, 0, 0, err
	}
	pending, err = countByStatus(ctx, "pending")
	if err != nil {
		return nil, 0, 0, 0, 0, err
	}
	inactive, err = countByStatus(ctx, "inactive")
	if err != nil {
		return nil, 0, 0, 0, 0, err
	}

	return items, total, active, pending, inactive, nil
}

func countByStatus(ctx context.Context, status string) (int64, error) {
	session := essentials.NewSession(ctx)
	defer session.Close()
	n, err := session.Where("status = ?", status).Count(new(PotentialCust))
	if err != nil {
		return 0, eris.Wrap(err, fmt.Sprintf("count potential_cust status=%s", status))
	}
	return n, nil
}

func normalizeCustomer(c *Customer) error {
	if c.Name == "" {
		return eris.New("name is required")
	}
	if c.ID == "" {
		return eris.New("id is required")
	}
	switch c.Status {
	case "active", "inactive", "pending", "":
		if c.Status == "" {
			c.Status = "pending"
		}
	default:
		return eris.Errorf("invalid status: %s", c.Status)
	}
	return nil
}

// BatchUpsertCustomers inserts or updates rows in potential_cust.
func (d *Delegate) BatchUpsertCustomers(ctx context.Context, customers []Customer) (inserted, updated, failed int, samples []string, err error) {
	if len(customers) == 0 {
		return 0, 0, 0, nil, eris.New("customers is empty")
	}

	const maxSamples = 10
	valid := make([]Customer, 0, len(customers))
	ids := make([]string, 0, len(customers))
	for i := range customers {
		c := customers[i]
		if nerr := normalizeCustomer(&c); nerr != nil {
			failed++
			if len(samples) < maxSamples {
				samples = append(samples, fmt.Sprintf("row %d (id=%s): %v", i+1, c.ID, nerr))
			}
			continue
		}
		valid = append(valid, c)
		ids = append(ids, c.ID)
	}
	if len(valid) == 0 {
		return 0, 0, failed, samples, nil
	}

	session := essentials.NewSession(ctx)
	defer session.Close()
	if err := session.Begin(); err != nil {
		return 0, 0, failed, samples, eris.Wrap(err, "begin transaction")
	}

	existing := make([]PotentialCust, 0, len(ids))
	if err := session.In("id", ids).Cols("id").Find(&existing); err != nil {
		_ = session.Rollback()
		return 0, 0, failed, samples, eris.Wrap(err, "load existing potential_cust ids")
	}
	existSet := make(map[string]struct{}, len(existing))
	for _, row := range existing {
		existSet[row.ID] = struct{}{}
	}

	toInsert := make([]Customer, 0, len(valid))
	for _, c := range valid {
		if _, ok := existSet[c.ID]; ok {
			if _, uerr := session.Where("id = ?", c.ID).AllCols().Update(&c); uerr != nil {
				failed++
				if len(samples) < maxSamples {
					samples = append(samples, fmt.Sprintf("update id=%s: %v", c.ID, uerr))
				}
				continue
			}
			updated++
			continue
		}
		toInsert = append(toInsert, c)
	}

	const chunkSize = 200
	for start := 0; start < len(toInsert); start += chunkSize {
		end := start + chunkSize
		if end > len(toInsert) {
			end = len(toInsert)
		}
		chunk := toInsert[start:end]
		n, ierr := session.Insert(&chunk)
		if ierr != nil {
			_ = session.Rollback()
			return inserted, updated, failed, samples, eris.Wrap(ierr, "insert potential_cust chunk")
		}
		inserted += int(n)
	}

	if err := session.Commit(); err != nil {
		return inserted, updated, failed, samples, eris.Wrap(err, "commit transaction")
	}
	return inserted, updated, failed, samples, nil
}
