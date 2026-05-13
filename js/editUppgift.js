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

// Fyller i formuläret med data från ett uppgiftsobjekt
function fyllFormularMedData(post) {
    const idag = new Date().toISOString().split("T")[0];
    document.getElementById("uppgift-datum").max = idag;

    document.getElementById("form-titel").textContent    = "Redigera uppgift";
    document.getElementById("visa-id").textContent       = `ID: ${post.id}`;
    document.getElementById("uppgift-aktivitet").value   = post.activityId  ?? post.aktivitetId;
    document.getElementById("uppgift-datum").value       = post.date        ?? post.datum;
    document.getElementById("uppgift-tid").value         = post.time        ?? post.tid;
    document.getElementById("uppgift-beskrivning").value = post.description ?? post.beskrivning;
}

// Hämtar uppgift — först localStorage, sedan API
async function fillForm(id) {
    // Försök localStorage först
    let u = hamtaUppgifter().find(u => u.id === id);
    if (u) {
        fyllFormularMedData(u);
        return;
    }

    // Inte i localStorage — hämta från API
    try {
        let response = await fetch(`api/task/${id}`);

        if (response.ok) {
            let post = await response.json();

            document.getElementById("labelId").style.display = "initial";
            document.getElementById("valueId").innerText     = post.id;
            document.getElementById("inputDatum").value      = post.date;
            document.getElementById("inputVaraktighet").value = post.time;
            document.getElementById("inputBeskrivning").value = post.description;
            document.getElementById("inputAktivitet").value  = post.activityId;

        } else {
            let message = null;
            try {
                message = await response.json();
            } finally {
                let fel = {
                    status:  response.status,
                    text:    response.statusText,
                    url:     response.url,
                    message
                };
                throw fel;
            }
        }
    } catch (e) {
        if (e.status !== undefined) throw e;
        console.error("Kunde inte hämta uppgift:", e);
        alert("Uppgiften hittades inte.");
        emptyForm();
    }
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