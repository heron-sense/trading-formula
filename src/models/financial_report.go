package models

import "github.com/quagmt/udecimal"

// FinancialStatement represents a company's financial statement for a particular period.
type FinancialStatement struct {
	RecordID            string           `xorm:"record_id"`
	Symbol              string           `xorm:"symbol"`
	FSSlot              string           `xorm:"fs_slot"`
	ReportingDate       string           `xorm:"reporting_date"`
	Earnings            udecimal.Decimal `xorm:"earnings"`
	EarningsIncr        udecimal.Decimal `xorm:"earnings_over_predicated"`
	BenefitPerShare     udecimal.Decimal `xorm:"benefit_per_share"`
	BenefitPerShareIncr udecimal.Decimal `xorm:"benefit_per_share_over_predicated"`
}
