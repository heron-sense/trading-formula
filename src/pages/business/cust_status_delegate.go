package business

import (
	"context"
	"strings"
	"unicode/utf8"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
)

const maxCustStatusLen = 32

var defaultCustStatuses = []string{"活跃", "待处理", "未激活"}

func (d *Delegate) ensureCustStatusTable() error {
	if err := essentials.Sync(new(CustStatus)); err != nil {
		return eris.Wrap(err, "sync cust_status")
	}
	return nil
}

func normalizeStatusName(raw string) (string, error) {
	status := strings.TrimSpace(raw)
	if status == "" {
		return "", eris.New("status is required")
	}
	if utf8.RuneCountInString(status) > maxCustStatusLen {
		return "", eris.Errorf("status must be at most %d characters", maxCustStatusLen)
	}
	return status, nil
}

func (d *Delegate) seedDefaultCustStatuses(ctx context.Context, cliAbbr string) error {
	session := essentials.NewSession(ctx)
	defer session.Close()

	for i, name := range defaultCustStatuses {
		exists, err := session.Where("cli_abbr = ? AND status = ?", cliAbbr, name).Exist(new(CustStatus))
		if err != nil {
			return eris.Wrap(err, "check cust_status")
		}
		if exists {
			continue
		}
		if _, err := session.Insert(&CustStatus{CliAbbr: cliAbbr, Status: name, SortNo: i + 1}); err != nil {
			return eris.Wrap(err, "insert default cust_status")
		}
	}
	return nil
}

// ListCustStatuses returns available statuses for one cli_abbr (seeds defaults if empty).
func (d *Delegate) ListCustStatuses(ctx context.Context, rawCliAbbr string) ([]string, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return nil, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	n, err := session.Where("cli_abbr = ?", cliAbbr).Count(new(CustStatus))
	if err != nil {
		return nil, eris.Wrap(err, "count cust_status")
	}
	if n == 0 {
		if err := d.seedDefaultCustStatuses(ctx, cliAbbr); err != nil {
			return nil, err
		}
	}

	rows := make([]CustStatus, 0)
	if err := session.Where("cli_abbr = ?", cliAbbr).Asc("sort_no").Asc("status").Find(&rows); err != nil {
		return nil, eris.Wrap(err, "list cust_status")
	}
	out := make([]string, 0, len(rows))
	for _, row := range rows {
		if row.Status != "" {
			out = append(out, row.Status)
		}
	}
	return out, nil
}

// UpdateCustomerStatus sets potential_cust.status after validating against cust_status catalog.
func (d *Delegate) UpdateCustomerStatus(ctx context.Context, rawCliAbbr, custID, rawStatus string) (string, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return "", err
	}
	custID = strings.TrimSpace(custID)
	if custID == "" {
		return "", eris.New("custId is required")
	}
	status, err := normalizeStatusName(rawStatus)
	if err != nil {
		return "", err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	// Ensure catalog has defaults so first-time clients can select.
	n, err := session.Where("cli_abbr = ?", cliAbbr).Count(new(CustStatus))
	if err != nil {
		return "", eris.Wrap(err, "count cust_status")
	}
	if n == 0 {
		if err := d.seedDefaultCustStatuses(ctx, cliAbbr); err != nil {
			return "", err
		}
	}

	ok, err := session.Where("cli_abbr = ? AND status = ?", cliAbbr, status).Exist(new(CustStatus))
	if err != nil {
		return "", eris.Wrap(err, "check cust_status")
	}
	if !ok {
		return "", eris.New("status is not in catalog")
	}

	var cust PotentialCust
	has, err := session.Where("id = ?", custID).Get(&cust)
	if err != nil {
		return "", eris.Wrap(err, "get potential_cust")
	}
	if !has {
		return "", eris.New("customer not found")
	}

	cust.Status = status
	if _, err := session.Where("id = ?", custID).Cols("status").Update(&cust); err != nil {
		return "", eris.Wrap(err, "update potential_cust.status")
	}
	return status, nil
}

// statusMatchValues expands catalog status to include legacy English codes.
func statusMatchValues(name string) []string {
	switch name {
	case "活跃":
		return []string{"活跃", "active"}
	case "待处理":
		return []string{"待处理", "pending"}
	case "未激活":
		return []string{"未激活", "inactive", "非活跃"}
	default:
		return []string{name}
	}
}

