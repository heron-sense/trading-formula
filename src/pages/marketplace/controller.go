package marketplace

import (
	"context"
	"net/http"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
)

// Controller handles HTTP requests for marketplace operations
type Controller struct {
	delegate *Delegate
}

func NewController() *Controller {
	return &Controller{
		delegate: NewDelegate(),
	}
}

// GetSecurities handles GET /api/marketplace/securities
func (h *Controller) GetSecurities(c context.Context, ctx *app.RequestContext) {
	// Parse query parameters
	req := SearchRequest{
		Page:  1,
		Limit: 10,
	}

	if symbol := ctx.Query("symbol"); symbol != "" {
		req.Symbol = string(symbol)
	}
	if name := ctx.Query("name"); name != "" {
		req.Name = string(name)
	}
	if minPrice := ctx.Query("minPrice"); minPrice != "" {
		if price, err := strconv.ParseFloat(string(minPrice), 64); err == nil {
			req.MinPrice = price
		}
	}
	if maxPrice := ctx.Query("maxPrice"); maxPrice != "" {
		if price, err := strconv.ParseFloat(string(maxPrice), 64); err == nil {
			req.MaxPrice = price
		}
	}
	if sector := ctx.Query("sector"); sector != "" {
		req.Sector = string(sector)
	}
	if isFavorite := ctx.Query("isFavorite"); isFavorite != "" {
		if favorite, err := strconv.ParseBool(string(isFavorite)); err == nil {
			req.IsFavorite = &favorite
		}
	}
	if page := ctx.Query("page"); page != "" {
		if p, err := strconv.Atoi(string(page)); err == nil && p > 0 {
			req.Page = p
		}
	}
	if limit := ctx.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(string(limit)); err == nil && l > 0 {
			req.Limit = l
		}
	}

	securities, total, err := h.delegate.GetAllSecurities(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, SecurityResponse{
			Success: false,
			Message: "Failed to get securities: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SecuritiesListResponse{
		Success: true,
		Data:    securities,
		Total:   total,
		Page:    req.Page,
		Limit:   req.Limit,
	})
}

// GetSecurity handles GET /api/marketplace/securities/:id
func (h *Controller) GetSecurity(c context.Context, ctx *app.RequestContext) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Security ID is required",
		})
		return
	}

	security, err := h.delegate.GetSecurityByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, SecurityResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SecurityResponse{
		Success: true,
		Data:    security,
	})
}

// CreateSecurity handles POST /api/marketplace/securities
func (h *Controller) CreateSecurity(c context.Context, ctx *app.RequestContext) {
	var req SecurityRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	// Basic validation
	if req.Symbol == "" || req.Name == "" || req.Sector == "" {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Symbol, name, and sector are required",
		})
		return
	}

	security, err := h.delegate.CreateSecurity(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, SecurityResponse{
			Success: false,
			Message: "Failed to create security: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, SecurityResponse{
		Success: true,
		Message: "Security created successfully",
		Data:    security,
	})
}

// UpdateSecurity handles PUT /api/marketplace/securities/:id
func (h *Controller) UpdateSecurity(c context.Context, ctx *app.RequestContext) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Security ID is required",
		})
		return
	}

	var req SecurityRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	security, err := h.delegate.UpdateSecurity(id, req)
	if err != nil {
		ctx.JSON(http.StatusNotFound, SecurityResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SecurityResponse{
		Success: true,
		Message: "Security updated successfully",
		Data:    security,
	})
}

// DeleteSecurity handles DELETE /api/marketplace/securities/:id
func (h *Controller) DeleteSecurity(c context.Context, ctx *app.RequestContext) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Security ID is required",
		})
		return
	}

	err := h.delegate.DeleteSecurity(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, SecurityResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SecurityResponse{
		Success: true,
		Message: "Security deleted successfully",
	})
}

// ToggleFavorite handles POST /api/marketplace/securities/:id/favorite
func (h *Controller) ToggleFavorite(c context.Context, ctx *app.RequestContext) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Security ID is required",
		})
		return
	}

	var req FavoriteRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	security, err := h.delegate.ToggleFavorite(id, req.IsFavorite)
	if err != nil {
		ctx.JSON(http.StatusNotFound, SecurityResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SecurityResponse{
		Success: true,
		Message: "Favorite status updated successfully",
		Data:    security,
	})
}

// GetFavorites handles GET /api/marketplace/favorites
func (h *Controller) GetFavorites(c context.Context, ctx *app.RequestContext) {
	// Parse query parameters
	req := SearchRequest{
		Page:  1,
		Limit: 10,
	}

	if symbol := ctx.Query("symbol"); symbol != "" {
		req.Symbol = string(symbol)
	}
	if name := ctx.Query("name"); name != "" {
		req.Name = string(name)
	}
	if minPrice := ctx.Query("minPrice"); minPrice != "" {
		if price, err := strconv.ParseFloat(string(minPrice), 64); err == nil {
			req.MinPrice = price
		}
	}
	if maxPrice := ctx.Query("maxPrice"); maxPrice != "" {
		if price, err := strconv.ParseFloat(string(maxPrice), 64); err == nil {
			req.MaxPrice = price
		}
	}
	if sector := ctx.Query("sector"); sector != "" {
		req.Sector = string(sector)
	}
	if page := ctx.Query("page"); page != "" {
		if p, err := strconv.Atoi(string(page)); err == nil && p > 0 {
			req.Page = p
		}
	}
	if limit := ctx.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(string(limit)); err == nil && l > 0 {
			req.Limit = l
		}
	}

	securities, total, err := h.delegate.GetFavorites(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, SecurityResponse{
			Success: false,
			Message: "Failed to get favorites: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SecuritiesListResponse{
		Success: true,
		Data:    securities,
		Total:   total,
		Page:    req.Page,
		Limit:   req.Limit,
	})
}

// SearchSecurities handles POST /api/marketplace/search
func (h *Controller) SearchSecurities(c context.Context, ctx *app.RequestContext) {
	var req SearchRequest
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, SecurityResponse{
			Success: false,
			Message: "Invalid request body: " + err.Error(),
		})
		return
	}

	// Set default pagination
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}

	securities, total, err := h.delegate.GetAllSecurities(req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, SecurityResponse{
			Success: false,
			Message: "Failed to search securities: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SecuritiesListResponse{
		Success: true,
		Data:    securities,
		Total:   total,
		Page:    req.Page,
		Limit:   req.Limit,
	})
}
