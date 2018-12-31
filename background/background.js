"use strict";

const spaceOpenMsg = browser.i18n.getMessage("spaceOpenMessage");
const spaceClosedMsg = browser.i18n.getMessage("spaceClosedMessage");

let sendNotifications = true;
let sendMessageNotifications = false;

let spaceStatus = {
    open: null,
    error: false,
    message: "",
};

let interval = null;

function loadSettings() {
    getStorageValue("notifications", true, (value) => {
        sendNotifications = value;
    });

    getStorageValue("messageNotifications", true, (value) => {
        sendMessageNotifications = value;
    });
}

function getUpdateTime(callback) {
    getStorageValue("update", 5, (value) => {
        callback(value);
    });
}

function updateInterval(time) {
    let milliseconds = 1000 * 60 * time;
    if (interval) {
        window.clearInterval(interval);
    }
    interval = window.setInterval(function () {
        checkSpaceStatus();
    }, milliseconds);
}

function sendNotification(spaceOpen, messageChanged, spaceMessage) {
    if (spaceOpen !== spaceStatus.open || spaceStatus.error || (sendMessageNotifications && messageChanged)) {
        let message = spaceOpen ? spaceOpenMsg : spaceClosedMsg;
        if (spaceMessage) {
            message += ":\n" + spaceMessage;
        }

        browser.notifications.create({
            "type": "basic",
            "iconUrl": spaceOpen ? "icons/state_open.svg" : "icons/state_closed.svg",
            "title": browser.i18n.getMessage("notificationTitle"),
            "message": message
        });
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function processResponse(request) {
    try {
        let jsonObj = JSON.parse(request.responseText);
        let spaceOpen = jsonObj.open;
        let ST2message = jsonObj.status;
        let ST5message = "";
        if (jsonObj.hasOwnProperty("RESULT")) {
            ST2message = jsonObj.RESULT.hasOwnProperty("ST2") ? jsonObj.RESULT.ST2.trim() : ST2message;
            ST5message = jsonObj.RESULT.hasOwnProperty("ST5") ? jsonObj.RESULT.ST5.trim() : ST5message;
        }
        let spaceMessage = escapeHtml(ST2message);
        let notificationMessage = ST2message;
        if (ST5message) {
            spaceMessage += "<br>" + escapeHtml(ST5message);
            notificationMessage += " - " + ST5message;
        }
        let messageChanged = spaceMessage !== spaceStatus.message;

        if (sendNotifications) {
            sendNotification(spaceOpen, messageChanged, notificationMessage);
        }

        browser.browserAction.setIcon({
            path: {
                48: spaceOpen ? "icons/state_open.svg" : "icons/state_closed.svg",
                96: spaceOpen ? "icons/state_open.svg" : "icons/state_closed.svg",
            }
        });

        spaceStatus.open = spaceOpen;
        spaceStatus.error = false;
        spaceStatus.message = spaceMessage;
    } catch (e) {
        spaceStatus.error = true;
        browser.browserAction.setIcon({
            path: {
                48: "icons/state_error.svg",
                96: "icons/state_error.svg",
            }
        });
    }
}

function checkSpaceStatus() {
    let request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            processResponse(request);
        }
    };

    request.onerror = function () {
        console.log("Error making request.");
        spaceStatus.error = true;
    };


    let requestLanguage = browser.i18n.getUILanguage().split("-")[0];
    if (requestLanguage !== "de" && requestLanguage !== "en") {
        requestLanguage = "de";
    }
    request.open("GET", "https://hackerspacehb.appspot.com/v2/status?format=" + requestLanguage + "&htmlEncoded=false", true);
    request.send();
}

browser.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        if (message.getStatus) {
            sendResponse(spaceStatus);
        } else if (message.update) {
            updateInterval(message.update);
            sendNotifications = message.notifications;
            sendMessageNotifications = message.messageNotifications;
        }
    }
);

loadSettings();
getUpdateTime(updateInterval);
checkSpaceStatus();
