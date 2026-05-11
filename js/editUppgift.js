// Hämtar uppgifter från localStorage
function hamtaUppgifter() {
    return JSON.parse(localStorage.getItem("uppgifter") || "[]");
}

// Sparar uppgifter till localStorage
function sparaUppgifter(lista) {
    localStorage.setItem("uppgifter", JSON.stringify(lista));
}

// Hämtar aktiviteter från localStorage
function hamtaAktiviteter() {
    return JSON.parse(localStorage.getItem("aktiviteter") || "[]");
}

// Läser id från URL:en ex: ?id=3
function hamtaIdFranURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id !== null ? parseInt(id) : null;
}

// Fyller aktivitets-dropdown med data från localStorage
function fyllAktivitetsval() {
    const aktiviteter = hamtaAktiviteter();
    const select = document.getElementById("uppgift-aktivitet");
    select.innerHTML = aktiviteter.map(a =>
        `<option value="${a.id}">${a.namn}</option>`
    ).join("");
}

// Validerar formuläret innan sparning
function valideraFormular() {
    let valid = true;

    const datum = document.getElementById("uppgift-datum").value;
    const tid   = document.getElementById("uppgift-tid").value;
    const akt   = document.getElementById("uppgift-aktivitet");

    // Inte i framtiden
    if (datum > new Date().toISOString().substring(0, 10)) {
        alert("Datum kan inte vara i framtiden.");
        valid = false;
    }

    // Max 8 timmar
    if (tid > "08:00") {
        alert("Max 8 timmar per uppgift.");
        valid = false;
    }

    // Min 15 minuter
    if (tid < "00:15") {
        alert("Minst 15 minuter per uppgift.");
        valid = false;
    }

    // Endast 15-minutersintervall
    if (!["00", "15", "30", "45"].includes(tid.substring(3, 5))) {
        alert("Tid måste anges i 15-minutersintervall.");
        valid = false;
    }

    // Aktivitet måste vara vald
    if (akt.selectedIndex < 0) {
        alert("Välj en aktivitet.");
        valid = false;
    }

    return valid;
}

// Fyller formuläret - hämtar från localStorage, annars från JSON
async function fillForm(id) {
    let u = hamtaUppgifter().find(u => u.id === id);

    // Om inte i localStorage, hämta från JSON
    if (!u) {
        try {
            const response = await fetch("dummy/uppgifter.json");
            if (response.ok) {
                const data = await response.json();
                const post = data.tasks.find(t => t.id == id);
                if (post) {
                    u = {
                        id:          post.id,
                        aktivitetId: post.aktivitetId ?? null,
                        datum:       post.datum ?? post.date ?? "",
                        tid:         post.tid ?? post.time ?? "",
                        beskrivning: post.beskrivning ?? post.description ?? ""
                    };
                }
            } else {
                const message = await response.json().catch(() => null);
                throw { status: response.status, text: response.statusText, url: response.url, message };
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (!u) {
        alert("Uppgiften hittades inte");
        emptyForm();
        return;
    }

    // Sätt max till dagens datum
    const idag = new Date().toISOString().split("T")[0];
    document.getElementById("uppgift-datum").max = idag;

    // Fyll i formuläret
    document.getElementById("form-titel").textContent    = "Redigera uppgift";
    document.getElementById("visa-id").textContent       = `ID: ${u.id}`;
    document.getElementById("uppgift-aktivitet").value   = u.aktivitetId;
    document.getElementById("uppgift-datum").value       = u.datum;
    document.getElementById("uppgift-tid").value         = u.tid;
    document.getElementById("uppgift-beskrivning").value = u.beskrivning;
}

// Tomt formulär för ny uppgift - fyller i dagens datum
function emptyForm() {
    const idag = new Date().toISOString().split("T")[0];
    document.getElementById("uppgift-datum").value = idag;
    document.getElementById("uppgift-datum").max   = idag;
}

document.addEventListener("DOMContentLoaded", () => {
    fyllAktivitetsval();

    const id = hamtaIdFranURL();

    // Redigera befintlig eller ny uppgift
    if (id !== null) {
        fillForm(id);
    } else {
        emptyForm();
    }

    // Lyssnar på spara-knappen
    document.getElementById("spara-btn").addEventListener("click", () => {
        if (!valideraFormular()) return;

        const aktivitetId = parseInt(document.getElementById("uppgift-aktivitet").value);
        const datum       = document.getElementById("uppgift-datum").value;
        const tid         = document.getElementById("uppgift-tid").value;
        const beskrivning = document.getElementById("uppgift-beskrivning").value.trim();

        const lista = hamtaUppgifter();

        if (id === null) {
            // Ny uppgift - generera nytt id
            const nyttId = lista.length > 0 ? Math.max(...lista.map(u => u.id)) + 1 : 1;
            lista.push({ id: nyttId, aktivitetId, datum, tid, beskrivning });
        } else {
            // Uppdatera befintlig uppgift
            const index = lista.findIndex(u => u.id === id);
            if (index !== -1) lista[index] = { ...lista[index], aktivitetId, datum, tid, beskrivning };
        }

        sparaUppgifter(lista);
        window.location.href = "uppgifter.html";
    });
});