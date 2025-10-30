package data

import (
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"
)

func NewBody(rc *app.RequestContext) *Body {
	return &Body{
		rc: rc,
	}
}

type Body struct {
	rc     *app.RequestContext
	detail struct {
		Success bool   `json:"success"`
		Message string `json:"message,omitempty"`
		Data    any    `json:"data,omitempty"`
	}
}

func (bd *Body) Response() {
	bd.rc.Response.Header.Set("Access-Control-Allow-Origin", "*")                                                                                   // 允许任何域名
	bd.rc.Response.Header.Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")                                                    // 允许的方法
	bd.rc.Response.Header.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization") // 允许的头部
	bd.rc.JSON(http.StatusOK, bd.detail)
}

func (bd *Body) EmbraceData(data any) *Body {
	bd.detail.Data = data
	return bd
}

func (bd *Body) SetMessage(s string) *Body {
	bd.detail.Message = s
	return bd
}
