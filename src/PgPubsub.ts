import type { PubSubEngine } from 'graphql-subscriptions'
import type { Subscriber } from 'pg-listen'

import { PubSubAsyncIterator } from './pubsub-async-iterator'

export class PgPubsub implements PubSubEngine {
  private subscriber: Subscriber
  private sidMap = new Map<number, string>()
  private currentSubscriptionId = 0

  constructor(subscriber: Subscriber) {
    this.subscriber = subscriber
  }

  async publish(subject: string, payload: any) {
    await this.subscriber.notify(subject, payload)
  }

  async subscribe(subject: string, onMessage: (payload: object) => void) {
    await this.subscriber.listenTo(subject)
    await this.subscriber.notifications.on(subject, onMessage)
    const sid = this.currentSubscriptionId++
    this.sidMap.set(sid, subject)
    return sid
  }

  async unsubscribe(sid: number) {
    const topic = this.sidMap.get(sid)!
    this.sidMap.delete(sid)
    await this.subscriber.unlisten(topic)
  }

  asyncIterator<T>(subjects: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, subjects)
  }
}
