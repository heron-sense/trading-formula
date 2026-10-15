package business

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"unicode/utf8"

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
	if err := d.ensureCustLabelTable(); err != nil {
		log.Printf("cust_label sync warning: %v", err)
	}
	if err := d.ensureCustStatusTable(); err != nil {
		log.Printf("cust_status sync warning: %v", err)
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

func nameCond(name string) builder.Cond {
	name = strings.TrimSpace(name)
	if name == "" {
		return builder.NewCond()
	}
	return builder.Like{"name", name}
}

const untaggedFilterSentinel = "__untagged__"

func tagFilterCond(tag string) builder.Cond {
	tag = strings.TrimSpace(tag)
	if tag == "" {
		return builder.NewCond()
	}
	if tag == untaggedFilterSentinel {
		return builder.Expr("tags IS NULL OR JSON_LENGTH(IFNULL(tags, JSON_ARRAY())) = 0")
	}
	encoded, err := json.Marshal(tag)
	if err != nil {
		return builder.Expr("1 = 0")
	}
	// Match JSON array element, e.g. tags contains "VIP"
	return builder.Expr("JSON_CONTAINS(IFNULL(tags, JSON_ARRAY()), ?, '$')", string(encoded))
}

func tagsAnyCond(tags []string) builder.Cond {
	var parts []builder.Cond
	for _, t := range tags {
		t = strings.TrimSpace(t)
		if t == "" {
			continue
		}
		parts = append(parts, tagFilterCond(t))
	}
	if len(parts) == 0 {
		return builder.NewCond()
	}
	if len(parts) == 1 {
		return parts[0]
	}
	return builder.Or(parts...)
}

func dateRangeCond(column, from, to string) builder.Cond {
	from = strings.TrimSpace(from)
	to = strings.TrimSpace(to)
	cond := builder.NewCond()
	if from != "" {
		cond = cond.And(builder.Expr(column+" >= ?", from))
	}
	if to != "" {
		cond = cond.And(builder.Expr(column+" <= ?", to))
	}
	return cond
}

func statusFilterCond(status string) builder.Cond {
	status = strings.TrimSpace(status)
	if status == "" {
		return builder.NewCond()
	}
	values := statusMatchValues(status)
	if len(values) == 1 {
		return builder.Eq{"status": values[0]}
	}
	return builder.In("status", values)
}

func customerListCond(req ListCustomersRequest) builder.Cond {
	cond := keywordCond(req.Keyword)
	cond = cond.And(nameCond(req.Name))
	if req.Tag != "" {
		cond = cond.And(tagFilterCond(req.Tag))
	} else if len(req.Tags) > 0 {
		cond = cond.And(tagsAnyCond(req.Tags))
	}
	cond = cond.And(statusFilterCond(req.Status))
	cond = cond.And(dateRangeCond("registration_date", req.RegistrationDateFrom, req.RegistrationDateTo))
	cond = cond.And(dateRangeCond("last_contact", req.LastContactFrom, req.LastContactTo))
	return cond
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

	cond := customerListCond(req)

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
	c.Status = strings.TrimSpace(c.Status)
	switch c.Status {
	case "active":
		c.Status = "活跃"
	case "pending", "":
		c.Status = "待处理"
	case "inactive":
		c.Status = "未激活"
	default:
		if utf8.RuneCountInString(c.Status) > maxCustStatusLen {
			return eris.Errorf("status must be at most %d characters", maxCustStatusLen)
		}
	}
	c.Summary = truncateRunes(strings.TrimSpace(c.Summary), maxCustomerSummaryLen)
	return nil
}

const maxCustomerSummaryLen = 100
const maxFollowUpContentLen = 500

func truncateRunes(s string, max int) string {
	runes := []rune(s)
	if len(runes) <= max {
		return s
	}
	return string(runes[:max])
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
