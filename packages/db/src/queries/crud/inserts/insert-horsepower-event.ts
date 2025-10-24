import {
  horsepowerEvents as horsepowerEventsTable,
  type NewHorsepowerEvent
} from '../../../schema/horsepower/horsepower-events.js';
import type {
  ServerlessDbTransaction,
  HttpDb,
  ServerlessDb
} from '../../../client.js';

export function insertHorsepowerEvents(
  db: ServerlessDbTransaction | HttpDb | ServerlessDb,
  horsepowerEvents: NewHorsepowerEvent[]
) {
  return db.insert(horsepowerEventsTable).values(horsepowerEvents);
}
