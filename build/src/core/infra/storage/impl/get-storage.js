export class GetStorageImpl {
    recovery(key) {
        return localStorage.getItem(key);
    }
    ;
}
