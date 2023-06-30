import {AggregatedEvent} from 'matrix-rx'

function getMessageText(it: AggregatedEvent, homeServerDomain: string) {
    if (it.content.msgtype === 'm.audio') {
        return getAudioText(it, homeServerDomain)
    } else if (it.content.msgtype === 'm.image') {
        return getImageText(it, homeServerDomain)
    } else {
        return unwrapLinks(it.content.body!)
    }
}

export function createBlockFromEvent(it: AggregatedEvent, roomId: string, homeServerDomain: string) {
    const text = getMessageText(it, homeServerDomain)

    const uid = uidFromEventId(it.event_id)
    return {
        uid,
        text,
        children: [
            {
                uid: 'a' + uid.slice(1),
                text: `author::[[${it.sender}]]`,
            },
            {
                uid: 't' + uid.slice(1),
                text: `timestamp::${new Date(it.origin_server_ts).toLocaleString()}`,
            },
            {
                uid: 'U' + uid.slice(1),
                text: `URL::https://matrix.to/#/${roomId}/${it.event_id}`,
            },
        ],
    }
}

/**
 * Starts with $ which we want to remove, and 9 is the length of the block uid in Roam
 */
const uidFromEventId = (eventId: string) => eventId.slice(1, 10)

function unwrapLinks(text: string) {
    const graphId = window.roamAlphaAPI.graph.name

    const regex = new RegExp(`\\[(.*?)]\\(https:\\/\\/roamresearch\\.com\\/#\\/app\\/${graphId}\\/page\\/[a-zA-Z-_0-9]+?\\)`, 'g')
    return text.replaceAll(regex, '$1')
}

const getAudioText = (it: AggregatedEvent, homeServerDomain: string) =>
    `{{[[audio]]: ${mxcToHttpUrl(it.content.url!, homeServerDomain)} }}`

const getImageText = (it: AggregatedEvent, homeServerDomain: string) =>
    `![${it.content.body}](${mxcToHttpUrl(it.content.url!, homeServerDomain)})`


/**
 *
 * @param mxcUrl: like mxc://matrix.org/uid
 */
function mxcToHttpUrl(mxcUrl: string, homeserverDomain: string) {
    const mxcPrefix = 'mxc://'
    if (!mxcUrl.startsWith(mxcPrefix)) {
        throw new Error('Invalid mxc URL')
    }

    const mxcUrlWithoutScheme = mxcUrl.slice(mxcPrefix.length)
    return `https://${homeserverDomain}/_matrix/media/v3/download/${mxcUrlWithoutScheme}`
}

