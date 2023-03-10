// Autorisation pour accéder au stockage synchrone

function generateTOTPCode(secret) {
    const time = Math.floor((Date.now() + 1000) / 30000);
    const timeBuffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
      timeBuffer.writeUInt8(time >> i * 8 & 0xff, i);
    }
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base32'));
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const code = ((hmacResult[offset] & 0x7f) << 24
        | (hmacResult[offset + 1] & 0xff) << 16
        | (hmacResult[offset + 2] & 0xff) << 8
        | (hmacResult[offset + 3] & 0xff)) % 1000000;
    return code.toString().padStart(6, '0');

}
const key = 'YDP72P3MMMM74GD527TVZ3WEWLZU37FH';
totp = generateTOTPCode(key);
console.log(totp)

const element = document.getElementById('jsresultat');

element.textContent = totp;


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

