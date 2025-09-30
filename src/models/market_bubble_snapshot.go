package models

import (
	"github.com/quagmt/udecimal"
)

type MarketBubbleSnapshot struct {
	RecordID     string           `xorm:"record_id" json:"record_id"`
	Symbol       string           `xorm:"symbol" json:"symbol"`
	TradingDate  string           `xorm:"trading_date" json:"trading_date"`
	MarketCap    int64            `xorm:"market_cap" json:"market_cap"`
	BetaFactor   udecimal.Decimal `xorm:"beta_factor" json:"beta_factor"`
	TradedAmount udecimal.Decimal `xorm:"traded_amount" json:"traded_amount"`
	TradedQty    udecimal.Decimal `xorm:"traded_qty" json:"traded_qty"`
	TurnoverRate udecimal.Decimal `xorm:"turnover_rate" json:"turnover_rate"`
	TopPrice     udecimal.Decimal `xorm:"top_price" json:"top_price"`
	BottomPrice  udecimal.Decimal `xorm:"bottom_price" json:"bottom_price"`
	PeRatio      udecimal.Decimal `xorm:"pe_ratio" json:"pe_ratio"` //市盈率
	PbRatio      udecimal.Decimal `xorm:"pb_ratio" json:"pb_ratio"` //市净率
	AvgPrice     udecimal.Decimal `xorm:"avg_price" json:"avg_price"`
	FRDate       string           `xorm:"fr_date" json:"fr_date"` // financial report date
}
