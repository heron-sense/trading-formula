package business

import (
	"github.com/cloudwego/hertz/pkg/route"
)

func Register(group *route.RouterGroup) {
	handler := NewController()
	group.GET("/api/business/customers", handler.ListCustomers)
	group.POST("/api/business/customers/batch", handler.BatchCreateCustomers)
	group.GET("/api/business/employees", handler.ListEmployees)
}
