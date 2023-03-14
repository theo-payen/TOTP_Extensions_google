var Convert = Convert || {};

//Converts a base32 string into a hex string. The padding is optional
Convert.base32toHex = function (data) {
	//Basic argument validation
	if (typeof(data) !== typeof("")) {
		throw new Error("Argument to base32toHex() is not a string");
	}
	if (data.length === 0) {
		throw new Error("Argument to base32toHex() is empty");
	}
	if (!data.match(/^[A-Z2-7]+=*$/i)) {
		throw new Error("Argument to base32toHex() contains invalid characters");
	}

	//Return value
	var ret = "";
	//Maps base 32 characters to their value (the value is the array index)
	var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".split('');
	//Split data into groups of 8
	var segments = (data.toUpperCase() + "========").match(/.{1,8}/g);
	//Adding the "=" in the line above creates an unnecessary entry
	segments.pop();
	//Calculate padding length
	var strip = segments[segments.length - 1].match(/=*$/)[0].length;
	//Too many '=' at the end. Usually a padding error due to an incomplete base32 string
	if (strip > 6) {
		throw new Error("Invalid base32 data (too much padding)");
	}
	//Process base32 in sections of 8 characters
	for (var i = 0; i < segments.length; i++) {
		//Start with empty buffer each time
		var buffer = 0;
		var chars = segments[i].split("");
		//Process characters individually
		for (var j = 0; j < chars.length; j++) {
			//This is the same as a left shift by 32 characters but without the 32 bit JS int limitation
			buffer *= map.length;
			//Map character to real value
			var index = map.indexOf(chars[j]);
			//Fix padding by ignoring it for now
			if (chars[j] === '=') {
				index = 0;
			}
			//Add real value
			buffer += index;
		}
		//Pad hex string to 10 characters (5 bytes)
		var hex = ("0000000000" + buffer.toString(16)).substr(-10);
		ret += hex;
	}
	//Remove bytes according to the padding
	switch (strip) {
	case 6:
		return ret.substr(0, ret.length - 8);
	case 4:
		return ret.substr(0, ret.length - 6);
	case 3:
		return ret.substr(0, ret.length - 4);
	case 1:
		return ret.substr(0, ret.length - 2);
	default:
		return ret;
	}
};
//Converts a hex string into an array with numerical values
Convert.hexToArray = function (hex) {
	return hex.match(/[\dA-Fa-f]{2}/g).map(function (v) {
		return parseInt(v, 16);
	});
};

//Converts an array with bytes into a hex string
Convert.arrayToHex = function (array) {
	var hex = "";

	if (array instanceof ArrayBuffer) {
		return Convert.arrayToHex(new Uint8Array(array));
	}
	for (var i = 0; i < array.length; i++) {
		hex += ("0" + array[i].toString(16)).substr(-2);
	}
	return hex;
};

//Converts an unsigned 32 bit integer into a hexadecimal string. Padding is added as needed
Convert.int32toHex = function (i) {
	return ("00000000" + Math.floor(Math.abs(i)).toString(16)).substr(-8);
};



//<!-- TOTP functions -->
//"use strict";

