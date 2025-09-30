package essentials

import (
	"github.com/BurntSushi/toml"
	"github.com/rotisserie/eris"
)

type Config struct {
	DatabaseCredentials `toml:"database_credentials"`
}

func ConfigInitialize(filePath string) (*Config, error) {
	config := &Config{}
	_, err := toml.DecodeFile(filePath, config)
	if err != nil {
		return nil, eris.Wrap(err, "decoding config file")
	}

	return config, nil
}
