package marketplace

import (
	"context"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/heron-sense/trading-formula.git/src/models"
	"github.com/rotisserie/eris"
)

func (ctl *Controller) BubbleSnapshot(c context.Context, ctx *app.RequestContext) {
	rsp := struct {
		Success bool                           `json:"success"`
		Message string                         `json:"message,omitempty"`
		Data    []*models.MarketBubbleSnapshot `json:"data,omitempty"`
	}{}

	id := ctx.Param("secRefID")
	if id == "" {
		rsp.Message = "Security ID is required"
		ctx.JSON(http.StatusBadRequest, rsp)
		return
	}

	ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")                                                                                   // 允许任何域名
	ctx.Response.Header.Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")                                                    // 允许的方法
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization") // 允许的头部

	bubbleSnapshotList, err := ctl.delegate.ListBubbleSnapshot(c, id)
	if err != nil {
		rsp.Message = err.Error()
		ctx.JSON(http.StatusInternalServerError, rsp)
		return
	}

	rsp.Success = true
	rsp.Data = bubbleSnapshotList
	ctx.JSON(http.StatusOK, rsp)
}

func (d *Delegate) ListBubbleSnapshot(ctx context.Context, secRefID string) ([]*models.MarketBubbleSnapshot, error) {
	session := essentials.NewSession(ctx)
	list := make([]*models.MarketBubbleSnapshot, 0)
	err := session.
		//Where("symbol=?", secRefID).
		Find(&list)
	if err != nil {
		return nil, eris.Wrap(err, "failed to find bubble snapshot")
	}
	return list, nil
}
