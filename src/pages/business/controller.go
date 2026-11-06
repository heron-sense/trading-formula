package business

import (
	"context"
	"net/http"
	"strconv"
	"strings"

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

// CheckOperations handles POST /api/business/check-operations
// Probes EdDSA ACL for the listed operation codes (token already validated by middleware).
func (h *Controller) CheckOperations(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req CheckOperationsRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, CheckOperationsResponse{
			Success:    false,
			Message:    "Invalid request body: " + err.Error(),
			Authorized: map[string]bool{},
		})
		return
	}

	token := essentials.ExtractAccessToken(ctx)
	userID := essentials.ExtractUserID(ctx)
	out := make(map[string]bool, len(req.Operations))
	for _, op := range req.Operations {
		op = strings.TrimSpace(op)
		if op == "" {
			continue
		}
		result, err := essentials.CallValidate(c, essentials.ValidateRequest{
			AccessToken:   token,
			UserID:        userID,
			OperationCode: op,
		})
		out[op] = err == nil && result != nil && result.Validated && result.Authorized
	}

	ctx.JSON(http.StatusOK, CheckOperationsResponse{
		Success:    true,
		Authorized: out,
	})
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
	if name := string(ctx.Query("name")); name != "" {
		req.Name = name
	}
	if tag := string(ctx.Query("tag")); tag != "" {
		req.Tag = tag
	} else if tag := string(ctx.Query("label")); tag != "" {
		req.Tag = tag
	}
	if tags := string(ctx.Query("tags")); tags != "" {
		for _, part := range strings.Split(tags, ",") {
			part = strings.TrimSpace(part)
			if part != "" {
				req.Tags = append(req.Tags, part)
			}
		}
	}
	if v := string(ctx.Query("registrationDateFrom")); v != "" {
		req.RegistrationDateFrom = v
	}
	if v := string(ctx.Query("registrationDateTo")); v != "" {
		req.RegistrationDateTo = v
	}
	if v := string(ctx.Query("lastContactFrom")); v != "" {
		req.LastContactFrom = v
	}
	if v := string(ctx.Query("lastContactTo")); v != "" {
		req.LastContactTo = v
	}
	if v := string(ctx.Query("status")); v != "" {
		req.Status = v
	}
	if v := string(ctx.Query("roleId")); v != "" {
		req.RoleID = v
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

// ListCustLabelStats handles GET /api/business/cust-label-stats?cliAbbr=xxx
func (h *Controller) ListCustLabelStats(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	cliAbbr := string(ctx.Query("cliAbbr"))
	if cliAbbr == "" {
		cliAbbr = string(ctx.Query("cli_abbr"))
	}
	stats, totalCust, untagged, err := h.delegate.ListCustLabelStats(c, cliAbbr)
	if err != nil {
		status := http.StatusBadRequest
		if !strings.Contains(err.Error(), "cliAbbr") {
			status = http.StatusInternalServerError
		}
		ctx.JSON(status, CustLabelStatsResponse{
			Success: false,
			Message: err.Error(),
			Data:    []CustLabelStat{},
		})
		return
	}
	ctx.JSON(http.StatusOK, CustLabelStatsResponse{
		Success:      true,
		Data:         stats,
		TotalCust:    totalCust,
		UntaggedCust: untagged,
	})
}

// ListCustLabels handles GET /api/business/cust-labels?cliAbbr=xxx (deduplicated per client).
func (h *Controller) ListCustLabels(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	cliAbbr := string(ctx.Query("cliAbbr"))
	if cliAbbr == "" {
		cliAbbr = string(ctx.Query("cli_abbr"))
	}
	labels, err := h.delegate.ListDistinctCustLabels(c, cliAbbr)
	if err != nil {
		status := http.StatusBadRequest
		if !strings.Contains(err.Error(), "cliAbbr") {
			status = http.StatusInternalServerError
		}
		ctx.JSON(status, CustLabelsResponse{
			Success: false,
			Message: err.Error(),
			Data:    []CustLabelItem{},
		})
		return
	}
	ctx.JSON(http.StatusOK, CustLabelsResponse{
		Success: true,
		Data:    labels,
	})
}

// AddCustLabel handles POST /api/business/cust-label.
func (h *Controller) AddCustLabel(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req AddCustLabelRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, AddCustLabelResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	result, err := h.delegate.AddCustLabel(c, req.CliAbbr, req.CustID, req.Label, req.Color)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "customer not found" {
			status = http.StatusNotFound
		}
		ctx.JSON(status, AddCustLabelResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, AddCustLabelResponse{
		Success: true,
		Message: "label added",
		CliAbbr: result.CliAbbr,
		CustID:  strings.TrimSpace(req.CustID),
		Label:   result.Label,
		Color:   result.Color,
		Tags:    result.Tags,
	})
}

// DeleteCustLabel handles DELETE /api/business/cust-label?cliAbbr=&label=
func (h *Controller) DeleteCustLabel(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	cliAbbr := string(ctx.Query("cliAbbr"))
	if cliAbbr == "" {
		cliAbbr = string(ctx.Query("cli_abbr"))
	}
	label := string(ctx.Query("label"))

	result, err := h.delegate.DeleteCustLabel(c, cliAbbr, label)
	if err != nil {
		status := http.StatusBadRequest
		switch {
		case err.Error() == "label not found":
			status = http.StatusNotFound
		case !strings.Contains(err.Error(), "cliAbbr") &&
			!strings.Contains(err.Error(), "label"):
			status = http.StatusInternalServerError
		}
		ctx.JSON(status, DeleteCustLabelResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, DeleteCustLabelResponse{
		Success:              true,
		Message:              "label deleted",
		CliAbbr:              result.CliAbbr,
		Label:                result.Label,
		RemovedFromCustomers: result.RemovedFromCustomers,
	})
}

// ListCustStatusStats handles GET /api/business/cust-status-stats?cliAbbr=
func (h *Controller) ListCustStatusStats(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	cliAbbr := string(ctx.Query("cliAbbr"))
	if cliAbbr == "" {
		cliAbbr = string(ctx.Query("cli_abbr"))
	}
	stats, err := h.delegate.ListCustStatusStats(c, cliAbbr)
	if err != nil {
		status := http.StatusBadRequest
		if !strings.Contains(err.Error(), "cliAbbr") {
			status = http.StatusInternalServerError
		}
		ctx.JSON(status, CustStatusStatsResponse{
			Success: false,
			Message: err.Error(),
			Data:    []CustStatusStat{},
		})
		return
	}
	ctx.JSON(http.StatusOK, CustStatusStatsResponse{
		Success: true,
		Data:    stats,
	})
}

// AddCustStatusDef handles POST /api/business/cust-status-def
func (h *Controller) AddCustStatusDef(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	var req AddCustStatusRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, AddCustStatusResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}
	status, err := h.delegate.AddCustStatus(c, req.CliAbbr, req.Status)
	if err != nil {
		code := http.StatusBadRequest
		ctx.JSON(code, AddCustStatusResponse{Success: false, Message: err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, AddCustStatusResponse{
		Success: true,
		Message: "status added",
		CliAbbr: strings.TrimSpace(req.CliAbbr),
		Status:  status,
	})
}

// DeleteCustStatusDef handles DELETE /api/business/cust-status-def?cliAbbr=&status=
func (h *Controller) DeleteCustStatusDef(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	cliAbbr := string(ctx.Query("cliAbbr"))
	if cliAbbr == "" {
		cliAbbr = string(ctx.Query("cli_abbr"))
	}
	status := string(ctx.Query("status"))
	reassignedTo, count, err := h.delegate.DeleteCustStatus(c, cliAbbr, status)
	if err != nil {
		code := http.StatusBadRequest
		if err.Error() == "status not found" {
			code = http.StatusNotFound
		}
		ctx.JSON(code, DeleteCustStatusResponse{Success: false, Message: err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, DeleteCustStatusResponse{
		Success:                 true,
		Message:                 "status deleted",
		CliAbbr:                 cliAbbr,
		Status:                  strings.TrimSpace(status),
		ReassignedTo:            reassignedTo,
		ReassignedFromCustomers: count,
	})
}

// ListCustStatuses handles GET /api/business/cust-statuses?cliAbbr=
func (h *Controller) ListCustStatuses(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	cliAbbr := string(ctx.Query("cliAbbr"))
	if cliAbbr == "" {
		cliAbbr = string(ctx.Query("cli_abbr"))
	}
	statuses, err := h.delegate.ListCustStatuses(c, cliAbbr)
	if err != nil {
		status := http.StatusBadRequest
		if !strings.Contains(err.Error(), "cliAbbr") {
			status = http.StatusInternalServerError
		}
		ctx.JSON(status, CustStatusesResponse{
			Success: false,
			Message: err.Error(),
			Data:    []string{},
		})
		return
	}
	ctx.JSON(http.StatusOK, CustStatusesResponse{
		Success: true,
		Data:    statuses,
	})
}

// UpdateCustomerStatus handles PUT /api/business/cust-customer-status
func (h *Controller) UpdateCustomerStatus(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req UpdateCustStatusRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, UpdateCustStatusResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	status, err := h.delegate.UpdateCustomerStatus(c, req.CliAbbr, req.CustID, req.Status)
	if err != nil {
		code := http.StatusBadRequest
		if err.Error() == "customer not found" {
			code = http.StatusNotFound
		}
		ctx.JSON(code, UpdateCustStatusResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, UpdateCustStatusResponse{
		Success: true,
		Message: "status updated",
		CustID:  strings.TrimSpace(req.CustID),
		Status:  status,
	})
}

// UpdateCustProfile handles PUT /api/business/cust-profile
func (h *Controller) UpdateCustProfile(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req UpdateCustProfileRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, UpdateCustProfileResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	name, phone, email, err := h.delegate.UpdateCustProfile(c, req.CustID, req.Name, req.Phone, req.Email)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "customer not found" {
			status = http.StatusNotFound
		}
		ctx.JSON(status, UpdateCustProfileResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, UpdateCustProfileResponse{
		Success: true,
		Message: "profile updated",
		CustID:  strings.TrimSpace(req.CustID),
		Name:    name,
		Phone:   phone,
		Email:   email,
	})
}

// UpdateCustSummary handles PUT /api/business/cust-summary
func (h *Controller) UpdateCustSummary(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req UpdateCustSummaryRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, UpdateCustSummaryResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	summary, err := h.delegate.UpdateCustSummary(c, req.CustID, req.Summary)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "customer not found" {
			status = http.StatusNotFound
		}
		ctx.JSON(status, UpdateCustSummaryResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, UpdateCustSummaryResponse{
		Success: true,
		Message: "summary updated",
		CustID:  strings.TrimSpace(req.CustID),
		Summary: summary,
	})
}

// AddCustFollowUp handles POST /api/business/cust-follow-up
func (h *Controller) AddCustFollowUp(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req AddCustFollowUpRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, AddCustFollowUpResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	followUps, err := h.delegate.AddCustFollowUp(c, req.CustID, req.Content, req.CreatedBy, req.CreatedAt)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "customer not found" {
			status = http.StatusNotFound
		}
		ctx.JSON(status, AddCustFollowUpResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, AddCustFollowUpResponse{
		Success:   true,
		Message:   "follow-up added",
		CustID:    strings.TrimSpace(req.CustID),
		FollowUps: followUps,
	})
}

// BatchCreateCustomers handles POST /api/business/customers/batch
// BatchAssignCustomers handles POST /api/business/customers/batch-assign
func (h *Controller) BatchAssignCustomers(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req BatchAssignCustomersRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, BatchAssignCustomersResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	updated, assignee, err := h.delegate.BatchAssignCustomers(c, req.CustIDs, req.Assignee)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, BatchAssignCustomersResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, BatchAssignCustomersResponse{
		Success:  true,
		Message:  "customers assigned",
		Updated:  updated,
		Assignee: assignee,
	})
}

// BatchDeleteCustomers handles POST /api/business/customers/batch-delete
func (h *Controller) BatchDeleteCustomers(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)

	var req BatchDeleteCustomersRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, BatchDeleteCustomersResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	deleted, err := h.delegate.BatchDeleteCustomers(c, req.CustIDs)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, BatchDeleteCustomersResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, BatchDeleteCustomersResponse{
		Success: true,
		Message: "customers deleted",
		Deleted: deleted,
	})
}

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

func queryCliAbbr(ctx *app.RequestContext) string {
	cliAbbr := string(ctx.Query("cliAbbr"))
	if cliAbbr == "" {
		cliAbbr = string(ctx.Query("cli_abbr"))
	}
	return cliAbbr
}

// ListStaffRoles handles GET /api/business/staff-roles?cliAbbr=
func (h *Controller) ListStaffRoles(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	stats, assignments, err := h.delegate.ListStaffRoles(c, queryCliAbbr(ctx))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, StaffRolesResponse{
			Success:     false,
			Message:     err.Error(),
			Data:        []StaffRoleStat{},
			Assignments: []StaffRoleAssignment{},
		})
		return
	}
	if stats == nil {
		stats = []StaffRoleStat{}
	}
	if assignments == nil {
		assignments = []StaffRoleAssignment{}
	}
	ctx.JSON(http.StatusOK, StaffRolesResponse{
		Success:     true,
		Data:        stats,
		Assignments: assignments,
	})
}

// AddStaffRole handles POST /api/business/staff-role
func (h *Controller) AddStaffRole(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	var req AddStaffRoleRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, AddStaffRoleResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}
	role, err := h.delegate.AddStaffRole(c, req.CliAbbr, req.Role)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, AddStaffRoleResponse{Success: false, Message: err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, AddStaffRoleResponse{
		Success: true,
		Message: "role added",
		CliAbbr: strings.TrimSpace(req.CliAbbr),
		Role:    role,
	})
}

