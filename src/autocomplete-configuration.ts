import {Matrix} from 'matrix-rx'

import {Page, Roam} from 'roam-api-wrappers/dist/data'
import {loadCredentials} from './client'
import sampleSize from 'lodash.samplesize'
import {Store} from './storage'

export async function sendAutocompleteConfiguration(roomId: string, store: Store = new Store()) {
    const credentials = loadCredentials()
    if (!credentials) return

    const autocompletePages = getAutocompletePages()

    const matrix = Matrix.fromCredentials(credentials)

    // todo make this incremental, so I don't have to re-send all the chunks each time
    const chunks = chunkPages(autocompletePages)
    console.log('Splitting autocomplete configuration into', chunks.length, 'chunks')

    for (const [idx, chunk] of chunks.entries()) {
    const graphId = window.roamAlphaAPI.graph.name
        await matrix.sendStateEvent(roomId, {
            type: 'matrix-rx.autocomplete',
            stateKey: `roam.autocomplete-pages.${graphId}.${idx}`,
            content: {
                pages: chunk,
            },
        })
    }
}

function getAutocompletePages() {
    const allPages = Roam.listPages().map(it => new Page(it))
    const notSrsPage = (it: Page) => !(it.text.includes('[[interval]]') || it.text.includes('[[factor]]'))

    return allPages
        .filter(notSrsPage)
        // we want a stable order for incremental updates
        .sort((a, b) => a.createdTime - b.createdTime)
        .map(it => ({
        text: it.text,
        id: it.uid,
        // todo this is not great perf wise, and probs not a great summary either
        summary: it.children[0]?.text,
        url: it.url,
    }))
}

function chunkPages<T>(array: T[]) {
    console.log('chunking', array.length)
    const chunkSize = estimateNumberOfObjectsInChunk(array)
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize))
    }
    console.log({chunkSize, numberOf: chunks.length})
    return chunks
}

/** By spec 65kb is the max size of the event
 * giving a bit of a buffer setting it to 60kb
 */
function estimateNumberOfObjectsInChunk(arr: any[], chunkSizeInBytes: number = 60 * 1024) {
    const sample = sampleSize(arr, 10)
    const sizes = sample.map(getObjectSize)
    console.log({sample, sizes})
    const objectSize = Math.max(...sizes)
    return Math.ceil(chunkSizeInBytes / objectSize)
}

function getObjectSize(obj: any) {
    const str = JSON.stringify(obj)
    return new TextEncoder().encode(str).length
}
