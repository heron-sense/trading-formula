package business

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
)

const maxCliAbbrLen = 32

const defaultLabelColor = "#1976d2"

// Allowed label colors for create/update (hex, lowercase).
var allowedLabelColors = map[string]struct{}{
	"#1976d2": {},
	"#388e3c": {},
	"#f57c00": {},
	"#d32f2f": {},
	"#7b1fa2": {},
	"#00838f": {},
	"#5d4037": {},
	"#455a64": {},
}

func (d *Delegate) ensureCustLabelTable() error {
	session := essentials.NewSession(context.Background())
	defer session.Close()

	// Legacy table used label-only PK; recreate if cli_abbr is missing.
	hasTable, err := session.IsTableExist("cust_label")
	if err != nil {
		return eris.Wrap(err, "check cust_label exists")
	}
	if hasTable {
		var n int64
		_, qerr := session.SQL(`
			SELECT COUNT(*) FROM information_schema.COLUMNS
			WHERE TABLE_SCHEMA = DATABASE()
			  AND TABLE_NAME = 'cust_label'
			  AND COLUMN_NAME = 'cli_abbr'
		`).Get(&n)
		if qerr == nil && n == 0 {
			if _, derr := session.Exec("DROP TABLE cust_label"); derr != nil {
				return eris.Wrap(derr, "drop legacy cust_label")
			}
		}
	}

	if err := essentials.Sync(new(CustLabel)); err != nil {
		return eris.Wrap(err, "sync cust_label")
	}
	return nil
}

func normalizeCliAbbr(raw string) (string, error) {
	abbr := strings.TrimSpace(raw)
	if abbr == "" {
		return "", eris.New("cliAbbr is required")
	}
	if len([]rune(abbr)) > maxCliAbbrLen {
		return "", eris.Errorf("cliAbbr must be at most %d characters", maxCliAbbrLen)
	}
	return abbr, nil
}

func normalizeLabel(raw string) (string, error) {
	label := strings.TrimSpace(raw)
	if label == "" {
		return "", eris.New("label is required")
	}
	if len([]rune(label)) > 64 {
		return "", eris.New("label must be at most 64 characters")
	}
	return label, nil
}

func normalizeLabelColor(raw string) (string, error) {
	color := strings.ToLower(strings.TrimSpace(raw))
	if color == "" {
		return defaultLabelColor, nil
	}
	if !strings.HasPrefix(color, "#") {
		color = "#" + color
	}
	if _, ok := allowedLabelColors[color]; !ok {
		return "", eris.New("invalid label color")
	}
	return color, nil
}

func labelColorOrDefault(color string) string {
	color = strings.ToLower(strings.TrimSpace(color))
	if color == "" {
		return defaultLabelColor
	}
	if _, ok := allowedLabelColors[color]; ok {
		return color
	}
	return defaultLabelColor
}

// ListCustLabelStats returns per-label customer counts for one cli_abbr catalog.
func (d *Delegate) ListCustLabelStats(ctx context.Context, rawCliAbbr string) (stats []CustLabelStat, totalCust, untagged int64, err error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return nil, 0, 0, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	totalCust, err = session.Count(new(PotentialCust))
	if err != nil {
		return nil, 0, 0, eris.Wrap(err, "count potential_cust")
	}

	untagged, err = session.Where("tags IS NULL OR JSON_LENGTH(IFNULL(tags, JSON_ARRAY())) = 0").Count(new(PotentialCust))
	if err != nil {
		return nil, 0, 0, eris.Wrap(err, "count untagged potential_cust")
	}

	type row struct {
		Label string `xorm:"label"`
		Color string `xorm:"color"`
		Count int64  `xorm:"cnt"`
	}
	rows := make([]row, 0)
	err = session.SQL(`
		SELECT l.label AS label,
		       l.color AS color,
		       COUNT(c.id) AS cnt
		FROM cust_label l
		LEFT JOIN potential_cust c
		  ON JSON_CONTAINS(IFNULL(c.tags, JSON_ARRAY()), JSON_QUOTE(l.label), '$')
		WHERE l.cli_abbr = ?
		GROUP BY l.label, l.color
		ORDER BY l.label ASC
	`, cliAbbr).Find(&rows)
	if err != nil {
		return nil, 0, 0, eris.Wrap(err, "list cust label stats")
	}

	stats = make([]CustLabelStat, 0, len(rows))
	for _, r := range rows {
		if r.Label == "" {
			continue
		}
		stats = append(stats, CustLabelStat{
			Label: r.Label,
			Color: labelColorOrDefault(r.Color),
			Count: r.Count,
		})
	}
	return stats, totalCust, untagged, nil
}

// ListDistinctCustLabels returns labels (with color) for one cli_abbr.
func (d *Delegate) ListDistinctCustLabels(ctx context.Context, rawCliAbbr string) ([]CustLabelItem, error) {
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return nil, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	rows := make([]CustLabel, 0)
	if err := session.Where("cli_abbr = ?", cliAbbr).OrderBy("label ASC").Find(&rows); err != nil {
		return nil, eris.Wrap(err, "list cust_label")
	}
	out := make([]CustLabelItem, 0, len(rows))
	for _, row := range rows {
		if row.Label == "" {
			continue
		}
		out = append(out, CustLabelItem{
			Label: row.Label,
			Color: labelColorOrDefault(row.Color),
		})
	}
	return out, nil
}

// AddCustLabelResult is the outcome of attaching a label to a customer.
type AddCustLabelResult struct {
	Tags    []string
	Label   string
	Color   string
	CliAbbr string
}

