import { PgPubsub } from '../src'
import test from 'ava'
import createSubscriber from 'pg-listen'

const payload = {
  greeting: 'Hello',
}

const pgListenSubscriber = createSubscriber({
  connectionString: 'postgres://postgres:postgres@127.0.0.1:17346/postgres',
})
const pubsub = new PgPubsub(pgListenSubscriber)

test.before(async () => {
  await pgListenSubscriber.connect()
})

test.serial('PgPubsub', async (t) => {
  t.plan(1)
  await pubsub.subscribe('my-topic', (message: typeof payload) => {
    t.is(message.greeting, 'Hello')
  })
  await pubsub.publish('my-topic', payload)
})

test.serial('PgPubsub - same topic, multiple subscribers', async (t) => {
  t.plan(1)
  const sid = await pubsub.subscribe('my-topic', (message: typeof payload) => {
    // do nothing
  })
  await pubsub.subscribe('my-topic', (message: typeof payload) => {
    t.is(message.greeting, 'Hello')
  })
  await pubsub.unsubscribe(sid)
  await pubsub.publish('my-topic', payload)
})