// DeleteStaffRole handles DELETE /api/business/staff-role?cliAbbr=&role=
func (h *Controller) DeleteStaffRole(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	role := string(ctx.Query("role"))
	cleared, err := h.delegate.DeleteStaffRole(c, queryCliAbbr(ctx), role)
	if err != nil {
		code := http.StatusBadRequest
		if err.Error() == "role not found" {
			code = http.StatusNotFound
		}
		ctx.JSON(code, DeleteStaffRoleResponse{Success: false, Message: err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, DeleteStaffRoleResponse{
		Success:          true,
		Message:          "role deleted",
		CliAbbr:          queryCliAbbr(ctx),
		Role:             strings.TrimSpace(role),
		ClearedFromUsers: cleared,
	})
}

// UpdateUserStaffRole handles PUT /api/business/user-staff-role
func (h *Controller) UpdateUserStaffRole(c context.Context, ctx *app.RequestContext) {
	setCORS(ctx)
	var req UpdateUserStaffRoleRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, UpdateUserStaffRoleResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}
	role, err := h.delegate.UpdateUserStaffRole(c, req.CliAbbr, req.UserID, req.Role)
	if err != nil {
		code := http.StatusBadRequest
		if err.Error() == "role not found" {
			code = http.StatusNotFound
		}
		ctx.JSON(code, UpdateUserStaffRoleResponse{Success: false, Message: err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, UpdateUserStaffRoleResponse{
		Success: true,
		Message: "role updated",
		UserID:  strings.TrimSpace(req.UserID),
		Role:    role,
	})
}
