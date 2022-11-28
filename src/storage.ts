export class Store {
    constructor(private storage: Storage = localStorage) {
    }

    get<T>(key: string): T | null {
        const str = this.storage.getItem(key)
        return str ? JSON.parse(str) as T : null
    }

    set<T>(key: string, value: T) {
        this.storage.setItem(key, JSON.stringify(value))
    }
}