//TOTP implementation
var TOTP = {
	//Calculates the TOTP counter for a given point in time
	//time(number):      Time value (in seconds) to use. Usually the current time (Date.now()/1000)
	//interval(number):  Interval in seconds at which the key changes (usually 30).
	getOtpCounter: function (time, interval) {
		return (time / interval) | 0;
	},

	//Calculates the current counter for TOTP
	//interval(number): Interval in seconds at which the key changes (usually 30).
	getCurrentCounter: function (interval) {
		return TOTP.getOtpCounter(Date.now() / 1000 | 0, interval);
	},

	//Calculates a HOTP value
	//keyHex(string):      Secret key as hex string
	//counterInt(number):  Counter for the OTP. Use TOTP.getOtpCounter() to use this as TOTP instead of HOTP
	//size(number):        Number of digits (usually 6)
	//cb(function):        Callback(string)
	otp: function (keyHex, counterInt, size, cb) {
		var isInt = function (x) {
			return x === x | 0;
		};
		if (typeof(keyHex) !== typeof("")) {
			throw new Error("Invalid hex key");
		}
		if (typeof(counterInt) !== typeof(0) || !isInt(counterInt)) {
			throw new Error("Invalid counter value");
		}
		if (typeof(size) !== typeof(0) || (size < 6 || size > 10 || !isInt(size))) {
			throw new Error("Invalid size value (default is 6)");
		}

		//Calculate hmac from key and counter
		TOTP.hmac(keyHex, "00000000" + Convert.int32toHex(counterInt), function (mac) {
			//The last 4 bits determine the offset of the counter
			var offset = parseInt(mac.substr(-1), 16);
			//Extract counter as a 32 bit number anddiscard possible sign bit
			var code = parseInt(mac.substr(offset * 2, 8), 16) & 0x7FFFFFFF;
			//Trim and pad as needed
			(cb || console.log)(("0000000000" + (code % Math.pow(10, size))).substr(-size));
		});
	},
	//Calculates a SHA-1 hmac
	//keyHex(string):   Key for hmac as hex string
	//valueHex(string): Value to hash as hex string
	//cb(function):     Callback(string)
	hmac: function (keyHex, valueHex, cb) {
		var algo = {
			name: "HMAC",
			//SHA-1 is the standard for TOTP and HOTP
			hash: "SHA-1"
		};
		var modes = ["sign", "verify"];
		var key = Uint8Array.from(Convert.hexToArray(keyHex));
		var value = Uint8Array.from(Convert.hexToArray(valueHex));
		crypto.subtle.importKey("raw", key, algo, false, modes).then(function (cryptoKey) {
			console.debug("Key imported", keyHex);
			crypto.subtle.sign(algo, cryptoKey, value).then(function (v) {
				console.debug("HMAC calculated", value, Convert.arrayToHex(v));
				(cb || console.log)(Convert.arrayToHex(v));
			});
		});
	}
}


// thème color 
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.style.backgroundColor = "#333"
    document.body.style.color = "#fff"
} else {
    document.body.style.backgroundColor = "#FFF"
    document.body.style.color = "#333"
}

function setdata(key, name, data) {
    var obj = {[key]: {
        'key':key, 
        'name': name,
        'data' :data
    }};
    chrome.storage.sync.set(obj, function() {
        console.log('Données stockées avec succès !');
    });
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
        setdata(
            String(myData.length),
            document.getElementById("input_add_name").value,
            document.getElementById("input_add_key").value
        )
    })
    location.reload()
    
}

function getData(callback) {
    chrome.storage.sync.get(function(data) {
        var dataArray = Object.values(data)
        console.log(dataArray)
        callback(dataArray)
    })
}

getData(function(myData) {
    console.log(myData)

    const all_cards = document.getElementById("all_cards")

    for(i = 0; i < myData.length; i++){

        console.log(myData[i].key);
        console.log(myData[i].name);
        console.log(myData[i].data); 

        const card = document.createElement("div");
        card.id = "card"+i;
        card.classList.add("card");

        const name = document.createElement("p");
        name.id = "name"+i;
        name.classList.add("name");
        name.textContent = myData[i].name
        card.appendChild(name);

        const code = document.createElement("p");

        var secret = Convert.base32toHex(myData[i].data);
        var current = TOTP.getCurrentCounter(30)
        var length = 6

        code.id = "code"+i;
        code.classList.add("code");
        TOTP.otp(secret, current, length, function (codetotp) {
            console.log(codetotp)
            code.textContent = codetotp
        })
        
        card.appendChild(code);



    

        const key = document.createElement("p");
        key.id = "key"+i;
        key.classList.add("key");
        key.textContent = myData[i].data;
        card.appendChild(key);

        const del = document.createElement("button");
        del.id = "del"+i;
        del.classList.add("del");
        del.textContent = "Supprimer";
        del.setAttribute("data-valeur", myData[i].key);

        card.appendChild(del);


        // Ajout de l'enfant à la div parent
        all_cards.appendChild(card);

        const copydiv = document.getElementById(card.id);
        copydiv.onclick = function() {
            console.log(card.id)
            
            const textToCopy = document.getElementById(code.id).innerText;
            navigator.clipboard.writeText(textToCopy)
            console.log("Copy:",code.id)
        }
    }

})



document.addEventListener('DOMContentLoaded', function() {
    const boutons = document.querySelectorAll(".del");
    // Ajouter un écouteur d'événement "click" à chaque bouton
    boutons.forEach(bouton => {
        bouton.addEventListener("click", (event) => {
            const valeur = event.target.getAttribute("data-valeur");
            deletdata(String(valeur))
            console.log(String(valeur))
            location.reload()
        });
    });
});


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