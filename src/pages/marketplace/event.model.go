package marketplace

import (
	"github.com/quagmt/udecimal"
)

type EventModel struct {
	EventID   string `json:"event_id"`
	Tags      string `json:"tags"`
	Event     string `json:"event"`
	Notes     string `json:"notes"`
	Impact    string `json:"impact"`
	BeginTime int64  `json:"begin_time"`
	EndTime   int64  `json:"end_time"`
}

/**


create table trading_formula.event(
event_id varchar(80) primary key,
tags varchar(80) not null default '',
event varchar(240) not null default '',
notes varchar(800) not null default '',
impact varchar(800) not null default '',
begin_time bigint not null default 0,
end_time bigint not null default 0,
fulltext(tags, event, notes, impact) with parser ngram
);

*/

type EventImpactModel struct {
	RecordID  string           `xorm:"record_id"`
	EventID   string           `xorm:"event_id"`
	Symbol    string           `xorm:"symbol"`
	Relevance udecimal.Decimal `xorm:"-"`
}
