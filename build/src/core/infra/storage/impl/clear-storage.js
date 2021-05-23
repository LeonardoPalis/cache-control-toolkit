export class ClearStorageImpl {
    cleanByKey(key) {
        localStorage.removeItem(key);
    }
    ;
    cleanAll() {
        localStorage.clear();
    }
}
