"use strict";

function setNodeMessage(node, title, text) {
    node.classList.remove("hidden");
    node.textContent = "";
    const titleNode = document.createElement("h1");
    titleNode.innerText = title;
    node.appendChild(titleNode);
    if (text) {
        const textNode = document.createElement("p");
        textNode.innerText = text;
        node.appendChild(textNode);
    }
}

function error(msg) {
    setNodeMessage(document.getElementById("error-content"), browser.i18n.getMessage("errorMessage"), msg);
    document.getElementById("error-content").classList.remove("hidden");
    document.getElementById("popup-content").classList.add("hidden");
}

function ok(spaceStatus) {
    const popupContent = document.getElementById("popup-content");
    popupContent.classList.add("hidden");
    document.getElementById("error-content").classList.add("hidden");

    if (spaceStatus.error || spaceStatus.open === null) {
        error(spaceErrorMsg);
    } else if (spaceStatus.open) {
        popupContent.classList.remove("closed");
        popupContent.classList.add("open");
        setNodeMessage(popupContent, spaceOpenMsg, spaceStatus.message);
    } else {
        popupContent.classList.remove("open");
        popupContent.classList.add("closed");
        setNodeMessage(popupContent, spaceClosedMsg, spaceStatus.message);
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
