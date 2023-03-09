// Autorisation pour accéder au stockage synchrone

const secret = "NE5S5B5XE5ZEBL5J"; // C'est la clé secrète qui doit être partagée entre le serveur et le client. J'espère que personne ne va la voler ! Ah ah ah.
const time = Math.floor(Date.now() / 1000 / 30); // Je prends le temps en secondes et je le divise par la durée de validité d'un code, qui est de 30 secondes. Oui, je sais, j'ai toutes les connaissances sur la durée de validité d'un code, comme un expert de la sécurité !
const totp = new jsOTP.totp.TOTP(secret, 6, 30, "SHA1"); // Maintenant, je crée un objet TOTP avec la clé secrète, une longueur de 6 chiffres, une durée de validité de 30 secondes et un algorithme de hachage SHA-1. Je suis un génie de la cryptographie !
const code = totp.at(time); // Et maintenant, je génère le code TOTP pour le temps donné. Je suis tellement fort !
console.log(code); // Et je vais afficher le code dans la console. Tout le monde peut le voir, mais ça ne me dérange pas. Qui a besoin de sécurité de toute façon ?! Haha !


const element = document.getElementById('jsresultat');

element.textContent = code;


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

