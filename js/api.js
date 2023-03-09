// Autorisation pour accéder au stockage synchrone

var resultatElement = document.getElementById("jsresultat");

document.body.onload = function() {
    chrome.storage.sync.get("data", function(items) {
        if (!chrome.runtime.error) {
        console.log(items);
        document.getElementById("data").innerText = items.data;
        resultatElement = items;
        }
    });
}

document.getElementById("set").onclick = function() {
    var d = document.getElementById("text").value;
    chrome.storage.sync.set({ "data" : d }, function() {
        if (chrome.runtime.error) {
            console.log("Runtime error.");
            resultatElement = "Runtime error.";
        }
    });
    window.close();
}