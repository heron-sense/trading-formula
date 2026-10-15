package business

const (
	maxCustNameLen  = 64
	maxCustPhoneLen = 32
	maxCustEmailLen = 128
)

// UpdateCustProfileRequest is PUT /api/business/cust-profile body.
type UpdateCustProfileRequest struct {
	CustID string `json:"custId"`
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Email  string `json:"email"`
}

// UpdateCustProfileResponse is PUT /api/business/cust-profile payload.
type UpdateCustProfileResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	CustID  string `json:"custId,omitempty"`
	Name    string `json:"name,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Email   string `json:"email,omitempty"`
}
