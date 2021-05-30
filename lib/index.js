'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

exports.TimeTypes = void 0;
(function (TimeTypes) {
    TimeTypes["MS"] = "miliseconds";
    TimeTypes["S"] = "seconds";
    TimeTypes["M"] = "minutes";
    TimeTypes["H"] = "hours";
})(exports.TimeTypes || (exports.TimeTypes = {}));
function convertTimeToMiliseconds(time) {
    if (time.type === exports.TimeTypes.H) {
        return time.time * 3600000;
    }
    if (time.type === exports.TimeTypes.M) {
        return time.time * 60000;
    }
    if (time.type === exports.TimeTypes.S) {
        return time.time * 1000;
    }
    return time.time;
}

exports.UnregisterMode = void 0;
(function (UnregisterMode) {
    UnregisterMode["deleteOnTime"] = "deleteOnTime";
    UnregisterMode["waitToCloseSite"] = "waitToCloseSite";
})(exports.UnregisterMode || (exports.UnregisterMode = {}));

var StorageMapper;
(function (StorageMapper) {
    StorageMapper["config"] = "__cctconfig__";
    StorageMapper["registeredKeyCount"] = "__keyc__";
    StorageMapper["registeredKeyPrefix"] = "rk_";
})(StorageMapper || (StorageMapper = {}));

class CacheControlRegisterImpl {
    constructor(setStorage, clearStorage, keyRegister, getStorage, keyUnregister) {
        this.setStorage = setStorage;
        this.clearStorage = clearStorage;
        this.keyRegister = keyRegister;
        this.getStorage = getStorage;
        this.keyUnregister = keyUnregister;
    }
    _handleObservableChanges(config) {
        config.observableKeys.forEach((observableKey) => {
            const observableKeyTargetValue = this.getStorage.recovery(observableKey.key);
            const allKeyRegister = this.getStorage.recovery(StorageMapper.registeredKeyPrefix, { includes: true });
            if (allKeyRegister && typeof allKeyRegister === "object") {
                if (observableKeyTargetValue !== null) {
                    const observableKeyRegistered = allKeyRegister.find((keyRegister) => {
                        const parsedKeyRegister = JSON.parse(keyRegister === null || keyRegister === void 0 ? void 0 : keyRegister.value);
                        return parsedKeyRegister.ref === observableKey.key;
                    });
                    if (!observableKeyRegistered) {
                        const _a = this.keyRegister.execute(observableKey), { tag } = _a, _registeredKey = __rest(_a, ["tag"]);
                        this.setStorage.save(tag, _registeredKey);
                    }
                }
            }
        });
    }
    _handleObservableChangesWithInterval(config) {
        const cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
        setInterval(() => {
            this._handleObservableChanges(config);
        }, cicleTimeMiliseconds);
    }
    _handleIntervalRegisterObservable(config) {
        const cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
        setInterval(() => {
            this._handleRegister(exports.UnregisterMode.deleteOnTime);
        }, cicleTimeMiliseconds);
    }
    _handleRegister(mode) {
        const allKeyRegister = this.getStorage.recovery(StorageMapper.registeredKeyPrefix, { includes: true });
        if (allKeyRegister && typeof allKeyRegister === "object") {
            allKeyRegister.forEach((keyRegister) => {
                var _a;
                const keyRegisterValue = JSON.parse(keyRegister === null || keyRegister === void 0 ? void 0 : keyRegister.value);
                if (((_a = keyRegisterValue.unregistered) === null || _a === void 0 ? void 0 : _a.mode) === mode) {
                    this.keyUnregister.execute((keyRegister === null || keyRegister === void 0 ? void 0 : keyRegister.key) || "");
                }
            });
        }
    }
    _handleWaitToClose() {
        window.addEventListener("beforeunload", () => {
            this._handleRegister(exports.UnregisterMode.waitToCloseSite);
        });
    }
    register(config) {
        if (config.isValid()) {
            this._handleObservableChangesWithInterval(config);
        }
        else {
            console.info("Config register is invalid or has been alread started");
        }
        this._handleIntervalRegisterObservable(config);
        this._handleWaitToClose();
    }
}

class KeyRegisterImpl {
    _createTag(key) {
        return `${StorageMapper.registeredKeyPrefix}${key}`;
    }
    execute(observableKey) {
        const expiresAt = new Date(new Date().getTime() + convertTimeToMiliseconds(observableKey.ttl));
        return {
            tag: this._createTag(observableKey.key),
            expiresAt,
            registeredAt: new Date(),
            unregistered: observableKey.unregister,
            ttl: {
                time: 5,
                type: exports.TimeTypes.S
            },
            ref: observableKey.key,
        };
    }
    ;
}

class KeyUnregisterImpl {
    constructor(getStorage, setStorage, clearStorage) {
        this.getStorage = getStorage;
        this.setStorage = setStorage;
        this.clearStorage = clearStorage;
    }
    execute(key) {
        const keyRegister = this.getStorage.recovery(key);
        if (keyRegister && typeof keyRegister === "string") {
            const parsedKeyRegister = JSON.parse(keyRegister);
            const now = new Date().getTime();
            const keyRegisterExpires = new Date(parsedKeyRegister.expiresAt).getTime();
            if (now >= keyRegisterExpires) {
                this.clearStorage.cleanByKey(parsedKeyRegister.ref);
                this.clearStorage.cleanByKey(key);
            }
        }
    }
}

class ClearStorageImpl {
    cleanByKey(key) {
        localStorage.removeItem(key);
    }
    ;
    cleanAll() {
        localStorage.clear();
    }
}

class GetStorageImpl {
    _getAllStorageKeys() {
        return Object.keys(localStorage);
    }
    recovery(key, mode) {
        if (mode === null || mode === void 0 ? void 0 : mode.includes) {
            const allStorageKeys = this._getAllStorageKeys();
            const allStorageValues = [];
            allStorageKeys === null || allStorageKeys === void 0 ? void 0 : allStorageKeys.forEach(storageKey => {
                if (storageKey.includes(key)) {
                    allStorageValues.push({
                        key: storageKey,
                        value: localStorage.getItem(storageKey)
                    });
                }
            });
            return allStorageValues;
        }
        return localStorage.getItem(key);
    }
    ;
}

class SetStorageImpl {
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    ;
}

class CacheControlToolkit {
    static register(config) {
        const setStorage = new SetStorageImpl();
        const setStorageString = new SetStorageImpl();
        const getStorage = new GetStorageImpl();
        const clearStorage = new ClearStorageImpl();
        const keyRegister = new KeyRegisterImpl();
        const keyUnregister = new KeyUnregisterImpl(getStorage, setStorageString, clearStorage);
        const cacheControl = new CacheControlRegisterImpl(setStorage, clearStorage, keyRegister, getStorage, keyUnregister);
        cacheControl.register(config);
    }
}

const defaultTTL = {
    type: exports.TimeTypes.M,
    time: 5
};
const defaultCicleTime = {
    type: exports.TimeTypes.S,
    time: 5
};
class ConfigRegister {
    constructor(ttl, observableKeys, cicleTime) {
        this.observableKeys = [];
        this.ttl = ttl || defaultTTL;
        this.cicleTime = cicleTime || defaultCicleTime;
        this.observableKeys = observableKeys;
    }
    isValid() {
        return Object.values(exports.TimeTypes).includes(this.ttl.type) && this.ttl.time > 0;
    }
}

exports.CacheControlToolkit = CacheControlToolkit;
exports.ConfigRegister = ConfigRegister;
