package marketplace

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
)

// Security represents a financial security/stock
type Security struct {
	ID            string    `json:"id"`
	Symbol        string    `json:"symbol"`
	Name          string    `json:"name"`
	Price         float64   `json:"price"`
	Change        float64   `json:"change"`
	ChangePercent float64   `json:"changePercent"`
	Volume        int64     `json:"volume"`
	MarketCap     int64     `json:"marketCap"`
	Sector        string    `json:"sector"`
	IsFavorite    bool      `json:"isFavorite"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// SecurityRequest represents the request payload for creating/updating securities
type SecurityRequest struct {
	Symbol        string  `json:"symbol" validate:"required"`
	Name          string  `json:"name" validate:"required"`
	Price         float64 `json:"price" validate:"required,min=0"`
	Change        float64 `json:"change"`
	ChangePercent float64 `json:"changePercent"`
	Volume        int64   `json:"volume" validate:"min=0"`
	MarketCap     int64   `json:"marketCap" validate:"min=0"`
	Sector        string  `json:"sector" validate:"required"`
}

// SecurityResponse represents the API response for securities
type SecurityResponse struct {
	Success bool      `json:"success"`
	Message string    `json:"message,omitempty"`
	Data    *Security `json:"data,omitempty"`
}

// SecuritiesListResponse represents the API response for securities list
type SecuritiesListResponse struct {
	Success bool       `json:"success"`
	Message string     `json:"message,omitempty"`
	Data    []Security `json:"data"`
	Total   int        `json:"total"`
	Page    int        `json:"page"`
	Limit   int        `json:"limit"`
}

// FavoriteRequest represents the request to toggle favorite status
type FavoriteRequest struct {
	SecurityID string `json:"securityId" validate:"required"`
	IsFavorite bool   `json:"isFavorite"`
}

// SearchRequest represents the search parameters
type SearchRequest struct {
	Symbol     string  `json:"symbol,omitempty"`
	Name       string  `json:"name,omitempty"`
	MinPrice   float64 `json:"minPrice,omitempty"`
	MaxPrice   float64 `json:"maxPrice,omitempty"`
	Sector     string  `json:"sector,omitempty"`
	IsFavorite *bool   `json:"isFavorite,omitempty"`
	Page       int     `json:"page,omitempty"`
	Limit      int     `json:"limit,omitempty"`
}

// Delegate handles marketplace business logic
type Delegate struct {
	securities map[string]Security
}

// NewDelegate creates a new marketplace delegate
func NewDelegate() *Delegate {
	delegate := &Delegate{
		securities: make(map[string]Security),
	}

	// Initialize with mock data
	delegate.initializeMockData()

	return delegate
}

// initializeMockData populates the delegate with initial mock data
func (d *Delegate) initializeMockData() {
	mockSecurities := []Security{
		{
			ID:            "1",
			Symbol:        "AAPL",
			Name:          "Apple Inc.",
			Price:         175.43,
			Change:        2.15,
			ChangePercent: 1.24,
			Volume:        45678900,
			MarketCap:     2750000000000,
			Sector:        "Technology",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "2",
			Symbol:        "MSFT",
			Name:          "Microsoft Corporation",
			Price:         378.85,
			Change:        -1.25,
			ChangePercent: -0.33,
			Volume:        23456700,
			MarketCap:     2810000000000,
			Sector:        "Technology",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "3",
			Symbol:        "GOOGL",
			Name:          "Alphabet Inc.",
			Price:         142.56,
			Change:        3.42,
			ChangePercent: 2.46,
			Volume:        18923400,
			MarketCap:     1780000000000,
			Sector:        "Technology",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "4",
			Symbol:        "TSLA",
			Name:          "Tesla, Inc.",
			Price:         248.12,
			Change:        -5.67,
			ChangePercent: -2.23,
			Volume:        67890100,
			MarketCap:     789000000000,
			Sector:        "Automotive",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "5",
			Symbol:        "AMZN",
			Name:          "Amazon.com, Inc.",
			Price:         155.78,
			Change:        1.89,
			ChangePercent: 1.23,
			Volume:        34567800,
			MarketCap:     1620000000000,
			Sector:        "Consumer Discretionary",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "6",
			Symbol:        "NVDA",
			Name:          "NVIDIA Corporation",
			Price:         875.34,
			Change:        12.45,
			ChangePercent: 1.44,
			Volume:        45678900,
			MarketCap:     2150000000000,
			Sector:        "Technology",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "7",
			Symbol:        "META",
			Name:          "Meta Platforms, Inc.",
			Price:         485.67,
			Change:        -2.34,
			ChangePercent: -0.48,
			Volume:        23456700,
			MarketCap:     1230000000000,
			Sector:        "Technology",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
		{
			ID:            "8",
			Symbol:        "JPM",
			Name:          "JPMorgan Chase & Co.",
			Price:         198.45,
			Change:        0.78,
			ChangePercent: 0.39,
			Volume:        12345600,
			MarketCap:     580000000000,
			Sector:        "Financial Services",
			IsFavorite:    true,
			CreatedAt:     time.Now(),
			UpdatedAt:     time.Now(),
		},
	}

	for _, security := range mockSecurities {
		d.securities[security.ID] = security
	}
}

// GetAllSecurities returns all securities with optional filtering and pagination
func (d *Delegate) GetAllSecurities(req SearchRequest) ([]Security, int, error) {
	var securities []Security

	session := essentials.NewSession(context.Background())
	session.Find(&securities)

	// Convert map to slice
	for _, security := range d.securities {
		securities = append(securities, security)
	}

	// Apply filters
	filtered := d.filterSecurities(securities, req)

	// Sort by symbol
	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].Symbol < filtered[j].Symbol
	})

	total := len(filtered)

	// Apply pagination
	if req.Page > 0 && req.Limit > 0 {
		start := (req.Page - 1) * req.Limit
		end := start + req.Limit

		if start >= len(filtered) {
			return []Security{}, total, nil
		}

		if end > len(filtered) {
			end = len(filtered)
		}

		filtered = filtered[start:end]
	}

	return filtered, total, nil
}

// GetSecurityByID returns a security by its ID
func (d *Delegate) GetSecurityByID(id string) (*Security, error) {
	security, exists := d.securities[id]
	if !exists {
		return nil, fmt.Errorf("security with ID %s not found", id)
	}
	return &security, nil
}

// CreateSecurity creates a new security
func (d *Delegate) CreateSecurity(req SecurityRequest) (*Security, error) {
	// Generate new ID (simple increment for demo)
	newID := fmt.Sprintf("%d", len(d.securities)+1)

	security := Security{
		ID:            newID,
		Symbol:        req.Symbol,
		Name:          req.Name,
		Price:         req.Price,
		Change:        req.Change,
		ChangePercent: req.ChangePercent,
		Volume:        req.Volume,
		MarketCap:     req.MarketCap,
		Sector:        req.Sector,
		IsFavorite:    false,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	d.securities[newID] = security
	return &security, nil
}

// UpdateSecurity updates an existing security
func (d *Delegate) UpdateSecurity(id string, req SecurityRequest) (*Security, error) {
	security, exists := d.securities[id]
	if !exists {
		return nil, fmt.Errorf("security with ID %s not found", id)
	}

	// Update fields
	security.Symbol = req.Symbol
	security.Name = req.Name
	security.Price = req.Price
	security.Change = req.Change
	security.ChangePercent = req.ChangePercent
	security.Volume = req.Volume
	security.MarketCap = req.MarketCap
	security.Sector = req.Sector
	security.UpdatedAt = time.Now()

	d.securities[id] = security
	return &security, nil
}

// DeleteSecurity deletes a security
func (d *Delegate) DeleteSecurity(id string) error {
	_, exists := d.securities[id]
	if !exists {
		return fmt.Errorf("security with ID %s not found", id)
	}

	delete(d.securities, id)
	return nil
}

// ToggleFavorite toggles the favorite status of a security
func (d *Delegate) ToggleFavorite(id string, isFavorite bool) (*Security, error) {
	security, exists := d.securities[id]
	if !exists {
		return nil, fmt.Errorf("security with ID %s not found", id)
	}

	security.IsFavorite = isFavorite
	security.UpdatedAt = time.Now()

	d.securities[id] = security
	return &security, nil
}

// GetFavorites returns all favorite securities
func (d *Delegate) GetFavorites(req SearchRequest) ([]Security, int, error) {
	req.IsFavorite = &[]bool{true}[0] // Set to true
	return d.GetAllSecurities(req)
}

// filterSecurities applies filters to the securities list
func (d *Delegate) filterSecurities(securities []Security, req SearchRequest) []Security {
	var filtered []Security

	for _, security := range securities {
		// Symbol filter
		if req.Symbol != "" && !strings.Contains(strings.ToLower(security.Symbol), strings.ToLower(req.Symbol)) {
			continue
		}

		// Name filter
		if req.Name != "" && !strings.Contains(strings.ToLower(security.Name), strings.ToLower(req.Name)) {
			continue
		}

		// Price range filter
		if req.MinPrice > 0 && security.Price < req.MinPrice {
			continue
		}
		if req.MaxPrice > 0 && security.Price > req.MaxPrice {
			continue
		}

		// Sector filter
		if req.Sector != "" && !strings.Contains(strings.ToLower(security.Sector), strings.ToLower(req.Sector)) {
			continue
		}

		// Favorite filter
		if req.IsFavorite != nil && security.IsFavorite != *req.IsFavorite {
			continue
		}

		filtered = append(filtered, security)
	}

	return filtered
}
