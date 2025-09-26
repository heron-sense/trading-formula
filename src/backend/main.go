package main

import (
	"fmt"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/heron-sense/trading-formula.git/src/pages/dashboard"

	hertztracing "github.com/hertz-contrib/obs-opentelemetry/tracing"
)

func main() {
	tracer, tcfg := hertztracing.NewServerTracer()
	h := server.Default(tracer,
		server.WithHostPorts(fmt.Sprintf(":%d", 3333)),
	)
	h.Use(hertztracing.ServerMiddleware(tcfg))

	fmt.Printf("Starting application...")

	h.Run()

	fmt.Printf("Starting server at port %d\n", dashboard.ARCH)
}
