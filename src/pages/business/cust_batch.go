package business

// BatchAssignCustomersRequest is POST /api/business/customers/batch-assign body.
type BatchAssignCustomersRequest struct {
	CustIDs   []string `json:"custIds"`
	OwnerID   string   `json:"ownerId"`
	OwnerName string   `json:"ownerName"`
}

// BatchAssignCustomersResponse is POST /api/business/customers/batch-assign payload.
type BatchAssignCustomersResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message,omitempty"`
	Updated   int    `json:"updated"`
	OwnerID   string `json:"ownerId,omitempty"`
	OwnerName string `json:"ownerName,omitempty"`
}

// BatchDeleteCustomersRequest is POST /api/business/customers/batch-delete body.
type BatchDeleteCustomersRequest struct {
	CustIDs []string `json:"custIds"`
}

// BatchDeleteCustomersResponse is POST /api/business/customers/batch-delete payload.
type BatchDeleteCustomersResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Deleted int    `json:"deleted"`
}
