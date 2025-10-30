package marketplace

import (
	"context"
	"fmt"

	"github.com/arangodb/go-driver/v2/arangodb"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/heron-sense/trading-formula.git/src/backend/essentials"
	"github.com/heron-sense/trading-formula.git/src/data"
	"github.com/rotisserie/eris"
)

type GetEventsParam struct {
}

func (ctl *Controller) GetEvents(c context.Context, rc *app.RequestContext) {
	bd := data.NewBody(rc)

	param := &GetEventsParam{}
	if err := rc.Bind(param); err != nil {
		bd.SetMessage("invalid request").Response()
		return
	}

	bubbleSnapshotList, err := ctl.delegate.listEvents(c, param)
	if err != nil {
		bd.SetMessage(err.Error()).Response()
		return
	}

	bd.EmbraceData(bubbleSnapshotList).Response()
	return
}

func (d *Delegate) listEvents(ctx context.Context, p *GetEventsParam) ([]*EventModel, error) {
	list := make([]*EventModel, 0)

	cli := essentials.NewClient()
	database, err := cli.GetDatabase(ctx, "_system", &arangodb.GetDatabaseOptions{})
	if err != nil {
		return list, eris.Wrap(err, "failed to get arangodb database")
	}

	query := "FOR d IN events LIMIT 10 RETURN d"
	cursor, err := database.Query(ctx, query, nil)
	if err != nil {
		return list, eris.Wrap(err, "failed to execute query")
	}

	defer cursor.Close()
	for cursor.HasMore() {
		em := new(EventModel)
		_, err = cursor.ReadDocument(ctx, em)
		if err != nil {
			fmt.Printf("failed to read document: %v", err)
			break
		}

		list = append(list, em)
	}

	return list, nil
}
