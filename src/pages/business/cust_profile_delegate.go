package business

import (
	"context"
	"strings"
	"unicode/utf8"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/rotisserie/eris"
)

func normalizeCustName(raw string) (string, error) {
	name := strings.TrimSpace(raw)
	if name == "" {
		return "", eris.New("name is required")
	}
	if utf8.RuneCountInString(name) > maxCustNameLen {
		return "", eris.Errorf("name exceeds %d characters", maxCustNameLen)
	}
	return name, nil
}

func normalizeCustPhone(raw string) (string, error) {
	phone := strings.TrimSpace(raw)
	if utf8.RuneCountInString(phone) > maxCustPhoneLen {
		return "", eris.Errorf("phone exceeds %d characters", maxCustPhoneLen)
	}
	return phone, nil
}

func normalizeCustEmail(raw string) (string, error) {
	email := strings.TrimSpace(raw)
	if utf8.RuneCountInString(email) > maxCustEmailLen {
		return "", eris.Errorf("email exceeds %d characters", maxCustEmailLen)
	}
	return email, nil
}

// UpdateCustProfile updates name / phone / email on potential_cust.
func (d *Delegate) UpdateCustProfile(ctx context.Context, custID, rawName, rawPhone, rawEmail string) (name, phone, email string, err error) {
	custID = strings.TrimSpace(custID)
	if custID == "" {
		return "", "", "", eris.New("custId is required")
	}
	name, err = normalizeCustName(rawName)
	if err != nil {
		return "", "", "", err
	}
	phone, err = normalizeCustPhone(rawPhone)
	if err != nil {
		return "", "", "", err
	}
	email, err = normalizeCustEmail(rawEmail)
	if err != nil {
		return "", "", "", err
	}

	session := essentials.NewSession(ctx)
	defer session.Close()

	var cust PotentialCust
	has, err := session.Where("id = ?", custID).Get(&cust)
	if err != nil {
		return "", "", "", eris.Wrap(err, "get potential_cust")
	}
	if !has {
		return "", "", "", eris.New("customer not found")
	}

	cust.Name = name
	cust.Phone = phone
	cust.Email = email
	if _, err := session.Where("id = ?", custID).Cols("name", "phone", "email").Update(&cust); err != nil {
		return "", "", "", eris.Wrap(err, "update potential_cust profile")
	}
	return name, phone, email, nil
}
