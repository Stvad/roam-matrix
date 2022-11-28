import {Matrix} from 'matrix-rx'

import {Page, Roam} from 'roam-api-wrappers/dist/data'
import {loadCredentials} from './client'

export async function sendAutocompleteConfiguration() {
    const credentials = loadCredentials()
    if (!credentials) return

    const allPages = Roam.listPages().map(it => new Page(it))
    const autocompletePages = allPages.map(it => ({
        text: it.text,
        id: it.uid,
        // todo this is not great perf wise, and probs not a great summary either
        summary: it.children[0]?.text,
    }))


    const matrix = Matrix.fromCredentials(credentials)

    const graphId = 'stvad'

    // todo select room in ui or at least let user enter the id
    return matrix.sendStateEvent('!xwGMGAlaCQHDOKHxGB:matrix.org', {
        type: 'matrix-rx.autocomplete',
        stateKey: 'allPages',
        content: {
            pages: autocompletePages,
            urlPattern: `https://roamresearch.com/#/app/${graphId}/page/{{id}}`,
        }
    })
}
