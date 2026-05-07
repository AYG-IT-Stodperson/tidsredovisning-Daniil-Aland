// Hämtar aktiviteter från localStorage
function hamtaAktiviteter() {
    return JSON.parse(localStorage.getItem("aktiviteter") || "[]");
}


// Sparar aktiviteter till localStorage
function sparaAktiviteter(lista) {
    localStorage.setItem("aktiviteter", JSON.stringify(lista));
}


// Läser id från URL:en ex: ?id=3
function hamtaIdFranURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id !== null ? parseInt(id) : null;
}


document.addEventListener("DOMContentLoaded", () => {
    const id = hamtaIdFranURL();


    // Om id finns i URL:en, fyll i formuläret med befintlig data
    if (id !== null) {
        const a = hamtaAktiviteter().find(a => a.id === id);
        if (a) {
            document.getElementById("form-titel").textContent = "Redigera aktivitet";
            document.getElementById("visa-id").textContent    = `ID: ${a.id}`;
            document.getElementById("aktivitet-namn").value   = a.namn;
        }
    }


    // Lyssnar på spara-knappen
    document.getElementById("spara-btn").addEventListener("click", () => {
        const namn = document.getElementById("aktivitet-namn").value.trim();
        if (!namn) { alert("Ange ett namn."); return; }

        const lista = hamtaAktiviteter();


        if (id === null) {


            // Ny aktivitet - generera nytt id
            const nyttId = lista.length > 0 ? Math.max(...lista.map(a => a.id)) + 1 : 1;
            lista.push({ id: nyttId, namn });
        } else {

            // Uppdatera befintlig aktivitet
            const index = lista.findIndex(a => a.id === id);
            if (index !== -1) lista[index].namn = namn;
        }



        sparaAktiviteter(lista);
        window.location.href = "aktiviteter.html";
    });
});