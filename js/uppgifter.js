// ─── HJÄLPFUNKTIONER ──────────────────────────────────────────

function hamtaUppgifter() {
    return JSON.parse(localStorage.getItem("uppgifter") || "[]");
}

function sparaUppgifter(lista) {
    localStorage.setItem("uppgifter", JSON.stringify(lista));
}

function hamtaAktiviteter() {
    return JSON.parse(localStorage.getItem("aktiviteter") || "[]");
}

function hamtaIdFranURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id !== null ? parseInt(id) : null;
}



async function laddaFranJSONomTomt() {
    if (hamtaUppgifter().length > 0) return;

    try {
        const response = await fetch("dummy/uppgifter.json");
        if (!response.ok) return;
        const data = await response.json();

        const lista = data.tasks.map(t => ({
            id: t.id,
            aktivitetId: t.aktivitetId ?? null,
            aktivitet: t.aktivitet ?? t.activity ?? "",
            datum: t.datum ?? t.date ?? "",
            tid: t.tid ?? t.time ?? "",
            beskrivning: t.beskrivning ?? t.description ?? ""
        }));

        sparaUppgifter(lista);
    } catch (e) {
        console.error("Kunde inte ladda uppgifter.json:", e);
    }
}



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

        uppgifter.forEach(u => {
            const aktNamn = aktiviteter.find(a => a.id === u.aktivitetId)?.namn
                || u.aktivitet
                || "–";

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

function redigeraUppgift(id) {
    window.location.href = `editUppgift.html?id=${id}`;
}

function raderaUppgift(id) {
    if (!confirm("Radera uppgiften?")) return;
    const lista = hamtaUppgifter().filter(u => u.id !== id);
    sparaUppgifter(lista);
    fyllLista();
}



function fyllAktivitetsval() {
    const aktiviteter = hamtaAktiviteter();
    const options = aktiviteter.map(a =>
        `<option value="${a.id}">${a.namn}</option>`
    ).join("");

    const desk = document.getElementById("uppgift-aktivitet");
    const mob  = document.getElementById("mob-uppgift-aktivitet");
    if (desk) desk.innerHTML = options;
    if (mob)  mob.innerHTML  = options;
}

function fyllFormularMedUppgift(id) {
    const u = hamtaUppgifter().find(u => u.id === id);
    if (!u) return;

    const get = (deskId, mobId) =>
        document.getElementById(deskId) || document.getElementById(mobId);

    const titD = document.getElementById("form-titel");
    const titM = document.getElementById("mob-form-titel");
    if (titD) titD.textContent = "Redigera uppgift";
    if (titM) titM.textContent = "Redigera uppgift";

    const akt  = get("uppgift-aktivitet",   "mob-uppgift-aktivitet");
    const dat  = get("uppgift-datum",        "mob-uppgift-datum");
    const tid  = get("uppgift-tid",          "mob-uppgift-tid");
    const besk = get("uppgift-beskrivning",  "mob-uppgift-beskrivning");

    if (akt)  akt.value  = u.aktivitetId;
    if (dat)  dat.value  = u.datum;
    if (tid)  tid.value  = u.tid;
    if (besk) besk.value = u.beskrivning;
}

function sparaFormular() {
    const id = hamtaIdFranURL();

    const get = (deskId, mobId) =>
        (document.getElementById(deskId) || document.getElementById(mobId))?.value?.trim();

    const aktivitetId = parseInt(
        (document.getElementById("uppgift-aktivitet") ||
            document.getElementById("mob-uppgift-aktivitet"))?.value
    );
    const datum       = get("uppgift-datum",       "mob-uppgift-datum");
    const tid         = get("uppgift-tid",          "mob-uppgift-tid");
    const beskrivning = get("uppgift-beskrivning",  "mob-uppgift-beskrivning");

    if (!datum || !tid) {
        alert("Fyll i datum och tid.");
        return;
    }

    const lista = hamtaUppgifter();

    if (id === null) {

        const nyttId = lista.length > 0 ? Math.max(...lista.map(u => u.id)) + 1 : 1;
        lista.push({ id: nyttId, aktivitetId, datum, tid, beskrivning });
    } else {

        const index = lista.findIndex(u => u.id === id);
        if (index !== -1) {
            lista[index] = { ...lista[index], aktivitetId, datum, tid, beskrivning };
        }
    }

    sparaUppgifter(lista);
    window.location.href = "uppgifter.html";
}



document.addEventListener("DOMContentLoaded", async () => {
    const paListSidan = document.querySelector(".item-list, .item-list-mobil");
    const paEditSidan = document.getElementById("spara-btn") ||
        document.getElementById("mob-spara-btn");

    if (paListSidan) {
        await laddaFranJSONomTomt();
        fyllLista();
    }

    if (paEditSidan) {
        fyllAktivitetsval();

        const id = hamtaIdFranURL();
        if (id !== null) {
            fyllFormularMedUppgift(id);
        }

        document.getElementById("spara-btn")?.addEventListener("click", sparaFormular);
        document.getElementById("mob-spara-btn")?.addEventListener("click", sparaFormular);
    }
});