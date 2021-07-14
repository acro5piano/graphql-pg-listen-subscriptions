# graphql-pg-listen-subscriptions

This package implements the PubSubEngine Interface from the [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) package.

# Why

I've tried [a package](https://github.com/GraphQLCollege/graphql-postgres-subscriptions) to implement pg pubsub and GraphQL subscriptions, but it no longer works.

# Install

```sh
yarn add graphql-pg-listen-subscriptions pg-listen
```

# Getting Started

```typescript
import { PgPubsub } from 'graphql-pg-listen-subscriptions'
import createSubscriber from 'pg-listen'

const pgListenSubscriber = createSubscriber({
  connectionString: 'postgres://user:pass@127.0.0.1/my-db',
})

pgListenSubscriber.connect()

export const pubsub = new PgPubsub(pgListenSubscriber)
```

Now, implement your Subscriptions type resolver, using the `pubsub.asyncIterator` to map the event you need:

```typescript
const SOMETHING_CHANGED_TOPIC = 'something_changed'

export const resolvers = {
  Subscription: {
    somethingChanged: {
      subscribe: () => pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC),
    },
  },
}
```
