package business

// BatchAssignCustomersRequest is POST /api/business/customers/batch-assign body.
// Assignee is the target employee's single role id.
type BatchAssignCustomersRequest struct {
	CustIDs  []string `json:"custIds"`
	Assignee string   `json:"assignee"`
}

// BatchAssignCustomersResponse is POST /api/business/customers/batch-assign payload.
type BatchAssignCustomersResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	Updated  int    `json:"updated"`
	Assignee string `json:"assignee,omitempty"`
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
