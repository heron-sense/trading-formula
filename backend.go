package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/heron-sense/trading-formula/src/crucial"
	_ "github.com/go-sql-driver/mysql"

	"github.com/cloudwego/hertz/pkg/app/server"
	hertztracing "github.com/hertz-contrib/obs-opentelemetry/tracing"
	"go.uber.org/zap"
)

type App struct {
	server    *server.Hertz
	initFuncs []func() error
	exitFuncs []func() error
}

func NewApp() *App {
	tracer, tcfg := hertztracing.NewServerTracer()
	h := server.Default(tracer,
		server.WithHostPorts(fmt.Sprintf("localhost:8080")),
	)
	h.Use(hertztracing.ServerMiddleware(tcfg))
	return &App{
		server: h,
	}
}

func (a *App) Run() error {
	if err := a.executeFuns(a.initFuncs...); err != nil {
		panic(fmt.Sprintf("failed to initialize application: %v", err))
	}
	return a.server.Run()
}

func (a *App) GracefulShutdown(timeout time.Duration) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	a.executeFuns(a.exitFuncs...)

	if err := a.server.Shutdown(ctx); err != nil {
		crucial.Error(context.Background(), "Server forced to shutdown", zap.Error(err))
	}
}

func (a *App) RegisterInit(initFuncs ...func() error) {
	a.initFuncs = append(a.initFuncs, initFuncs...)
}

func (a *App) RegisterExit(exitFuncs ...func() error) {
	a.exitFuncs = append(a.exitFuncs, exitFuncs...)
}

func (a *App) executeFuns(funs ...func() error) error {
	for _, fun := range funs {
		if err := fun(); err != nil {
			return err
		}
	}
	return nil
}

func main() {
	app := NewApp()

	app.RegisterInit(func() error {
		return nil
	})

	// 启动服务器
	go startServer(app)

	// 优雅关闭
	gracefulShutdown(app)
}

func InitConfig() *crucial.Config {

	return &crucial.Config{}
}

func startServer(app *App) {
	if err := app.Run(); err != nil {
		panic(fmt.Sprintf("Failed to start server: %v", err))
	}
}

func gracefulShutdown(app *App) {
	// 创建一个通道来接收操作系统的信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// 阻塞，直到接收到退出信号
	<-quit
	crucial.Info(context.Background(), "Shutting down server...")

	// 设置关闭超时时间
	const shutdownTimeout = 3 * time.Second

	// 调用 GracefulShutdown
	app.GracefulShutdown(shutdownTimeout)

	crucial.Info(context.Background(), "Server exiting")
}
