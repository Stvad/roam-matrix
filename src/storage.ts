export class Store {
    constructor(private storage: Storage = localStorage) {
    }

    get<T>(key: string, defaultValue?: T): T | undefined {
        const str = this.storage.getItem(key)
        return str ? JSON.parse(str) as T : defaultValue
    }

    set<T>(key: string, value: T) {
        this.storage.setItem(key, JSON.stringify(value))
    }
}
