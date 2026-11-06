package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	hjson "github.com/cloudwego/hertz/pkg/common/json"
	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/heron-sense/trading-formula.git/src/pages/business"
)

func main() {
	cfg, err := essentials.ConfigInitialize("src/config/backend.toml")
	if err != nil {
		log.Fatal(err)
	}
	if err := essentials.NewDatabase(&cfg.DatabaseCredentials); err != nil {
		log.Fatal(err)
	}
	session := essentials.NewSession(context.Background())
	defer session.Close()
	var rows []business.Customer
	if err := session.Where("name = ?", "充敏军").Find(&rows); err != nil {
		log.Fatal(err)
	}
	raw, err := json.Marshal(rows)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("std", string(raw))
	hraw, err := hjson.Marshal(rows)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("hertz", string(hraw))
}
