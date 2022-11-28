import {filter} from 'rxjs'
import {clientFromStoredCredentials} from './client'
import {Page, Roam, Block} from 'roam-api-wrappers/dist/data'
import {RoamDate} from 'roam-api-wrappers/dist/date'

export const watchMessages = (roomId: string, sinceEventId?: string) =>
    watchEvents(roomId, sinceEventId).pipe(filter(it => it.type === 'm.room.message'))

export const watchEvents = (roomId: string, sinceEventId?: string) =>
    clientFromStoredCredentials().room(roomId, sinceEventId).watchEventValues()

async function todaysLogBlock(): Promise<Block> {
    const todayName = RoamDate.toRoam(new Date())
    const today = Page.fromName(todayName)
    console.log({todayName, today, ttext: today?.text, tchild: today?.children[0]?.text})
    const blockText = '[[matrix-messages]]'
    const existing = today.childWithValue(blockText)
    console.log({existing})
    if (existing) return existing
    await today.appendChild(blockText)

    return today.childWithValue(blockText)
}

export const startEventWatcher = (): () => void => {
    const messages = watchMessages('!xwGMGAlaCQHDOKHxGB:matrix.org', '$wohzYPpZITW1p4lvEpzjOeIf-B4om4T0o0__c-pPFOY')
    const subscription = messages.subscribe(async it => {
        if (it.content.body.includes(']]')) {
            console.log('will save', it)
            const block = await todaysLogBlock()
            block.appendChild(it.content.body)
        }
    })

    return () => subscription.unsubscribe()
}
