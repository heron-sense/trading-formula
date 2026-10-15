package business

import (
	"context"
	"sort"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
)

func normalizeFollowUpContent(raw string) (string, error) {
	content := strings.TrimSpace(raw)
	if content == "" {
		return "", eris.New("content is required")
	}
	if utf8.RuneCountInString(content) > maxFollowUpContentLen {
		return "", eris.Errorf("content must be at most %d characters", maxFollowUpContentLen)
	}
	return content, nil
}

func normalizeSummaryInput(raw string) (string, error) {
	summary := strings.TrimSpace(raw)
	if utf8.RuneCountInString(summary) > maxCustomerSummaryLen {
		return "", eris.Errorf("summary must be at most %d characters", maxCustomerSummaryLen)
	}
	return summary, nil
}

// UpdateCustSummary sets potential_cust.summary (max 100 runes).
func (d *Delegate) UpdateCustSummary(ctx context.Context, custID, rawSummary string) (string, error) {
	custID = strings.TrimSpace(custID)
	if custID == "" {
		return "", eris.New("custId is required")
	}
	summary, err := normalizeSummaryInput(rawSummary)
	if err != nil {
		return "", err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	var cust PotentialCust
	has, err := session.Where("id = ?", custID).Get(&cust)
	if err != nil {
		return "", eris.Wrap(err, "get potential_cust")
	}
	if !has {
		return "", eris.New("customer not found")
	}

	cust.Summary = summary
	if _, err := session.Where("id = ?", custID).Cols("summary").Update(&cust); err != nil {
		return "", eris.Wrap(err, "update potential_cust.summary")
	}
	return summary, nil
}

func normalizeFollowUpCreatedAt(raw string) (time.Time, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return time.Now(), nil
	}
	raw = strings.ReplaceAll(raw, "T", " ")
	layouts := []string{
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		"2006/01/02 15:04:05",
		"2006/01/02 15:04",
		time.RFC3339,
	}
	var lastErr error
	for _, layout := range layouts {
		t, err := time.ParseInLocation(layout, raw, time.Local)
		if err == nil {
			return t, nil
		}
		lastErr = err
	}
	if lastErr != nil {
		return time.Time{}, eris.New("invalid createdAt; use YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss")
	}
	return time.Time{}, eris.New("invalid createdAt")
}

// AddCustFollowUp adds a follow-up note (sorted newest-first) and refreshes last_contact.
func (d *Delegate) AddCustFollowUp(ctx context.Context, custID, rawContent, createdBy, rawCreatedAt string) ([]CustFollowUp, error) {
	custID = strings.TrimSpace(custID)
	if custID == "" {
		return nil, eris.New("custId is required")
	}
	content, err := normalizeFollowUpContent(rawContent)
	if err != nil {
		return nil, err
	}
	createdAt, err := normalizeFollowUpCreatedAt(rawCreatedAt)
	if err != nil {
		return nil, err
	}
	createdBy = truncateRunes(strings.TrimSpace(createdBy), 64)

	session := essentials.NewSession(ctx)
	defer session.Close()
	if err := session.Begin(); err != nil {
		return nil, eris.Wrap(err, "begin transaction")
	}

	var cust PotentialCust
	has, err := session.Where("id = ?", custID).Get(&cust)
	if err != nil {
		_ = session.Rollback()
		return nil, eris.Wrap(err, "get potential_cust")
	}
	if !has {
		_ = session.Rollback()
		return nil, eris.New("customer not found")
	}

	entry := CustFollowUp{
		Content:   content,
		CreatedAt: createdAt.Format("2006-01-02 15:04:05"),
		CreatedBy: createdBy,
	}
	followUps := make([]CustFollowUp, 0, len(cust.FollowUps)+1)
	followUps = append(followUps, cust.FollowUps...)
	followUps = append(followUps, entry)
	sort.SliceStable(followUps, func(i, j int) bool {
		return followUps[i].CreatedAt > followUps[j].CreatedAt
	})
	cust.FollowUps = followUps
	cust.LastContact = createdAt.Format("2006-01-02")

	if _, err := session.Where("id = ?", custID).Cols("follow_ups", "last_contact").Update(&cust); err != nil {
		_ = session.Rollback()
		return nil, eris.Wrap(err, "update potential_cust.follow_ups")
	}
	if err := session.Commit(); err != nil {
		return nil, eris.Wrap(err, "commit")
	}
	return followUps, nil
}
