function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function error(msg) {
    document.getElementById("error-content").innerHTML = browser.i18n.getMessage("errorMessage", msg);
    document.getElementById("error-content").classList.remove("hidden");
    document.getElementById("popup-content").classList.add("hidden");
}

function ok(spaceStatus) {
    if (spaceStatus.error || spaceStatus.open === null) {
        error(spaceErrorMsg);
    } else if (spaceStatus.open) {
        document.getElementById("popup-content").classList.remove("closed");
        document.getElementById("popup-content").classList.add("open");
        let displayMessage = "<h1 class='title'>" + spaceOpenMsg + "</h1>";
        if (spaceStatus.message) {
            displayMessage += escapeHtml(spaceStatus.message);
        }
        document.getElementById("popup-content").innerHTML = displayMessage;
    } else {
        document.getElementById("popup-content").classList.remove("open");
        document.getElementById("popup-content").classList.add("closed");
        let displayMessage = "<h1 class='title'>" + spaceClosedMsg + "</h1>";
        if (spaceStatus.message) {
            displayMessage += escapeHtml(spaceStatus.message);
        }
        document.getElementById("popup-content").innerHTML = displayMessage;
    }
}

const spaceOpenMsg = browser.i18n.getMessage("spaceOpenMessage");
const spaceClosedMsg = browser.i18n.getMessage("spaceClosedMessage");
const spaceErrorMsg = browser.i18n.getMessage("unknownError");

var sending = browser.runtime.sendMessage({getStatus: true});
sending.then(ok, error);

browser.runtime.onMessage.addListener(
    (message) => {
        if (message.hasOwnProperty("open")) {
            ok(message);
        }
    }
);
