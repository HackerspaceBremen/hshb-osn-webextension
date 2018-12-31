"use strict";

function getStorageValue(key, defaultValue, callback) {
    let req = browser.storage.local.get(key);
    req.then((res) => {
        if (res.hasOwnProperty(key)) {
            callback(res[key]);
        } else {
            callback(defaultValue);
        }
    });
}
