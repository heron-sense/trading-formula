package business

import (
	"context"
	"net/http"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
)

// Controller handles HTTP for business/customer APIs.
type Controller struct {
	delegate *Delegate
}

func NewController() *Controller {
	return &Controller{delegate: NewDelegate()}
}

// ListCustomers handles GET /api/business/customers
func (h *Controller) ListCustomers(c context.Context, ctx *app.RequestContext) {
	req := ListCustomersRequest{
		Page:  1,
		Limit: 10,
	}
	if keyword := string(ctx.Query("keyword")); keyword != "" {
		req.Keyword = keyword
	}
	if req.Keyword == "" {
		if keyword := string(ctx.Query("search")); keyword != "" {
			req.Keyword = keyword
		}
	}
	if page := string(ctx.Query("page")); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			req.Page = p
		}
	}
	if limit := string(ctx.Query("pageSize")); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			req.Limit = l
		}
	} else if limit := string(ctx.Query("limit")); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			req.Limit = l
		}
	}

	ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
	ctx.Response.Header.Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	items, total, active, pending, inactive, err := h.delegate.ListCustomers(c, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, CustomerListResponse{
			Success: false,
			Message: err.Error(),
			Data:    []Customer{},
			Page:    req.Page,
			Limit:   req.Limit,
		})
		return
	}

	ctx.JSON(http.StatusOK, CustomerListResponse{
		Success:       true,
		Data:          items,
		Total:         int(total),
		Page:          req.Page,
		Limit:         req.Limit,
		ActiveCount:   int(active),
		PendingCount:  int(pending),
		InactiveCount: int(inactive),
	})
}

func setCORS(ctx *app.RequestContext) {
	ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
	ctx.Response.Header.Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-User-Id")
}

func authUserID(ctx *app.RequestContext) string {
	if v, ok := ctx.Get("auth_user_id"); ok {
		if s, ok := v.(string); ok && s != "" {
			return s
		}
	}
	return essentials.ExtractUserID(ctx)
}

// ListEmployees handles GET /api/business/employees (current user's company only).
func (h *Controller) ListEmployees(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	req := ListEmployeesRequest{
		UserID: authUserID(ctx),
		Page:   1,
		Limit:  10,
	}
	if req.UserID == "" {
		ctx.JSON(http.StatusUnauthorized, EmployeeListResponse{
			Success: false,
			Message: "missing user_id",
			Data:    []Employee{},
		})
		return
	}
	if keyword := string(ctx.Query("keyword")); keyword != "" {
		req.Keyword = keyword
	}
	if page := string(ctx.Query("page")); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			req.Page = p
		}
	}
	if limit := string(ctx.Query("pageSize")); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			req.Limit = l
		}
	} else if limit := string(ctx.Query("limit")); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			req.Limit = l
		}
	}

	items, total, companyID, active, pending, inactive, err := h.delegate.ListEmployees(c, req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, EmployeeListResponse{
			Success: false,
			Message: err.Error(),
			Data:    []Employee{},
			Page:    req.Page,
			Limit:   req.Limit,
		})
		return
	}

	ctx.JSON(http.StatusOK, EmployeeListResponse{
		Success:       true,
		Data:          items,
		Total:         int(total),
		Page:          req.Page,
		Limit:         req.Limit,
		CompanyID:     companyID,
		ActiveCount:   int(active),
		PendingCount:  int(pending),
		InactiveCount: int(inactive),
	})
}

// BatchCreateCustomers handles POST /api/business/customers/batch
func (h *Controller) BatchCreateCustomers(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req BatchCreateCustomersRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, BatchCreateCustomersResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}
	if len(req.Customers) == 0 {
		ctx.JSON(http.StatusBadRequest, BatchCreateCustomersResponse{
			Success: false,
			Message: "customers is required and must not be empty",
		})
		return
	}
	if len(req.Customers) > 5000 {
		ctx.JSON(http.StatusBadRequest, BatchCreateCustomersResponse{
			Success: false,
			Message: "too many customers in one request (max 5000)",
		})
		return
	}

	inserted, updated, failed, samples, err := h.delegate.BatchUpsertCustomers(c, req.Customers)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, BatchCreateCustomersResponse{
			Success:      false,
			Message:      err.Error(),
			Inserted:     inserted,
			Updated:      updated,
			Failed:       failed,
			Total:        len(req.Customers),
			ErrorSamples: samples,
		})
		return
	}

	ctx.JSON(http.StatusOK, BatchCreateCustomersResponse{
		Success:      failed == 0,
		Message:      "batch upsert finished",
		Inserted:     inserted,
		Updated:      updated,
		Failed:       failed,
		Total:        len(req.Customers),
		ErrorSamples: samples,
	})
}
