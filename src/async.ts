export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const memoize = <T extends (...args: any[]) => any>(fn: T, rememberFor: number) => {
    let lastCallTime: number = 0
    let lastResult: ReturnType<T>
    return (...args: Parameters<T>): ReturnType<T> => {
        const now = Date.now()
        if (now - lastCallTime > rememberFor) {
            lastResult = fn(...args)
            lastCallTime = now
        }
        return lastResult
    }
}
