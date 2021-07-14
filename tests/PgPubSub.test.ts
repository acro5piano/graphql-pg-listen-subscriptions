import { PgPubsub } from '../src'
import test from 'ava'

const payload = {
  greeting: 'Hello',
}

const pubsub = new PgPubsub(
  'postgres://postgres:postgres@127.0.0.1:17346/postgres',
)

test.before(async () => {
  await pubsub.connect()
})

test.serial('PgPubsub', async (t) => {
  t.plan(1)
  const sid = await pubsub.subscribe('my-topic', (message: typeof payload) => {
    t.is(message.greeting, 'Hello')
  })
  await pubsub.publish('my-topic', payload)
  await pubsub.unsubscribe(sid)
})

test.serial('PgPubsub - same topic, multiple subscribers', async (t) => {
  t.plan(1)
  const sid1 = await pubsub.subscribe('my-topic', () => {
    // do nothing
  })
  const sid2 = await pubsub.subscribe('my-topic', (message: typeof payload) => {
    t.is(message.greeting, 'Hello')
  })
  await pubsub.unsubscribe(sid1)
  await pubsub.publish('my-topic', payload)
  await pubsub.unsubscribe(sid2)
  await pubsub.publish('my-topic', payload)
})
