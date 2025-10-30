package main

import (
	"fmt"
	"log"

	"github.com/cloudwego/hertz/pkg/app/server"
	_ "github.com/go-sql-driver/mysql"
	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/heron-sense/trading-formula.git/src/pages/dashboard"
	"github.com/heron-sense/trading-formula.git/src/pages/marketplace"
	hertztracing "github.com/hertz-contrib/obs-opentelemetry/tracing"
)

func main() {
	cfg, err := essentials.ConfigInitialize("src/config/backend.toml")
	if err != nil {
		log.Fatalf("Parse config: %v", err)
	}

	essentials.Init()

	err = essentials.NewDatabase(&cfg.DatabaseCredentials)
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}

	tracer, tcfg := hertztracing.NewServerTracer()
	h := server.Default(tracer,
		server.WithHostPorts(fmt.Sprintf(":%d", 3344)),
	)
	h.Use(hertztracing.ServerMiddleware(tcfg))

	// Initialize marketplace handler
	mpGroup := h.Group("")
	marketplace.Register(mpGroup)

	h.Run()

	fmt.Printf("Starting server at port %d\n", dashboard.ARCH)
}
