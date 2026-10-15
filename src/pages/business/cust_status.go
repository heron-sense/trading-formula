package business

// CustStatus is the per-client status catalog.
type CustStatus struct {
	CliAbbr string `xorm:"pk varchar(32) 'cli_abbr'" json:"cliAbbr"`
	Status  string `xorm:"pk varchar(32) 'status'" json:"status"`
	SortNo  int    `xorm:"int notnull default(0) 'sort_no'" json:"sortNo"`
}

func (CustStatus) TableName() string {
	return "cust_status"
}

// CustStatusesResponse is GET /api/business/cust-statuses payload.
type CustStatusesResponse struct {
	Success bool     `json:"success"`
	Message string   `json:"message,omitempty"`
	Data    []string `json:"data"`
}

// UpdateCustStatusRequest is PUT /api/business/cust-customer-status body.
type UpdateCustStatusRequest struct {
	CliAbbr string `json:"cliAbbr"`
	CustID  string `json:"custId"`
	Status  string `json:"status"`
}

// UpdateCustStatusResponse is PUT /api/business/cust-customer-status payload.
type UpdateCustStatusResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	CustID  string `json:"custId,omitempty"`
	Status  string `json:"status,omitempty"`
}

// CustStatusStat is one status's customer count.
type CustStatusStat struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

// CustStatusStatsResponse is GET /api/business/cust-status-stats payload.
type CustStatusStatsResponse struct {
	Success bool             `json:"success"`
	Message string           `json:"message,omitempty"`
	Data    []CustStatusStat `json:"data"`
}

// AddCustStatusRequest is POST /api/business/cust-status-def body.
type AddCustStatusRequest struct {
	CliAbbr string `json:"cliAbbr"`
	Status  string `json:"status"`
}

// AddCustStatusResponse is POST /api/business/cust-status-def payload.
type AddCustStatusResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	CliAbbr string `json:"cliAbbr,omitempty"`
	Status  string `json:"status,omitempty"`
}

// DeleteCustStatusResponse is DELETE /api/business/cust-status-def payload.
type DeleteCustStatusResponse struct {
	Success                 bool   `json:"success"`
	Message                 string `json:"message,omitempty"`
	CliAbbr                 string `json:"cliAbbr,omitempty"`
	Status                  string `json:"status,omitempty"`
	ReassignedTo            string `json:"reassignedTo,omitempty"`
	ReassignedFromCustomers int64  `json:"reassignedFromCustomers,omitempty"`
}
