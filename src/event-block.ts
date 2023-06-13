import {AggregatedEvent} from 'matrix-rx'

export function createBlockFromEvent(it: AggregatedEvent, roomId: string, homeServerDomain: string) {
    const text = (it.content.msgtype === 'm.audio') ?
        getAudioText(it, homeServerDomain) :
        unwrapLinks(it.content.body!)

    return {
        text,
        children: [
            {
                text: `author::[[${it.sender}]]`,
            },
            {
                text: `timestamp::${new Date(it.origin_server_ts).toLocaleString()}`,
            },
            {
                text: `URL::https://matrix.to/#/${roomId}/${it.event_id}`,
            },
        ],
    }
}

function unwrapLinks(text: string) {
    const graphId = window.roamAlphaAPI.graph.name

    const regex = new RegExp(`\\[(.*?)]\\(https:\\/\\/roamresearch\\.com\\/#\\/app\\/${graphId}\\/page\\/[a-zA-Z-_0-9]+?\\)`, 'g')
    return text.replaceAll(regex, '$1')
}

function getAudioText(it: AggregatedEvent, homeServerDomain: string) {
    return `{{[[audio]]: ${mxcToHttpUrl(it.content.url!, homeServerDomain)} }}`
}


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

