import type { PubSubEngine } from 'graphql-subscriptions'
import createSubscriber from 'pg-listen'
import type { Subscriber } from 'pg-listen'

import { PubSubAsyncIterator } from './pubsub-async-iterator'

export class PgPubsub implements PubSubEngine {
  private subscriber: Subscriber
  private sidMap = new Map<number, string>()
  private currentSubscriptionId = 0

  constructor(subscriberOrString: Subscriber | string) {
    if (typeof subscriberOrString === 'string') {
      this.subscriber = createSubscriber({
        connectionString: subscriberOrString,
      })
    } else {
      this.subscriber = subscriberOrString
    }
  }

  async connect() {
    this.subscriber.connect()
  }

  async close() {
    this.subscriber.close()
  }

  async publish(subject: string, payload: any) {
    await this.subscriber.notify(subject, payload)
  }

  async subscribe<T extends object>(
    subject: string,
    onMessage: (payload: T) => void,
  ) {
    await this.subscriber.listenTo(subject)
    await this.subscriber.notifications.on(subject, onMessage)
    this.currentSubscriptionId++
    const sid = this.currentSubscriptionId
    this.sidMap.set(sid, subject)
    return sid
  }

  async unsubscribe(sid: number) {
    const topic = this.sidMap.get(sid)!
    this.sidMap.delete(sid)
    let isTopicStillSubscribing = false
    this.sidMap.forEach((t) => {
      if (t === topic) {
        isTopicStillSubscribing = true
      }
    })
    if (!isTopicStillSubscribing) {
      await this.subscriber.unlisten(topic)
    }
  }

  asyncIterator<T>(subjects: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, subjects)
  }
}
