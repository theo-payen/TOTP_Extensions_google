// Autorisation pour accéder au stockage synchrone

function generateTOTPCode(secret) {
    const currentUnixTime = Math.floor(Date.now() / 1000);
    const totpValidity = 30;
    const timeWindowIndex = Math.floor(currentUnixTime / totpValidity);
    const keyBytes = base32.decode(secret);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(timeWindowIndex), 0);
    const hmac = crypto.createHmac('sha1', keyBytes);
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();
    const offset = hmacResult[19] & 0xf;
    const code = (
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff)
    );
    const normalizedCode = code % 1000000;
    return normalizedCode.toString().padStart(6, '0');
}
code = generateTOTPCode()
console.log(code)
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

