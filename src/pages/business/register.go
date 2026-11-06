package business

import (
	"github.com/cloudwego/hertz/pkg/route"
)

func Register(group *route.RouterGroup) {
	handler := NewController()
	group.POST("/api/business/check-operations", handler.CheckOperations)
	group.GET("/api/business/customers", handler.ListCustomers)
	group.GET("/api/business/customer-assignee-stats", handler.ListAssigneeStats)
	group.POST("/api/business/customers/batch", handler.BatchCreateCustomers)
	group.POST("/api/business/customers/batch-assign", handler.BatchAssignCustomers)
	group.POST("/api/business/customers/batch-delete", handler.BatchDeleteCustomers)
	group.GET("/api/business/employees", handler.ListEmployees)
	group.GET("/api/business/staff-roles", handler.ListStaffRoles)
	group.POST("/api/business/staff-role", handler.AddStaffRole)
	group.DELETE("/api/business/staff-role", handler.DeleteStaffRole)
	group.PUT("/api/business/user-staff-role", handler.UpdateUserStaffRole)
	group.GET("/api/business/cust-labels", handler.ListCustLabels)
	group.GET("/api/business/cust-label-stats", handler.ListCustLabelStats)
	group.POST("/api/business/cust-label", handler.AddCustLabel)
	group.DELETE("/api/business/cust-label", handler.DeleteCustLabel)
	group.PUT("/api/business/cust-summary", handler.UpdateCustSummary)
	group.PUT("/api/business/cust-profile", handler.UpdateCustProfile)
	group.POST("/api/business/cust-follow-up", handler.AddCustFollowUp)
	group.GET("/api/business/cust-statuses", handler.ListCustStatuses)
	group.GET("/api/business/cust-status-stats", handler.ListCustStatusStats)
	group.POST("/api/business/cust-status-def", handler.AddCustStatusDef)
	group.DELETE("/api/business/cust-status-def", handler.DeleteCustStatusDef)
	group.PUT("/api/business/cust-customer-status", handler.UpdateCustomerStatus)
}
