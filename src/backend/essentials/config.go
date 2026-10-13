package essentials

import (
	"github.com/BurntSushi/toml"
	"github.com/rotisserie/eris"
)

type Config struct {
	DatabaseCredentials `toml:"database_credentials"`
	Auth                AuthConfig `toml:"auth"`
}

type AuthConfig struct {
	ValidateURL string `toml:"validate_url"`
	Enabled     *bool  `toml:"enabled"` // nil => true
}

func (a AuthConfig) IsEnabled() bool {
	if a.Enabled == nil {
		return true
	}
	return *a.Enabled
}

func ConfigInitialize(filePath string) (*Config, error) {
	config := &Config{}
	_, err := toml.DecodeFile(filePath, config)
	if err != nil {
		return nil, eris.Wrap(err, "decoding config file")
	}

	return config, nil
}
