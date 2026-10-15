package business

// Operation codes (METHOD + path) that gate management / edit UI.
const (
	OpCustLabelManage  = "DELETE/api/business/cust-label"
	OpCustStatusManage = "POST/api/business/cust-status-def"
	OpCustProfileEdit  = "PUT/api/business/cust-profile"
)

// CheckOperationsRequest is POST /api/business/check-operations body.
type CheckOperationsRequest struct {
	Operations []string `json:"operations"`
}

// CheckOperationsResponse is POST /api/business/check-operations payload.
type CheckOperationsResponse struct {
	Success    bool            `json:"success"`
	Message    string          `json:"message,omitempty"`
	Authorized map[string]bool `json:"authorized"`
}
