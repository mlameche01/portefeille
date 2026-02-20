// === CONFIG ===
const TOKEN_ADDRESS = "0x07221c2D1dc1D5485Bf069871E2820864B4948F7";
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

// RPC Thirdweb compatible CORS
const RPC_URL = "https://rpc.thirdweb.com/polygon";

let provider = new ethers.JsonRpcProvider(RPC_URL);
let wallet;
let tokenContract;

// --- AUTHENTIFICATION PIN ---
document.getElementById("login").addEventListener("click", async () => {
    const pin = document.getElementById("pin").value;
    const msg = document.getElementById("authMsg");

    if(pin.length < 4){
        msg.textContent = "PIN trop court ❌";
        return;
    }

    try{
        // récupération clé privée
        let stored = localStorage.getItem("dz_private");
        if(!stored){
            wallet = ethers.Wallet.createRandom();
            localStorage.setItem("dz_private", wallet.privateKey);
        } else {
            wallet = new ethers.Wallet(stored);
        }

        wallet = wallet.connect(provider);
        tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

        document.getElementById("address").textContent = wallet.address;
        document.getElementById("auth").classList.add("hidden");
        document.getElementById("wallet").classList.remove("hidden");

        await updateBalance();

    } catch(err){
        console.error("Erreur RPC :", err);
        msg.textContent = "Erreur RPC ❌";
    }
});

// --- BALANCE ---
async function updateBalance(){
    try{
        const decimals = await tokenContract.decimals();
        const balance = await tokenContract.balanceOf(wallet.address);
        const formatted = ethers.formatUnits(balance, decimals);
        document.getElementById("balance").textContent = formatted + " DZ";
        console.log("Balance :", formatted);
    } catch(err){
        console.error("Erreur RPC :", err);
        document.getElementById("balance").textContent = "Erreur RPC ❌";
    }
}

// --- ENVOYER TOKEN ---
document.getElementById("sendBtn").addEventListener("click", async ()=>{
    const to = document.getElementById("recipient").value;
    const amount = document.getElementById("amount").value;
    const msg = document.getElementById("txMsg");

    if(!to || !amount){
        msg.textContent = "Champs invalides ❌";
        return;
    }

    try{
        const decimals = await tokenContract.decimals();
        const parsed = ethers.parseUnits(amount, decimals);

        msg.textContent = "Transaction en cours...";
        const tx = await tokenContract.transfer(to, parsed);
        await tx.wait();

        msg.textContent = "Confirmée ✔️";
        await updateBalance();
    } catch(err){
        console.error(err);
        msg.textContent = "Erreur transaction ❌";
    }
});

// --- LOCK WALLET ---
document.getElementById("logout").addEventListener("click", ()=>{
    document.getElementById("wallet").classList.add("hidden");
    document.getElementById("auth").classList.remove("hidden");
});
