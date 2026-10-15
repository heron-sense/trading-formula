package business

// PotentialCust maps to MySQL table potential_cust.
// Column names are explicit to avoid SnakeMapper turning ID into i_d.
type PotentialCust struct {
	ID               string         `xorm:"pk varchar(64) 'id'" json:"id"`
	Name             string         `xorm:"varchar(64) notnull 'name'" json:"name"`
	Email            string         `xorm:"varchar(128) 'email'" json:"email"`
	Phone            string         `xorm:"varchar(32) 'phone'" json:"phone"`
	Company          string         `xorm:"varchar(128) 'company'" json:"company"`
	Status           string         `xorm:"varchar(16) 'status'" json:"status"` // active | inactive | pending
	Location         string         `xorm:"varchar(128) 'location'" json:"location"`
	RegistrationDate string         `xorm:"varchar(32) 'registration_date'" json:"registrationDate"`
	LastContact      string         `xorm:"varchar(32) 'last_contact'" json:"lastContact"`
	Avatar           string         `xorm:"varchar(255) 'avatar'" json:"avatar,omitempty"`
	Tags             []string       `xorm:"json 'tags'" json:"tags,omitempty"`
	Summary          string         `xorm:"varchar(100) 'summary'" json:"summary,omitempty"`
	FollowUps        []CustFollowUp `xorm:"json 'follow_ups'" json:"followUps,omitempty"`
	OwnerID          string         `xorm:"varchar(64) index 'owner_id'" json:"ownerId,omitempty"`
	OwnerName        string         `xorm:"varchar(64) 'owner_name'" json:"ownerName,omitempty"`
}

// CustFollowUp is one follow-up note on a customer.
type CustFollowUp struct {
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
	CreatedBy string `json:"createdBy,omitempty"`
}

func (PotentialCust) TableName() string {
	return "potential_cust"
}

// Customer is the API-facing customer DTO (same fields as PotentialCust JSON).
type Customer = PotentialCust

// ListCustomersRequest is the query payload for listing customers.
type ListCustomersRequest struct {
	Keyword              string
	Name                 string
	Tag                  string   // single label or __untagged__
	Tags                 []string // multi-label (match any)
	RegistrationDateFrom string
	RegistrationDateTo   string
	LastContactFrom      string
	LastContactTo        string
	Status               string // catalog status name (matches legacy codes too)
	Page                 int
	Limit                int
}

// CustomerListResponse matches the marketplace list response shape.
type CustomerListResponse struct {
	Success       bool       `json:"success"`
	Message       string     `json:"message,omitempty"`
	Data          []Customer `json:"data"`
	Total         int        `json:"total"`
	Page          int        `json:"page"`
	Limit         int        `json:"limit"`
	ActiveCount   int        `json:"activeCount"`
	PendingCount  int        `json:"pendingCount"`
	InactiveCount int        `json:"inactiveCount"`
}

// BatchCreateCustomersRequest is the body for bulk import/create.
type BatchCreateCustomersRequest struct {
	Customers []Customer `json:"customers"`
}

// BatchCreateCustomersResponse reports import results.
type BatchCreateCustomersResponse struct {
	Success      bool     `json:"success"`
	Message      string   `json:"message,omitempty"`
	Inserted     int      `json:"inserted"`
	Updated      int      `json:"updated"`
	Failed       int      `json:"failed"`
	Total        int      `json:"total"`
	ErrorSamples []string `json:"errorSamples,omitempty"`
}
