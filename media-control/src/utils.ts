
export default {
    async timeout(ms: number) {
        return new Promise<void>(resolve => {
            setTimeout(resolve, ms);
        })
    }
}