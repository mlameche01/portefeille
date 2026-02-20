const TOKEN_ADDRESS = "0x07221c2D1dc1D5485Bf069871E2820864B4948F7";
const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

const RPC_URL = "https://polygon-rpc.com";
let provider = new ethers.JsonRpcProvider(RPC_URL);

let wallet;
let tokenContract;

async function hashPin(pin) {
  const data = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// AUTH
document.getElementById("unlockBtn").onclick = async () => {

  const pin = document.getElementById("pin").value;
  const hashed = await hashPin(pin);

  let stored = localStorage.getItem("dz_wallet");

  if (!stored) {
    // create new wallet
    wallet = ethers.Wallet.createRandom();
    const encrypted = await wallet.encrypt(pin);
    localStorage.setItem("dz_wallet", encrypted);
    localStorage.setItem("dz_pin", hashed);
  } else {
    if (hashed !== localStorage.getItem("dz_pin")) {
      document.getElementById("authMsg").textContent = "PIN incorrect ❌";
      return;
    }
    wallet = await ethers.Wallet.fromEncryptedJson(stored, pin);
  }

  wallet = wallet.connect(provider);
  tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, wallet);

  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("walletScreen").classList.remove("hidden");

  document.getElementById("address").textContent = wallet.address;

  updateBalance();
};

// BALANCE
async function updateBalance() {
  const decimals = await tokenContract.decimals();
  const balance = await tokenContract.balanceOf(wallet.address);
  const formatted = ethers.formatUnits(balance, decimals);
  document.getElementById("balance").textContent = formatted + " DZ";
}

// SEND TOKEN
document.getElementById("sendBtn").onclick = async () => {

  const to = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;

  try {
    const decimals = await tokenContract.decimals();
    const parsed = ethers.parseUnits(amount, decimals);

    const tx = await tokenContract.transfer(to, parsed);
    document.getElementById("txMsg").textContent = "Transaction envoyée...";
    await tx.wait();

    document.getElementById("txMsg").textContent = "Confirmée ✔️";
    updateBalance();

  } catch (err) {
    document.getElementById("txMsg").textContent = "Erreur ❌";
  }
};

// LOCK
document.getElementById("lockBtn").onclick = () => {
  document.getElementById("walletScreen").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
};
