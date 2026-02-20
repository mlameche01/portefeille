const TOKEN_ADDRESS = "0x07221c2D1dc1D5485Bf069871E2820864B4948F7";
const RPC_URL = "https://polygon-rpc.com";

let provider = new ethers.JsonRpcProvider(RPC_URL);
let wallet;

async function hashPin(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

document.getElementById("unlockBtn").addEventListener("click", async () => {

    const pin = document.getElementById("pin").value;
    const msg = document.getElementById("authMsg");

    if (!pin || pin.length < 4) {
        msg.textContent = "PIN minimum 4 chiffres ❌";
        return;
    }

    try {

        const hashed = await hashPin(pin);
        const storedWallet = localStorage.getItem("dz_wallet");
        const storedPin = localStorage.getItem("dz_pin");

        if (!storedWallet) {

            wallet = ethers.Wallet.createRandom();
            const encrypted = await wallet.encrypt(pin);

            localStorage.setItem("dz_wallet", encrypted);
            localStorage.setItem("dz_pin", hashed);

        } else {

            if (hashed !== storedPin) {
                msg.textContent = "PIN incorrect ❌";
                return;
            }

            wallet = await ethers.Wallet.fromEncryptedJson(storedWallet, pin);
        }

        wallet = wallet.connect(provider);

        document.getElementById("address").textContent = wallet.address;
        document.getElementById("authScreen").classList.add("hidden");
        document.getElementById("walletScreen").classList.remove("hidden");

    } catch (err) {
        console.error(err);
        msg.textContent = "Erreur wallet ❌";
    }
});
