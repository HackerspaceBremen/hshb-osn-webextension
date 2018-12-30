function saveOptions() {
    let updateTime = document.getElementById("update-timer").value;
    let notifications = document.getElementById("send-notifications").checked;
    let messageNotifications = document.getElementById("send-message-notifications").checked;
    let settings = {
        update: updateTime,
        notifications: notifications,
        messageNotifications: messageNotifications
    };

    browser.storage.local.set(settings);
    browser.runtime.sendMessage(settings);
}

function localize() {
    document.getElementById("msg-update-every").innerText = browser.i18n.getMessage("optionsUpdateEveryLabel");
    document.getElementById("msg-updated-1-min").innerText = browser.i18n.getMessage("optionsOneMinuteLabel");
    document.getElementById("msg-updated-5-min").innerText = browser.i18n.getMessage("optionsNMinutesLabel", "5");
    document.getElementById("msg-updated-10-min").innerText = browser.i18n.getMessage("optionsNMinutesLabel", "10");
    document.getElementById("msg-updated-15-min").innerText = browser.i18n.getMessage("optionsNMinutesLabel", "15");
    document.getElementById("msg-updated-30-min").innerText = browser.i18n.getMessage("optionsNMinutesLabel", "30");
    document.getElementById("msg-send-notifications").innerText = browser.i18n.getMessage("optionsSendNotifications");
    document.getElementById("msg-send-message-notifications").innerText = browser.i18n.getMessage("optionsSendMessageNotifications");
}

function loadOptions() {
    getStorageValue("update", 5, (value) => {
        document.getElementById("update-timer").value = value;
    });

    getStorageValue("notifications", true, (value) => {
        document.getElementById("send-notifications").checked = value;
        updateDisabled();
    });

    getStorageValue("messageNotifications", false, (value) => {
        document.getElementById("send-message-notifications").checked = value;
    });
}

function updateDisabled() {
    if (document.getElementById("send-notifications").checked) {
        document.getElementById("send-message-notifications").disabled = false;
    } else {
        document.getElementById("send-message-notifications").checked = false;
        document.getElementById("send-message-notifications").disabled = true;
    }
}

localize();
loadOptions();
document.getElementById("update-timer").addEventListener("change", saveOptions);
document.getElementById("send-notifications").addEventListener("change", saveOptions);
document.getElementById("send-notifications").addEventListener("change", updateDisabled);
document.getElementById("send-message-notifications").addEventListener("change", saveOptions);
