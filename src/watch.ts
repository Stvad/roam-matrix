import {filter} from 'rxjs'
import {clientFromStoredCredentials, loadCredentials} from './client'
import {AggregatedEvent, EventsSince} from 'matrix-rx'
import {Block, Page} from 'roam-api-wrappers/dist/data'
import {RoamDate} from 'roam-api-wrappers/dist/date'
import {tap} from 'rxjs/operators'
import {ObjectStorage, RoamStorage} from './storage'
import {memoize} from './async'
import {configPageName} from './config'
import {createBlockFromEvent} from './event-block'

export const watchMessages = (roomId: string, since?: EventsSince) =>
    watchEvents(roomId, since).pipe(filter(it => it.type === 'm.room.message'))

export const watchEvents = (roomId: string, since?: EventsSince) =>
    clientFromStoredCredentials().room(roomId, since).watchEventValues()

class MessageWatcher {
    storageKey = `matrix.room.${this.roomId}.lastEvent`

    constructor(private roomId: string, private store: ObjectStorage = new ObjectStorage(new RoamStorage(configPageName))) {
    }

    private getLastEvent() {
        return this.store.get<AggregatedEvent>(this.storageKey)
    }

    private setLastEvent(value: AggregatedEvent | undefined) {
        return this.store.set(this.storageKey, value)
    }

    async watch() {
        const updateLastEvent = tap(async (it: AggregatedEvent) => {
            const lastEvent = await this.getLastEvent()
            if (it.origin_server_ts > (lastEvent?.origin_server_ts ?? 0)) {
                this.setLastEvent(it)
            }
        })

        const lastEvent = await this.getLastEvent()
        // I wonder if this can end up problematic (are events guaranteed to be always in order?)
        console.log('watching starting from', lastEvent?.event_id)
        return watchMessages(this.roomId, lastEvent?.event_id ? {
            eventId: lastEvent?.event_id,
            timestamp: lastEvent?.origin_server_ts,
        } : undefined)
            .pipe(updateLastEvent)
    }
}

async function todaysLogBlock(): Promise<Block> {
    const todayName = RoamDate.toRoam(new Date())
    const today = Page.fromName(todayName)!

    const blockText = '[[matrix-messages]]'
    const existing = today.childWithValue(blockText)
    if (existing) return existing

    return today.appendChild(blockText)
}

export const startEventWatcher = async (roomId: string): Promise<() => void> => {
    const messages = await new MessageWatcher(roomId).watch()
    /**
     * This rn handles only the "create block when there are many initial messages" case.
     * May be an overcomplicated way of solving it 🤔
     */
    const getBlock = memoize(todaysLogBlock, 1000 * 5)

    const subscription = messages.subscribe(async (it: AggregatedEvent) => {
        const block = await getBlock()
        block.appendChild(createBlockFromEvent(it, roomId, loadCredentials()?.homeServer!))
    })

    return () => subscription.unsubscribe()
}
