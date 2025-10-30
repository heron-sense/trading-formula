package marketplace

import (
	"github.com/cloudwego/hertz/pkg/route"
)

func Register(group *route.RouterGroup) {
	marketplaceHandler := NewController()
	// Register marketplace routes
	group.GET("/api/marketplace/security/:secRefID/bubble_snapshot/list", marketplaceHandler.BubbleSnapshot)
	group.GET("/api/marketplace/securities", marketplaceHandler.GetSecurities)
	group.GET("/api/marketplace/securities/:id", marketplaceHandler.GetSecurity)
	group.POST("/api/marketplace/securities", marketplaceHandler.CreateSecurity)
	group.PUT("/api/marketplace/securities/:id", marketplaceHandler.UpdateSecurity)
	group.DELETE("/api/marketplace/securities/:id", marketplaceHandler.DeleteSecurity)
	group.POST("/api/marketplace/securities/:id/favorite", marketplaceHandler.ToggleFavorite)
	group.GET("/api/marketplace/favorites", marketplaceHandler.GetFavorites)
	group.POST("/api/marketplace/search", marketplaceHandler.SearchSecurities)
	group.GET("/api/marketplace/events", marketplaceHandler.GetEvents)
}
