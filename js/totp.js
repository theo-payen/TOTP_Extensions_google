
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
	},
	//Checks if this browser is compatible with the TOTP implementation
	isCompatible: function () {
		var f = function (x) {
			return typeof(x) === typeof(f);
		};
		if (typeof(crypto) === typeof(TOTP) && typeof(Uint8Array) === typeof(f)) {
			return !!(crypto.subtle && f(crypto.subtle.importKey) && f(crypto.subtle.sign) && f(crypto.subtle.digest));
		}
		return false;
	}
}
//Make sure the conversion script is loaded first
if (typeof(Convert) !== typeof(TOTP)) {
	TOTP = null;
	alert("Data conversion module not loaded");
	throw new Error("Data conversion module not loaded");
}





//<!-- Site specific JavaScript -->
//"use strict";
window.addEventListener("load", function () {
    //Because typing costs time and time is money (and money is life)
    var q = document.querySelector.bind(document);
    var qa = document.querySelectorAll.bind(document);

    //List of valid TOTP Secret code patterns
    var pattern = {
        //Base32 Code
        "1": {
            regex: "[A-Za-z2-7]+=*",
            title: "Secret should be Base32 encoded (using only a-z and 2-7)"
        },
        //Raw Hex Code
        "2": {
            regex: "([A-Fa-f0-9]{2})*",
            title: "Hexadecimal only (0-9 and a-f, even number of characters)"
        }
    };

    //Math.range
    var range = function (min, x, max) {
        return Math.max(Math.min(x | 0, max), min) | 0;
    };

    //Button to generate code
    var btn = q("[type=button]");
    //TOTP Secret
    var txt = q("#token");
    //Number of TOTP digits
    var num = q("[type=number]");
    //Secret Code type
    var sel = q("select");

    //Validate a form element
    var validate = function (x) {
        return !x.reportValidity || x.reportValidity();
    };

    //Updates the URL to the current values
    var setHash = function (code, mode, digits) {
        location.hash = "#" + JSON.stringify({
                c: code,
                m: mode,
                d: digits
            });
    };

    //Fills in values from the URL
    var getHash = function () {
        if (location.hash.length > 1) {
            try {
                var data = JSON.parse(decodeURIComponent(location.hash.substr(1)));
                txt.value = data.c;
                if (pattern[data.m]) {
                    sel.value = data.m;
                }
                num.value = range(6, data.d | 0, 8);
            } catch (e) {
                console.warn(e, "Invalid JSON in URL:", location.hash.substr(1));
                return false;
            }
            setPattern();
            return true;
        }
        setPattern();
        return false;
    };

    //Checks and processes the form
    var checkForm = function () {
        //IE11 and older has no reportValidity support
        if (validate(txt) && validate(num) && validate(sel)) {
            var length = range(6, +num.value, 8);
            var interval = 30;
            var secret = txt.value;
            var current = TOTP.getCurrentCounter(30);
            if (sel.value === "1") {
                try {
                    secret = Convert.base32toHex(secret);
                } catch (e) {
                    alert("Invalid Base32 characters");
                    return;
                }
            }
            try {
                console.debug("Getting TOTP for", secret);
                TOTP.otp(secret, current, length, function (code) {
                    q("#codetotp").textContent = code;

                });
                setHash(txt.value, +sel.value, length);

            } catch (e) {
                console.error(e);
                alert("Problem decoding Secret.\nVerify your secret and type are correct.\nMessage from decoder: " + e.message);
            };
        }
    };

    if (TOTP.isCompatible()) {
        //Generate and display secret code
        btn.addEventListener("click", checkForm);
    } else {
        //Incompatible browser
        alert("Your browser is outdated and lacks missing components for this implementation. Please update your browser");
        q(".container").innerHTML = "<h1 class=\"alert alert-danger\">" +
            "Outdated browser, try to live in the year" + (new Date()).getFullYear() +
            "</h1>";
    }
    //Set the pattern for the secret code textbox
    var setPattern = function () {
        if (pattern[sel.value]) {
            txt.setAttribute("pattern", pattern[sel.value].regex);
            txt.setAttribute("title", pattern[sel.value].title);
        } else {
            alert("attempted to select invalid Pattern. The website will reset now");
            location.reload(true);
        }
    };
    //Hook up setPattern event
    sel.addEventListener("change", setPattern);

    //Show warning if not running on file system
    var isOnline = (location.protocol.indexOf("file:") !== 0);
    var eleOnline = qa(".online-only");
    var eleOffline = qa(".offline-only");
    for (var i = 0; i < eleOffline.length; i++) {
        eleOffline[i].style.display = isOnline ? "none" : "block";
    }
    for (var i = 0; i < eleOnline.length; i++) {
        eleOnline[i].style.display = isOnline ? "block" : "none";
    }

    //Link that opens the help box at the bottom and hides itself
    q("#openHelp").addEventListener("click", function (e) {
        e.preventDefault();
        q("#help").style.display = "block";
        q("#helpContainer").style.display = "none";
    });

    //Set initial data and pattern
    if (getHash()) {
        checkForm();
    }

    Array.prototype.slice.call(qa("input,select"), 0).forEach(function (v) {
        v.addEventListener("keydown", function (e) {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                e.stopPropagation();
                checkForm();
            }
        });
    });
});