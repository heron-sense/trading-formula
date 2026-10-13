package business

// Employee maps to MySQL table employee.
type Employee struct {
	ID         string `xorm:"pk varchar(64) 'id'" json:"id"`
	CompanyID  string `xorm:"varchar(64) notnull index 'company_id'" json:"companyId"`
	UserID     string `xorm:"varchar(64) index 'user_id'" json:"userId"`
	Name       string `xorm:"varchar(64) notnull 'name'" json:"name"`
	Email      string `xorm:"varchar(128) 'email'" json:"email"`
	Phone      string `xorm:"varchar(32) 'phone'" json:"phone"`
	Title      string `xorm:"varchar(64) 'title'" json:"title"`
	Department string `xorm:"varchar(64) 'department'" json:"department"`
	Status     string `xorm:"varchar(16) 'status'" json:"status"` // active | inactive | pending
	HiredAt    string `xorm:"varchar(32) 'hired_at'" json:"hiredAt"`
	Avatar     string `xorm:"varchar(255) 'avatar'" json:"avatar,omitempty"`
}

func (Employee) TableName() string {
	return "employee"
}

// ListEmployeesRequest is the query for company-scoped employee list.
type ListEmployeesRequest struct {
	UserID  string
	Keyword string
	Page    int
	Limit   int
}

// EmployeeListResponse is the list API payload.
type EmployeeListResponse struct {
	Success       bool       `json:"success"`
	Message       string     `json:"message,omitempty"`
	Data          []Employee `json:"data"`
	Total         int        `json:"total"`
	Page          int        `json:"page"`
	Limit         int        `json:"limit"`
	CompanyID     string     `json:"companyId,omitempty"`
	ActiveCount   int        `json:"activeCount"`
	PendingCount  int        `json:"pendingCount"`
	InactiveCount int        `json:"inactiveCount"`
}
