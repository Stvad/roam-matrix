import {loadCredentials} from './chat-popup'
import {Matrix} from 'matrix-rx'

import {Page, Roam} from 'roam-api-wrappers/dist/data'

export async function sendAutocompleteConfiguration() {
    const credentials = loadCredentials()
    if (!credentials) return

    const allPages = Roam.listPages().map(it => new Page(it))
    const allPageTitles = allPages.map(it => it.text)

    const matrix = Matrix.fromCredentials(credentials)

    return matrix.sendStateEvent('!xwGMGAlaCQHDOKHxGB:matrix.org', {
        type: 'matrix-rx.autocomplete',
        stateKey: 'allPages',
        content: {
            pageNames: allPageTitles,
        }
    })
}