// AddCustLabel upserts label into cust_label for cli_abbr (dedup) and appends to potential_cust.tags.
// Color is stored only when inserting a new catalog row; existing labels keep their color.
func (d *Delegate) AddCustLabel(ctx context.Context, rawCliAbbr, custID, rawLabel, rawColor string) (AddCustLabelResult, error) {
	var empty AddCustLabelResult
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return empty, err
	}
	custID = strings.TrimSpace(custID)
	if custID == "" {
		return empty, eris.New("custId is required")
	}
	label, err := normalizeLabel(rawLabel)
	if err != nil {
		return empty, err
	}
	color, err := normalizeLabelColor(rawColor)
	if err != nil {
		return empty, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()
	if err := session.Begin(); err != nil {
		return empty, eris.Wrap(err, "begin transaction")
	}

	var existing CustLabel
	hasLabel, err := session.Where("cli_abbr = ? AND label = ?", cliAbbr, label).Get(&existing)
	if err != nil {
		_ = session.Rollback()
		return empty, eris.Wrap(err, "check cust_label")
	}
	storedColor := color
	if hasLabel {
		storedColor = labelColorOrDefault(existing.Color)
	} else {
		if _, err := session.Insert(&CustLabel{CliAbbr: cliAbbr, Label: label, Color: color}); err != nil {
			_ = session.Rollback()
			return empty, eris.Wrap(err, "insert cust_label")
		}
	}

	var cust PotentialCust
	has, err := session.Where("id = ?", custID).Get(&cust)
	if err != nil {
		_ = session.Rollback()
		return empty, eris.Wrap(err, "get potential_cust")
	}
	if !has {
		_ = session.Rollback()
		return empty, eris.New("customer not found")
	}

	tags := append([]string{}, cust.Tags...)
	for _, t := range tags {
		if t == label {
			if err := session.Commit(); err != nil {
				return empty, eris.Wrap(err, "commit")
			}
			return AddCustLabelResult{Tags: tags, Label: label, Color: storedColor, CliAbbr: cliAbbr}, nil
		}
	}
	tags = append(tags, label)
	cust.Tags = tags
	if _, err := session.Where("id = ?", custID).Cols("tags").Update(&cust); err != nil {
		_ = session.Rollback()
		return empty, eris.Wrap(err, "update potential_cust.tags")
	}

	if err := session.Commit(); err != nil {
		return empty, eris.Wrap(err, "commit")
	}
	return AddCustLabelResult{Tags: tags, Label: label, Color: storedColor, CliAbbr: cliAbbr}, nil
}

func removeTagFromTags(tags []string, label string) ([]string, bool) {
	if len(tags) == 0 {
		return tags, false
	}
	out := make([]string, 0, len(tags))
	removed := false
	for _, t := range tags {
		if t == label {
			removed = true
			continue
		}
		out = append(out, t)
	}
	if !removed {
		return tags, false
	}
	return out, true
}

// DeleteCustLabelResult is the outcome of deleting a catalog label.
type DeleteCustLabelResult struct {
	CliAbbr              string
	Label                string
	RemovedFromCustomers int64
}

// DeleteCustLabel removes label from every customer's tags, then deletes the catalog row.
func (d *Delegate) DeleteCustLabel(ctx context.Context, rawCliAbbr, rawLabel string) (DeleteCustLabelResult, error) {
	var empty DeleteCustLabelResult
	cliAbbr, err := normalizeCliAbbr(rawCliAbbr)
	if err != nil {
		return empty, err
	}
	label, err := normalizeLabel(rawLabel)
	if err != nil {
		return empty, err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()
	if err := session.Begin(); err != nil {
		return empty, eris.Wrap(err, "begin transaction")
	}

	exists, err := session.Where("cli_abbr = ? AND label = ?", cliAbbr, label).Exist(new(CustLabel))
	if err != nil {
		_ = session.Rollback()
		return empty, eris.Wrap(err, "check cust_label")
	}
	if !exists {
		_ = session.Rollback()
		return empty, eris.New("label not found")
	}

	encoded, err := json.Marshal(label)
	if err != nil {
		_ = session.Rollback()
		return empty, eris.Wrap(err, "encode label")
	}

	customers := make([]PotentialCust, 0)
	if err := session.
		Where("JSON_CONTAINS(IFNULL(tags, JSON_ARRAY()), ?, '$')", string(encoded)).
		Find(&customers); err != nil {
		_ = session.Rollback()
		return empty, eris.Wrap(err, "list customers with label")
	}

	var removedFromCustomers int64
	for i := range customers {
		next, changed := removeTagFromTags(customers[i].Tags, label)
		if !changed {
			continue
		}
		customers[i].Tags = next
		if _, err := session.Where("id = ?", customers[i].ID).Cols("tags").Update(&customers[i]); err != nil {
			_ = session.Rollback()
			return empty, eris.Wrap(err, "update potential_cust.tags")
		}
		removedFromCustomers++
	}

	if _, err := session.Where("cli_abbr = ? AND label = ?", cliAbbr, label).Delete(new(CustLabel)); err != nil {
		_ = session.Rollback()
		return empty, eris.Wrap(err, "delete cust_label")
	}

	if err := session.Commit(); err != nil {
		return empty, eris.Wrap(err, "commit")
	}
	return DeleteCustLabelResult{
		CliAbbr:              cliAbbr,
		Label:                label,
		RemovedFromCustomers: removedFromCustomers,
	}, nil
}
