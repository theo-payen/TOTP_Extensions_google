// thème color 
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.style.backgroundColor = "#333";
    document.body.style.color = "#fff";
} else {
    document.body.style.backgroundColor = "#FFF";
    document.body.style.color = "#333";
}


class synctotp {
    constructor() {
        //pass
    }
    // todo : get la clé avant de set pour incrémenter 
    // todo : get data dans un json

    getalldata() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(function(data) {
                var dataArray = Object.values(data);
                var jsonData = JSON.stringify(dataArray);
                resolve(jsonData);
            });
        });
    }

    getdata(key) {
        chrome.storage.sync.get(key, function(result) {
            console.log('Valeur récupérée pour ma Cle : ' + result.key);
            return result.key
        });
    }

    setdata(key,data) {
        chrome.storage.sync.set({[key]: data}, function() {
            console.log('Données stockées avec succès !');
        });
    }

    deletdata(key){
        chrome.storage.sync.remove(key, function() {
            console.log('La clé a été supprimée.');
        });
    }
}

let totp = new synctotp();

totp.setdata(1,54313213)
totp.setdata(2,9313213)
totp.setdata(3,459313213)


const list_totp = document.getElementById('list_totp');
list_totp.textContent = totp.getalldata()
console.log(totp.getalldata());



/*
for(let i = 0; i < Donnees.length; i++) {
    const p = document.createElement('p');
    p.textContent = Donnees[i];
    list_totp.appendChild(p);
}
*/


document.body.onload = function() {
    chrome.storage.sync.get("data", function(items) {
        if (!chrome.runtime.error) {
        console.log(items);
        document.getElementById("data").innerText = items.data;
        }
    });
}

document.getElementById("set").onclick = function() {
    var d = document.getElementById("text").value;
    chrome.storage.sync.set({ "data" : d }, function() {
        if (chrome.runtime.error) {
            console.log("Runtime error.");
        }
    });
    location.reload();
    //window.close();
}

// actialise la page toute les 30 seconde
// debut
function actualiser() {
    var d = new Date();
    var secondsUntilNextHalfMinute = (30 - (d.getSeconds() % 30)) * 1000;
    setTimeout(function() {
        location.reload();
    }, secondsUntilNextHalfMinute);
}

actualiser(); // Appel initial
setInterval(actualiser, 30000); // Appel toutes les 30 secondes
// fin

// affiche le timer de 30 à 0 seconde
// debut
function updateTimer() {
    const now = new Date();
    const seconds = now.getSeconds();
    let timeset;
    if (seconds >= 0 && seconds < 30) {
        timeset = 0;
    } else {
        timeset = 30;
    }
    const remainingSeconds = timeset - (seconds - 30);
    const countdown = document.getElementById("countdown");
    countdown.textContent = remainingSeconds.toString().padStart(2, "0");
    
    if (remainingSeconds <= 5) {
        countdown.style.color = "red";
    } else if (remainingSeconds <= 10) {
        countdown.style.color = "orange";
    } else {
        countdown.style.color = "green";
    }
}
setInterval(updateTimer, 1000);
// fin 