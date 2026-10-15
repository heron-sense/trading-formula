package business

// CustLabel is the per-client label catalog (deduplicated by cli_abbr + label).
type CustLabel struct {
	CliAbbr string `xorm:"pk varchar(32) 'cli_abbr'" json:"cliAbbr"`
	Label   string `xorm:"pk varchar(64) 'label'" json:"label"`
	Color   string `xorm:"varchar(16) notnull default('#1976d2') 'color'" json:"color"`
}

func (CustLabel) TableName() string {
	return "cust_label"
}

// CustLabelItem is label + display color for API responses.
type CustLabelItem struct {
	Label string `json:"label"`
	Color string `json:"color"`
}

// AddCustLabelRequest is POST /api/business/cust-label body.
type AddCustLabelRequest struct {
	CliAbbr string `json:"cliAbbr"`
	CustID  string `json:"custId"`
	Label   string `json:"label"`
	Color   string `json:"color"`
}

// CustLabelsResponse is GET /api/business/cust-labels payload.
type CustLabelsResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message,omitempty"`
	Data    []CustLabelItem `json:"data"`
}

// AddCustLabelResponse is POST /api/business/cust-label payload.
type AddCustLabelResponse struct {
	Success bool     `json:"success"`
	Message string   `json:"message,omitempty"`
	CliAbbr string   `json:"cliAbbr,omitempty"`
	CustID  string   `json:"custId,omitempty"`
	Label   string   `json:"label,omitempty"`
	Color   string   `json:"color,omitempty"`
	Tags    []string `json:"tags,omitempty"`
}

// DeleteCustLabelResponse is DELETE /api/business/cust-label payload.
type DeleteCustLabelResponse struct {
	Success              bool   `json:"success"`
	Message              string `json:"message,omitempty"`
	CliAbbr              string `json:"cliAbbr,omitempty"`
	Label                string `json:"label,omitempty"`
	RemovedFromCustomers int64  `json:"removedFromCustomers,omitempty"`
}

// CustLabelStat is one label's customer count.
type CustLabelStat struct {
	Label string `json:"label"`
	Color string `json:"color"`
	Count int64  `json:"count"`
}

// CustLabelStatsResponse is GET /api/business/cust-label-stats payload.
type CustLabelStatsResponse struct {
	Success      bool            `json:"success"`
	Message      string          `json:"message,omitempty"`
	Data         []CustLabelStat `json:"data"`
	TotalCust    int64           `json:"totalCust"`
	UntaggedCust int64           `json:"untaggedCust"`
}
