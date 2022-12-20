import {Page} from 'roam-api-wrappers/dist/data'

interface AsyncStorage {
    get(key: string): Promise<string | null>
    set(key: string, value: string): Promise<void>
}

export class ObjectStorage {
    constructor(private storage: AsyncStorage) {
    }

    async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        const str = await this.storage.get(key)
        return str ? JSON.parse(str) as T : defaultValue
    }

    set = <T>(key: string, value: T) =>
        this.storage.set(key, JSON.stringify(value))
}

export class RoamStorage implements AsyncStorage {
    constructor(private pageName: string) {
    }

    async get(key: string): Promise<string | null> {
        return Page.fromName(this.pageName)?.childWithValue(key)?.children[0]?.text ?? null
    }

    async set(key: string, value: string) {
        const page = Page.fromName(this.pageName)!
        const block = await page.childAtPath([key, '0'], true)
        block!.text = value
    }
}
