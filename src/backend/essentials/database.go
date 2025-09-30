package essentials

import (
	"context"
	"fmt"

	"github.com/rotisserie/eris"
	"xorm.io/xorm"
)

var (
	engine *xorm.Engine
)

type DatabaseCredentials struct {
	Endpoint string `toml:"endpoint"`
	Database string `toml:"database"`
	Username string `toml:"username"`
	Password string `toml:"password"`
}

func NewDatabase(dc *DatabaseCredentials) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?charset=utf8mb4&parseTime=True",
		dc.Username, dc.Password,
		dc.Endpoint,
		dc.Database)

	var err error
	engine, err = xorm.NewEngine("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return eris.Wrap(err, "new database engine error")
	}

	return nil
}

func NewSession(ctx context.Context) *xorm.Session {
	return engine.NewSession().Context(ctx)
}
