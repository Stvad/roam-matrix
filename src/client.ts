import {Matrix, Credentials} from 'matrix-rx'

// todo potentially differentiate on graph name,
const credsKey = 'matrix-credentials-roam'

// todo popup should be prompted by the lack of credentials
export const saveCredentials = (credentials: Credentials) => {
    localStorage.setItem(credsKey, JSON.stringify(credentials))
}

export const loadCredentials = (): Credentials | undefined => {
    const credentials = localStorage.getItem(credsKey)
    return credentials ? JSON.parse(credentials) : undefined
}

export const clientFromStoredCredentials = (): Matrix => {
    const credentials = loadCredentials()
    if (!credentials) throw new Error('No credentials found')

    return Matrix.fromCredentials(credentials)
}
