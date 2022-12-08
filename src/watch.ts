import {filter} from 'rxjs'
import {clientFromStoredCredentials} from './client'
import {AggregatedEvent, EventsSince} from 'matrix-rx'
import {Page, Block} from 'roam-api-wrappers/dist/data'
import {RoamDate} from 'roam-api-wrappers/dist/date'
import {tap} from 'rxjs/operators'
import {Store} from './storage'
import {memoize} from './async'

export const watchMessages = (roomId: string, since?: EventsSince) =>
    watchEvents(roomId, since).pipe(filter(it => it.type === 'm.room.message'))

export const watchEvents = (roomId: string, since?: EventsSince) =>
    clientFromStoredCredentials().room(roomId, since).watchEventValues()

class MessageWatcher {
    storageKey = `matrix.room.${this.roomId}.lastEvent`

    constructor(private roomId: string, private store: Store = new Store()) {
    }

    private get lastEvent(): AggregatedEvent | undefined {
        return this.store.get<AggregatedEvent>(this.storageKey)
    }

    private set lastEvent(value: AggregatedEvent | undefined) {
        this.store.set(this.storageKey, value)
    }

    watch() {
        // I wonder if this can end up problematic (are events guaranteed to be always in order?)
        console.log('watching starting from', this.lastEvent?.event_id)
        return watchMessages(this.roomId, this.lastEvent?.event_id ? {
            eventId: this.lastEvent?.event_id,
            timestamp: this.lastEvent?.origin_server_ts,
        } : undefined)
            .pipe(tap(it => {
                if (it.origin_server_ts > (this.lastEvent?.origin_server_ts ?? 0)) {
                    this.lastEvent = it
                }
            }))
    }
}

async function todaysLogBlock(): Promise<Block> {
    const todayName = RoamDate.toRoam(new Date())
    const today = Page.fromName(todayName)!

    const blockText = '[[matrix-messages]]'
    const existing = today.childWithValue(blockText)
    if (existing) return existing

    const newUid = await today.appendChild(blockText)

    return Block.fromUid(newUid)!
}

function unwrapLinks(text: string) {
    const graphId = window.roamAlphaAPI.graph.name

    const regex = new RegExp(`\\[(.*?)]\\(https:\\/\\/roamresearch\\.com\\/#\\/app\\/${graphId}\\/page\\/[a-zA-Z-_0-9]+?\\)`, 'g')
    return text.replaceAll(regex, '$1')
}

export const startEventWatcher = async (roomId: string): Promise<() => void> => {
    const messages = new MessageWatcher(roomId).watch()
    /**
     * This rn handles only the "create block when there are many initial messages" case.
     * May be an overcomplicated way of solving it 🤔
     */
    const getBlock = memoize(todaysLogBlock, 1000 * 5)

    const subscription = messages.subscribe(async (it: AggregatedEvent) => {
        const block = await getBlock()
        block.appendChild(unwrapLinks(it.content.body!))
    })

    return () => subscription.unsubscribe()
}
