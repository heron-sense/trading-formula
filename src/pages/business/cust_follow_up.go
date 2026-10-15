package business

// AddCustFollowUpRequest is POST /api/business/cust-follow-up body.
type AddCustFollowUpRequest struct {
	CustID    string `json:"custId"`
	Content   string `json:"content"`
	CreatedBy string `json:"createdBy"`
	CreatedAt string `json:"createdAt"` // optional; e.g. 2006-01-02 15:04:05
}

// AddCustFollowUpResponse is POST /api/business/cust-follow-up payload.
type AddCustFollowUpResponse struct {
	Success   bool           `json:"success"`
	Message   string         `json:"message,omitempty"`
	CustID    string         `json:"custId,omitempty"`
	FollowUps []CustFollowUp `json:"followUps,omitempty"`
	Summary   string         `json:"summary,omitempty"`
}

// UpdateCustSummaryRequest is PUT /api/business/cust-summary body.
type UpdateCustSummaryRequest struct {
	CustID  string `json:"custId"`
	Summary string `json:"summary"`
}

// UpdateCustSummaryResponse is PUT /api/business/cust-summary payload.
type UpdateCustSummaryResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	CustID  string `json:"custId,omitempty"`
	Summary string `json:"summary,omitempty"`
}
