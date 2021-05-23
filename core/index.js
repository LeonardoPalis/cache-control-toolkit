'use strict';

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

var TimeTypes;
(function (TimeTypes) {
    TimeTypes["MS"] = "miliseconds";
    TimeTypes["S"] = "seconds";
    TimeTypes["M"] = "minutes";
    TimeTypes["H"] = "hours";
})(TimeTypes || (TimeTypes = {}));
function convertTimeToMiliseconds(time) {
    if (time.type === TimeTypes.H) {
        return time.time * 3600000;
    }
    if (time.type === TimeTypes.M) {
        return time.time * 60000;
    }
    if (time.type === TimeTypes.S) {
        return time.time * 1000;
    }
    return time.time;
}

var UnregisterMode;
(function (UnregisterMode) {
    UnregisterMode["deleteOnTime"] = "deleteOnTime";
    UnregisterMode["waitToCloseSite"] = "waitToCloseSite";
})(UnregisterMode || (UnregisterMode = {}));

var StorageMapper;
(function (StorageMapper) {
    StorageMapper["config"] = "__cctconfig__";
    StorageMapper["registeredKeyCount"] = "__keyc__";
    StorageMapper["registeredKeyPrefix"] = "rk_";
})(StorageMapper || (StorageMapper = {}));

var CacheControlRegisterImpl = /** @class */ (function () {
    function CacheControlRegisterImpl(setStorage, clearStorage, keyRegister, getStorage, keyUnregister) {
        this.setStorage = setStorage;
        this.clearStorage = clearStorage;
        this.keyRegister = keyRegister;
        this.getStorage = getStorage;
        this.keyUnregister = keyUnregister;
    }
    CacheControlRegisterImpl.prototype._handleObservableChanges = function (config) {
        var _this = this;
        config.observableKeys.forEach(function (observableKey) {
            var observableKeyTargetValue = _this.getStorage.recovery(observableKey.key);
            var allKeyRegister = _this.getStorage.recovery(StorageMapper.registeredKeyPrefix, { includes: true });
            if (allKeyRegister && typeof allKeyRegister === "object") {
                if (observableKeyTargetValue !== null) {
                    var observableKeyRegistered = allKeyRegister.find(function (keyRegister) {
                        var parsedKeyRegister = JSON.parse(keyRegister === null || keyRegister === void 0 ? void 0 : keyRegister.value);
                        return parsedKeyRegister.ref === observableKey.key;
                    });
                    if (!observableKeyRegistered) {
                        var _a = _this.keyRegister.execute(observableKey), tag = _a.tag, _registeredKey = __rest(_a, ["tag"]);
                        _this.setStorage.save(tag, _registeredKey);
                    }
                }
            }
        });
    };
    CacheControlRegisterImpl.prototype._handleObservableChangesWithInterval = function (config) {
        var _this = this;
        var cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
        setInterval(function () {
            _this._handleObservableChanges(config);
        }, cicleTimeMiliseconds);
    };
    CacheControlRegisterImpl.prototype._handleIntervalRegisterObservable = function (config) {
        var _this = this;
        var cicleTimeMiliseconds = convertTimeToMiliseconds(config.cicleTime);
        setInterval(function () {
            _this._handleRegister(UnregisterMode.deleteOnTime);
        }, cicleTimeMiliseconds);
    };
    CacheControlRegisterImpl.prototype._handleRegister = function (mode) {
        var _this = this;
        var allKeyRegister = this.getStorage.recovery(StorageMapper.registeredKeyPrefix, { includes: true });
        if (allKeyRegister && typeof allKeyRegister === "object") {
            allKeyRegister.forEach(function (keyRegister) {
                var _a;
                var keyRegisterValue = JSON.parse(keyRegister === null || keyRegister === void 0 ? void 0 : keyRegister.value);
                if (((_a = keyRegisterValue.unregistered) === null || _a === void 0 ? void 0 : _a.mode) === mode) {
                    _this.keyUnregister.execute((keyRegister === null || keyRegister === void 0 ? void 0 : keyRegister.key) || "");
                }
            });
        }
    };
    CacheControlRegisterImpl.prototype._handleWaitToClose = function () {
        var _this = this;
        window.addEventListener("beforeunload", function () {
            _this._handleRegister(UnregisterMode.waitToCloseSite);
        });
    };
    CacheControlRegisterImpl.prototype.register = function (config) {
        if (config.isValid()) {
            this._handleObservableChangesWithInterval(config);
        }
        else {
            console.info("Config register is invalid or has been alread started");
        }
        this._handleIntervalRegisterObservable(config);
        this._handleWaitToClose();
    };
    return CacheControlRegisterImpl;
}());