// ListCustStatusStats returns per-status customer counts for one cli_abbr catalog.
func (d *Delegate) ListCustStatusStats(ctx context.Context, rawCliAbbr string) ([]CustStatusStat, error) {
	statuses, err := d.ListCustStatuses(ctx, rawCliAbbr)
	if err != nil {
		return nil, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	out := make([]CustStatusStat, 0, len(statuses))
	for _, name := range statuses {
		values := statusMatchValues(name)
		n, cerr := session.In("status", values).Count(new(PotentialCust))
		if cerr != nil {
			return nil, eris.Wrap(cerr, "count potential_cust by status")
		}
		out = append(out, CustStatusStat{Status: name, Count: n})
	}
	return out, nil
}

// AddCustStatus inserts a status into the catalog for cli_abbr.
func (d *Delegate) AddCustStatus(ctx context.Context, rawCliAbbr, rawStatus string) (string, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return "", err
	}
	status, err := normalizeStatusName(rawStatus)
	if err != nil {
		return "", err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	exists, err := session.Where("cli_abbr = ? AND status = ?", cliAbbr, status).Exist(new(CustStatus))
	if err != nil {
		return "", eris.Wrap(err, "check cust_status")
	}
	if exists {
		return "", eris.New("status already exists")
	}

	var maxSort int
	_, _ = session.SQL("SELECT IFNULL(MAX(sort_no), 0) FROM cust_status WHERE cli_abbr = ?", cliAbbr).Get(&maxSort)

	if _, err := session.Insert(&CustStatus{CliAbbr: cliAbbr, Status: status, SortNo: maxSort + 1}); err != nil {
		return "", eris.Wrap(err, "insert cust_status")
	}
	return status, nil
}

// DeleteCustStatus removes a catalog status and reassigns customers to fallback.
func (d *Delegate) DeleteCustStatus(ctx context.Context, rawCliAbbr, rawStatus string) (reassignedTo string, reassignedCount int64, err error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return "", 0, err
	}
	status, err := normalizeStatusName(rawStatus)
	if err != nil {
		return "", 0, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()
	if err := session.Begin(); err != nil {
		return "", 0, eris.Wrap(err, "begin transaction")
	}

	exists, err := session.Where("cli_abbr = ? AND status = ?", cliAbbr, status).Exist(new(CustStatus))
	if err != nil {
		_ = session.Rollback()
		return "", 0, eris.Wrap(err, "check cust_status")
	}
	if !exists {
		_ = session.Rollback()
		return "", 0, eris.New("status not found")
	}

	n, err := session.Where("cli_abbr = ?", cliAbbr).Count(new(CustStatus))
	if err != nil {
		_ = session.Rollback()
		return "", 0, eris.Wrap(err, "count cust_status")
	}
	if n <= 1 {
		_ = session.Rollback()
		return "", 0, eris.New("cannot delete the last status")
	}

	// Prefer 待处理 as fallback; otherwise first remaining status.
	fallback := "待处理"
	needOther := status == fallback
	if !needOther {
		ok, cerr := session.Where("cli_abbr = ? AND status = ?", cliAbbr, fallback).Exist(new(CustStatus))
		if cerr != nil {
			_ = session.Rollback()
			return "", 0, eris.Wrap(cerr, "check fallback status")
		}
		needOther = !ok
	}
	if needOther {
		var other CustStatus
		has, gerr := session.Where("cli_abbr = ? AND status <> ?", cliAbbr, status).Asc("sort_no").Get(&other)
		if gerr != nil {
			_ = session.Rollback()
			return "", 0, eris.Wrap(gerr, "pick fallback status")
		}
		if !has || other.Status == "" {
			_ = session.Rollback()
			return "", 0, eris.New("no fallback status available")
		}
		fallback = other.Status
	}

	values := statusMatchValues(status)
	affected, err := session.In("status", values).Cols("status").Update(&PotentialCust{Status: fallback})
	if err != nil {
		_ = session.Rollback()
		return "", 0, eris.Wrap(err, "reassign potential_cust.status")
	}

	if _, err := session.Where("cli_abbr = ? AND status = ?", cliAbbr, status).Delete(new(CustStatus)); err != nil {
		_ = session.Rollback()
		return "", 0, eris.Wrap(err, "delete cust_status")
	}

	if err := session.Commit(); err != nil {
		return "", 0, eris.Wrap(err, "commit")
	}
	return fallback, affected, nil
}
