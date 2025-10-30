package essentials

import (
	"github.com/arangodb/go-driver/v2/arangodb"
	"github.com/arangodb/go-driver/v2/connection"
	"github.com/rotisserie/eris"
)

var (
	conn connection.Connection
)

func Init() error {
	endpoint := connection.NewRoundRobinEndpoints([]string{"https://adb.heron-sense.com:8529"})
	conn = connection.NewHttp2Connection(connection.DefaultHTTP2ConfigurationWrapper(endpoint, true))

	auth := connection.NewBasicAuth("root", "")
	err := conn.SetAuthentication(auth)
	if err != nil {
		return eris.Wrap(err, "setting authentication")
	}

	// Create ASYNC wrapper for the connection
	conn = connection.NewConnectionAsyncWrapper(conn)
	return nil
}

func NewClient() arangodb.Client {
	// Create a client
	return arangodb.NewClient(conn)
}
