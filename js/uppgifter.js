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


// Hämtar poster baserat på sidnummer (desktop eller mobil)
function hamtaSida(mobilEl = false) {
    const sidnr = mobilEl
        ? document.getElementById("sidnr-mobil").value
        : document.getElementById("sidnr").value;

    fetch(`api/tasklist/${sidnr}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }

            // response är inte ok...
            return response.json()
                .catch(() => null) // Är svaret inte json händer inget
                .then((message) => {
                    let fel = {
                        status:  response.status,
                        text:    response.statusText,
                        url:     response.url,
                        message
                    };
                    throw fel;
                });
        })
        .then((data) => {
            const lista = data.tasks.map(t => ({
                id:          t.id,
                aktivitetId: t.aktivitetId ?? null,
                aktivitet:   t.aktivitet ?? t.activity ?? "",
                datum:       t.datum ?? t.date ?? "",
                tid:         t.tid ?? t.time ?? "",
                beskrivning: t.beskrivning ?? t.description ?? ""
            }));

            sparaUppgifter(lista);
            fyllLista();
        })
        .catch((fel) => {
            console.error("Fel vid hämtning av sida:", fel);
        });
}


// Bygger upp listan med uppgifter på sidan
function fyllLista() {
    const uppgifter   = hamtaUppgifter();
    const aktiviteter = hamtaAktiviteter();

    const targets = document.querySelectorAll(".item-list, .item-list-mobil");
    if (targets.length === 0) return;

    targets.forEach(target => {
        target.innerHTML = "";
        const isMobile = target.classList.contains("item-list-mobil");

        // Rubrikrad bara på desktop
        if (!isMobile) {
            const rubrik = document.createElement("ul");
            rubrik.className = "lista heading";
            rubrik.innerHTML = `
                <li style="width:15%;">DATUM</li>
                <li style="width:10%;">TID</li>
                <li style="width:25%;">AKTIVITET</li>
                <li style="width:30%;">BESKRIVNING</li>
                <li style="width:20%;"></li>
            `;
            target.appendChild(rubrik);
        }

        // Loopar igenom varje uppgift och skapar en rad
        uppgifter.forEach(u => {
            const aktNamn = aktiviteter.find(a => a.id === u.aktivitetId)?.namn
                || u.aktivitet || "–";

            if (isMobile) {
                const card = document.createElement("div");
                card.className = "task-card-mobile";
                card.innerHTML = `
                    <div class="task-info">
                        <div class="task-row"><strong>${u.datum}</strong> <span>${u.tid}</span></div>
                        <div class="task-main"><strong>${aktNamn}</strong></div>
                        <div class="task-desc">${u.beskrivning}</div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-outline" onclick="redigeraUppgift(${u.id})">Redigera</button>
                        <button class="btn-outline btn-delete" onclick="raderaUppgift(${u.id})">Radera</button>
                    </div>
                `;
                target.appendChild(card);
            } else {
                const rad = document.createElement("ul");
                rad.className = "lista";
                rad.innerHTML = `
                    <li style="width:15%;">${u.datum}</li>
                    <li style="width:10%;">${u.tid}</li>
                    <li style="width:25%;">${aktNamn}</li>
                    <li style="width:30%;">${u.beskrivning}</li>
                    <li class="right" style="width:20%;">
                        <div class="action-buttons">
                            <button class="btn-outline" onclick="redigeraUppgift(${u.id})">Redigera</button>
                            <button class="btn-outline btn-delete" onclick="raderaUppgift(${u.id})">Radera</button>
                        </div>
                    </li>
                `;
                target.appendChild(rad);
            }
        });
    });
}


// Sätter datumfältet till första och sista dagen i aktuell månad
function setDateInterval() {
    const idag = new Date();
    const ar = idag.getFullYear();
    const manad = idag.getMonth();

    const fran = new Date(ar, manad, 1, 24).toISOString().substring(0, 10);
    const till = new Date(ar, manad + 1, 0, 24).toISOString().substring(0, 10);

    // Desktop
    const franFalt = document.getElementById("franDatum");
    const tillFalt = document.getElementById("tillDatum");
    if (franFalt) franFalt.value = fran;
    if (tillFalt) tillFalt.value = till;

    // Mobil
    const franMobil = document.getElementById("franDatum-mobil");
    const tillMobil = document.getElementById("tillDatum-mobil");
    if (franMobil) franMobil.value = fran;
    if (tillMobil) tillMobil.value = till;
}


// Navigerar till redigeringssidan med valt id
function redigeraUppgift(id) {
    window.location.href = `editUppgift.html?id=${id}`;
}


// Raderar en uppgift efter bekräftelse
function raderaUppgift(id) {
    if (!confirm("Radera uppgiften?")) return;
    const lista = hamtaUppgifter().filter(u => u.id !== id);
    sparaUppgifter(lista);
    fyllLista();
}


function aktiveraAlternativ(ev) {
    try {
        if (ev.target.value === "sida") {
            document.getElementById("sidnr").disabled = false;
            document.getElementById("hamtaSida").disabled = false;
            document.getElementById("franDatum").disabled = true;
            document.getElementById("tillDatum").disabled = true;
            document.getElementById("hamta").disabled = true;
        } else {
            document.getElementById("franDatum").disabled = false;
            document.getElementById("tillDatum").disabled = false;
            document.getElementById("hamta").disabled = false;
            document.getElementById("sidnr").disabled = true;
            document.getElementById("hamtaSida").disabled = true;
        }
    } catch (error) {
        console.error(error);
        document.getElementById("franDatum").disabled = false;
        document.getElementById("tillDatum").disabled = false;
        document.getElementById("hamta").disabled = false;
        document.getElementById("sidnr").disabled = true;
        document.getElementById("hamtaSida").disabled = true;
    }
}


// Startar sidan
document.addEventListener("DOMContentLoaded", () => {
    setDateInterval();
    fyllLista();

    // Desktop-knapp
    document.getElementById("hamtaSida")?.addEventListener("click", () => hamtaSida(false));

    // Mobil-knapp
    document.getElementById("hamtaSida-mobil")?.addEventListener("click", () => hamtaSida(true));
});