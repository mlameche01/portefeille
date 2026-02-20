let wallet;

document.getElementById("login").addEventListener("click", async () => {

    const pin = document.getElementById("pin").value;
    const msg = document.getElementById("msg");

    if (pin.length < 4) {
        msg.textContent = "PIN trop court ❌";
        return;
    }

    try {

        const stored = localStorage.getItem("dz_private");

        if (!stored) {
            wallet = ethers.Wallet.createRandom();
            localStorage.setItem("dz_private", wallet.privateKey);
        } else {
            wallet = new ethers.Wallet(stored);
        }

        document.getElementById("address").textContent = wallet.address;
        document.getElementById("auth").classList.add("hidden");
        document.getElementById("wallet").classList.remove("hidden");

    } catch (err) {
        console.error(err);
        msg.textContent = "Erreur ❌";
    }

});

document.getElementById("logout").addEventListener("click", () => {
    document.getElementById("wallet").classList.add("hidden");
    document.getElementById("auth").classList.remove("hidden");
});
