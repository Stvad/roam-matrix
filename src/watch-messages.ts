import {loadCredentials} from './chat-popup'
import {filter} from 'rxjs'
import {Matrix, AggregatedEvent} from 'matrix-rx'

export const watchMatrixMessages = (roomId: string, sinceEventId?: string) => {
    /**
     * watch messages in all the rooms in the space
     * remember last processed one (by id) to recover from restarts
     * do processing on the messages (e.g. pulling in the references)
     */

    const credentials = loadCredentials()
    if (!credentials) return

    const matrix = Matrix.fromCredentials(credentials)

    const subscription = matrix.room(roomId, sinceEventId).watchEventValues()
        .pipe(filter(it => it.type === 'm.room.message'))
        .subscribe((it: AggregatedEvent) => {
            console.log(it.content.body)
            console.log(it)
        })

    return () => subscription.unsubscribe()
}
