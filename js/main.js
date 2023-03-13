// thème color 
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.style.backgroundColor = "#333"
    document.body.style.color = "#fff"
} else {
    document.body.style.backgroundColor = "#FFF"
    document.body.style.color = "#333"
}

function getData(callback) {
    chrome.storage.sync.get(function(data) {
        var dataArray = Object.values(data)
        console.log(dataArray)
        callback(dataArray)
    })
}

function setdata(key,data) {
    chrome.storage.sync.set({[key]: data}, function() {
        console.log('Données stockées avec succès !')
    })
}

function verifierSuppression(clé) {
    chrome.storage.sync.get(clé, function(resultat) {
        if (resultat[clé] === undefined) {
            console.log('La clé a été supprimée avec succès.');
        } else {
            console.log('La clé n\'a pas été supprimée.');
        }
    });
}

function deletdata(key){
    chrome.storage.sync.remove(key, function() {
        console.log('La clé a été supprimée.')
        verifierSuppression(key)
        
    })
}

document.getElementById("button_add_key").onclick = function(){
    getData(function(myData){
        setdata(String(myData.length),document.getElementById("input_add_key").value)
    })
    location.reload()
    
}



getData(function(myData) {
    console.log(myData)

    const all_cards = document.getElementById("all_cards")

    for(i = 0; i < myData.length; i++){
        const card = document.createElement("div");
        card.id = "card"+i;
        card.classList.add("card");

        const name = document.createElement("p");
        name.id = "name"+i;
        name.classList.add("name");
        name.textContent = "test"
        card.appendChild(name);
        

        const code = document.createElement("p");
        code.id = "code"+i;
        code.classList.add("code");
        code.textContent = "code"
        card.appendChild(code);

        const key = document.createElement("p");
        key.id = "key"+i;
        key.classList.add("key");
        key.textContent = myData[i];
        card.appendChild(key);

        const del = document.createElement("button");
        del.id = "del"+i;
        del.classList.add("del");
        del.textContent = "Supprimer";
        del.setAttribute("data-valeur", i);

        //todo : error
        // const boutons = document.querySelectorAll(".del");
        // // Ajouter un écouteur d'événement "click" à chaque bouton
        // boutons.forEach(bouton => {
        //     bouton.addEventListener("click", (event) => {
        //         const valeur = event.target.getAttribute("data-valeur");
        //         deletdata(String(valeur))
        //         console.log(String(valeur))
        //     });
        // });

        card.appendChild(del);




        

        // Ajout de l'enfant à la div parent
        all_cards.appendChild(card);
    }
    //myData
})



document.addEventListener('DOMContentLoaded', function() {
    const boutons = document.querySelectorAll(".del");
    // Ajouter un écouteur d'événement "click" à chaque bouton
    boutons.forEach(bouton => {
        bouton.addEventListener("click", (event) => {
            const valeur = event.target.getAttribute("data-valeur");
            deletdata(String(valeur))
            console.log(String(valeur))
        });
    });
});


// deletdata("0")
// deletdata("1")
// deletdata("2")
// deletdata("3")
// deletdata("4")
// deletdata("5")
// deletdata("6")
// deletdata("7")
// deletdata("8")

/*
for(let i = 0 i < Donnees.length i++) {
    const p = document.createElement('p')
    p.textContent = Donnees[i]
    list_totp.appendChild(p)
}
*/


// document.body.onload = function() {
//     chrome.storage.sync.get("data", function(items) {
//         if (!chrome.runtime.error) {
//         console.log(items)
//         document.getElementById("data").innerText = items.data
//         }
//     })
// }
/*
document.getElementById("set").onclick = function() {
    var d = document.getElementById("text").value
    chrome.storage.sync.set({ "data" : d }, function() {
        if (chrome.runtime.error) {
            console.log("Runtime error.")
        }
    })
    location.reload()
    //window.close()
}
*/

// actialise la page toute les 30 seconde
// debut
function actualiser() {
    var d = new Date()
    var secondsUntilNextHalfMinute = (30 - (d.getSeconds() % 30)) * 1000
    setTimeout(function() {
        location.reload()
    }, secondsUntilNextHalfMinute)
}

actualiser() // Appel initial
setInterval(actualiser, 30000) // Appel toutes les 30 secondes
// fin

// affiche le timer de 30 à 0 seconde
// debut
function updateTimer() {
    const now = new Date()
    const seconds = now.getSeconds()
    let timeset
    if (seconds >= 0 && seconds < 30) {
        timeset = 0
    } else {
        timeset = 30
    }
    const remainingSeconds = timeset - (seconds - 30)
    const countdown = document.getElementById("countdown")
    countdown.textContent = remainingSeconds.toString().padStart(2, "0")
    
    if (remainingSeconds <= 5) {
        countdown.style.color = "red"
    } else if (remainingSeconds <= 10) {
        countdown.style.color = "orange"
    } else {
        countdown.style.color = "green"
    }
}
setInterval(updateTimer, 1000)
// fin 