var KeyRegisterImpl = /** @class */ (function () {
    function KeyRegisterImpl() {
    }
    KeyRegisterImpl.prototype._createTag = function (key) {
        return "" + StorageMapper.registeredKeyPrefix + key;
    };
    KeyRegisterImpl.prototype.execute = function (observableKey) {
        var expiresAt = new Date(new Date().getTime() + convertTimeToMiliseconds(observableKey.ttl));
        return {
            tag: this._createTag(observableKey.key),
            expiresAt: expiresAt,
            registeredAt: new Date(),
            unregistered: observableKey.unregister,
            ttl: {
                time: 5,
                type: TimeTypes.S
            },
            ref: observableKey.key,
        };
    };
    return KeyRegisterImpl;
}());

var KeyUnregisterImpl = /** @class */ (function () {
    function KeyUnregisterImpl(getStorage, setStorage, clearStorage) {
        this.getStorage = getStorage;
        this.setStorage = setStorage;
        this.clearStorage = clearStorage;
    }
    KeyUnregisterImpl.prototype.execute = function (key) {
        var keyRegister = this.getStorage.recovery(key);
        if (keyRegister && typeof keyRegister === "string") {
            var parsedKeyRegister = JSON.parse(keyRegister);
            var now = new Date().getTime();
            var keyRegisterExpires = new Date(parsedKeyRegister.expiresAt).getTime();
            if (now >= keyRegisterExpires) {
                this.clearStorage.cleanByKey(parsedKeyRegister.ref);
                this.clearStorage.cleanByKey(key);
            }
        }
    };
    return KeyUnregisterImpl;
}());

var defaultTTL = {
    type: TimeTypes.M,
    time: 5
};
var defaultCicleTime = {
    type: TimeTypes.S,
    time: 5
};
var ConfigRegister = /** @class */ (function () {
    function ConfigRegister(ttl, observableKeys, cicleTime) {
        this.observableKeys = [];
        this.ttl = ttl || defaultTTL;
        this.cicleTime = cicleTime || defaultCicleTime;
        this.observableKeys = observableKeys;
    }
    ConfigRegister.prototype.isValid = function () {
        return Object.values(TimeTypes).includes(this.ttl.type) && this.ttl.time > 0;
    };
    return ConfigRegister;
}());

var ClearStorageImpl = /** @class */ (function () {
    function ClearStorageImpl() {
    }
    ClearStorageImpl.prototype.cleanByKey = function (key) {
        localStorage.removeItem(key);
    };
    ClearStorageImpl.prototype.cleanAll = function () {
        localStorage.clear();
    };
    return ClearStorageImpl;
}());

var GetStorageImpl = /** @class */ (function () {
    function GetStorageImpl() {
    }
    GetStorageImpl.prototype._getAllStorageKeys = function () {
        return Object.keys(localStorage);
    };
    GetStorageImpl.prototype.recovery = function (key, mode) {
        if (mode === null || mode === void 0 ? void 0 : mode.includes) {
            var allStorageKeys = this._getAllStorageKeys();
            var allStorageValues_1 = [];
            allStorageKeys === null || allStorageKeys === void 0 ? void 0 : allStorageKeys.forEach(function (storageKey) {
                if (storageKey.includes(key)) {
                    allStorageValues_1.push({
                        key: storageKey,
                        value: localStorage.getItem(storageKey)
                    });
                }
            });
            return allStorageValues_1;
        }
        return localStorage.getItem(key);
    };
    return GetStorageImpl;
}());

var SetStorageImpl = /** @class */ (function () {
    function SetStorageImpl() {
    }
    SetStorageImpl.prototype.save = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };
    return SetStorageImpl;
}());

var setStorage = new SetStorageImpl();
var setStorageString = new SetStorageImpl();
var getStorage = new GetStorageImpl();
var clearStorage = new ClearStorageImpl();
var keyRegister = new KeyRegisterImpl();
var keyUnregister = new KeyUnregisterImpl(getStorage, setStorageString, clearStorage);
var cacheControl = new CacheControlRegisterImpl(setStorage, clearStorage, keyRegister, getStorage, keyUnregister);
var config = new ConfigRegister({
    time: 5,
    type: TimeTypes.S,
}, [{
        key: 'haha',
        ttl: {
            time: 15,
            type: TimeTypes.S
        },
        unregister: {
            mode: UnregisterMode.waitToCloseSite,
        }
    },
    {
        key: 'test',
        ttl: {
            time: 10,
            type: TimeTypes.S
        },
        unregister: {
            mode: UnregisterMode.deleteOnTime,
        }
    }]);
cacheControl.register(config);
