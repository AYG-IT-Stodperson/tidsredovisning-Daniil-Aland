// ─── HJÄLPFUNKTIONER ──────────────────────────────────────────

function hamtaAktiviteter() {
    return JSON.parse(localStorage.getItem("aktiviteter") || "[]");
}

function sparaAktiviteter(lista) {
    localStorage.setItem("aktiviteter", JSON.stringify(lista));
}

function hamtaIdFranURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    return id !== null ? parseInt(id) : null;
}



// ─── DATUMFILTER ──────────────────────────────────────────────

/**
 * Filtrerar aktivitetslistan till poster vars datum
 * faller inom intervallet [from, to] (inklusivt).
 *
 * @param {string|Date} from - Startdatum (t.ex. "2024-01-01")
 * @param {string|Date} to   - Slutdatum  (t.ex. "2024-12-31")
 * @returns {Array} Filtrerad lista med aktiviteter
 */
function setDateInterval(from, to) {
    const start = new Date(from);
    const end   = new Date(to);

    return hamtaAktiviteter().filter(a => {
        if (!a.datum) return false;
        const d = new Date(a.datum);
        return d >= start && d <= end;
    });
}



// ─── HÄMTA AKTIVITETER FRÅN JSON ──────────────────────────────

/**
 * Hämtar aktiviteter från JSON och sparar till localStorage,
 * men bara om localStorage redan är tomt.
 * Kastar ett strukturerat felobjekt vid HTTP-fel.
 */
async function getActivities() {
    if (hamtaAktiviteter().length > 0) return; // redan data, skippa

    try {
        const response = await fetch("api/activity");

        if (response.ok) {
            const data = await response.json();

            const lista = data.activities.map(a => ({
                id:    a.id,
                namn:  a.activity,
                datum: a.datum ?? null   // null om fältet saknas i JSON
            }));

            sparaAktiviteter(lista);
        } else {
            let message = null;
            try {
                message = await response.json();
            } finally {
                const fel = {
                    status:  response.status,
                    text:    response.statusText,
                    url:     response.url,
                    message
                };
                throw fel;
            }
        }
    } catch (e) {
        // Vidarekastar strukturerade felobjekt; loggar övriga nätverksfel
        if (e.status !== undefined) throw e;
        console.error("Kunde inte ladda JSON:", e);
    }
}



// ─── LISTA ────────────────────────────────────────────────────

/**
 * Fyller .item-list / .item-list-mobil med aktiviteter.
 * Om en filtrerad lista skickas in används den, annars hela localStorage.
 *
 * @param {Array|null} [filtrerad=null]
 */
function fyllLista(filtrerad = null) {
    const aktiviteter = filtrerad ?? hamtaAktiviteter();
    const targets = document.querySelectorAll(".item-list, .item-list-mobil");
    if (targets.length === 0) return;

    targets.forEach(target => {
        target.innerHTML = "";

        aktiviteter.forEach(a => {
            const div = document.createElement("div");
            div.className = "item activity-card";
            div.innerHTML = `
                <span class="activity-name">${a.namn}</span>
                ${a.datum ? `<span class="activity-date">${a.datum}</span>` : ""}
                <div class="action-buttons">
                    <button class="btn-outline" onclick="redigeraAktivitet(${a.id})">Redigera</button>
                    <button class="btn-outline btn-delete" onclick="raderaAktivitet(${a.id})">Radera</button>
                </div>
            `;
            target.appendChild(div);
        });
    });
}

function redigeraAktivitet(id) {
    window.location.href = `editAktivitet.html?id=${id}`;
}

function raderaAktivitet(id) {
    if (!confirm("Radera aktiviteten?")) return;
    const lista = hamtaAktiviteter().filter(a => a.id !== id);
    sparaAktiviteter(lista);
    fyllLista();
}



// ─── FORMULÄR ─────────────────────────────────────────────────

function fyllFormularMedAktivitet(id) {
    const a = hamtaAktiviteter().find(a => a.id === id);
    if (!a) return;

    const desk = document.getElementById("aktivitet-namn");
    const mob  = document.getElementById("mob-aktivitet-namn");
    const titD = document.getElementById("form-titel");
    const titM = document.getElementById("mob-form-titel");

    if (desk) desk.value       = a.namn;
    if (mob)  mob.value        = a.namn;
    if (titD) titD.textContent = "Redigera aktivitet";
    if (titM) titM.textContent = "Redigera aktivitet";
}

function sparaFormular() {
    const id = hamtaIdFranURL();

    const namn = (
        document.getElementById("aktivitet-namn") ||
        document.getElementById("mob-aktivitet-namn")
    )?.value?.trim();

    if (!namn) {
        alert("Ange ett namn på aktiviteten.");
        return;
    }

    const lista = hamtaAktiviteter();

    if (id === null) {
        const nyttId = lista.length > 0 ? Math.max(...lista.map(a => a.id)) + 1 : 1;
        lista.push({ id: nyttId, namn, datum: null });
    } else {
        const index = lista.findIndex(a => a.id === id);
        if (index !== -1) lista[index].namn = namn;
    }

    sparaAktiviteter(lista);
    window.location.href = "aktiviteter.html";
}



// ─── INIT ─────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
    const paListSidan = document.querySelector(".item-list, .item-list-mobil");
    const paEditSidan = document.getElementById("spara-btn") ||
        document.getElementById("mob-spara-btn");

    if (paListSidan) {
        try {
            await getActivities(); // hämtar JSON bara om localStorage är tomt
        } catch (fel) {
            console.error("Fel vid hämtning:", fel);
        }
        fyllLista();
    }

    if (paEditSidan) {
        const id = hamtaIdFranURL();
        if (id !== null) {
            fyllFormularMedAktivitet(id);
        }

        document.getElementById("spara-btn")?.addEventListener("click", sparaFormular);
        document.getElementById("mob-spara-btn")?.addEventListener("click", sparaFormular);
    }
});