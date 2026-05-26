function fyllLista(data) {
    const targets = document.querySelectorAll(".item-list, .item-list-mobil")
    if (targets.length === 0) return

    targets.forEach(target => {
        target.innerHTML = ""
        const isMobile = target.classList.contains("item-list-mobil")

        if (!isMobile) {
            const rubrik = document.createElement("ul")
            rubrik.className = "lista heading"
            rubrik.innerHTML = `
                <li style="width:15%;">DATUM</li>
                <li style="width:10%;">TID</li>
                <li style="width:25%;">AKTIVITET</li>
                <li style="width:30%;">BESKRIVNING</li>
                <li style="width:20%;"></li>
            `
            target.appendChild(rubrik)
        }

        data.tasks.forEach(u => {
            const aktNamn = u.aktivitet ?? u.activity ?? "–"

            if (isMobile) {
                const card = document.createElement("div")
                card.className = "task-card-mobile"
                card.innerHTML = `
                    <div class="task-info">
                        <div class="task-row"><strong>${u.datum ?? u.date}</strong> <span>${u.tid ?? u.time}</span></div>
                        <div class="task-main"><strong>${aktNamn}</strong></div>
                        <div class="task-desc">${u.beskrivning ?? u.description}</div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-outline" onclick="redigeraUppgift(${u.id})">Redigera</button>
                        <button class="btn-outline btn-delete" onclick="alertDelete(${u.id})">Radera</button>
                    </div>
                `
                target.appendChild(card)
            } else {
                const rad = document.createElement("ul")
                rad.className = "lista"
                rad.innerHTML = `
                    <li style="width:15%;">${u.datum ?? u.date}</li>
                    <li style="width:10%;">${u.tid ?? u.time}</li>
                    <li style="width:25%;">${aktNamn}</li>
                    <li style="width:30%;">${u.beskrivning ?? u.description}</li>
                    <li class="right" style="width:20%;">
                        <div class="action-buttons">
                            <button class="btn-outline" onclick="redigeraUppgift(${u.id})">Redigera</button>
                            <button class="btn-outline btn-delete" onclick="alertDelete(${u.id})">Radera</button>
                        </div>
                    </li>
                `
                target.appendChild(rad)
            }
        })
    })
}

function setDateInterval() {
    const idag = new Date()
    const ar = idag.getFullYear()
    const manad = idag.getMonth()

    const fran = new Date(ar, manad, 1, 24).toISOString().substring(0, 10)
    const till = new Date(ar, manad + 1, 0, 24).toISOString().substring(0, 10)

    const franFalt = document.getElementById("franDatum")
    const tillFalt = document.getElementById("tillDatum")
    if (franFalt) franFalt.value = fran
    if (tillFalt) tillFalt.value = till

    const franMobil = document.getElementById("franDatum-mobil")
    const tillMobil = document.getElementById("tillDatum-mobil")
    if (franMobil) franMobil.value = fran
    if (tillMobil) tillMobil.value = till
}

function hamtaSida(mobilEl = false) {
    const sidnr = mobilEl
        ? document.getElementById("sidnr-mobil")?.value
        : document.getElementById("sidnr")?.value

    fetch(`api/tasklist/${sidnr}`)
        .then(response => {
            if (response.ok) return response.json()
            else throw response.json()
        })
        .then(data => fyllLista(data))
        .catch(fel => console.error("Fel vid hämtning av sida:", fel))
}

function redigeraUppgift(id) {
    window.location.href = `editUppgift.html?id=${id}`
}

function alertDelete(id) {
    if (!confirm(`Vill du radera uppgiften med id=${id}?`)) return

    fetch(`api/task/${id}`, {
        method: "DELETE"
    })
        .then(response => {
            if (response.ok) return response.json()
            else throw response.json()
        })
        .then(data => {
            if (data.result) {
                alert("Radera lyckades")
                hamtaSida()
            } else {
                alert(data.message.join("\r\n"))
            }
        })
        .catch(async error => {
            let meddelande = (await error).error
            alert(meddelande.join("\r\n"))
        })
}

function aktiveraAlternativ(ev) {
    try {
        if (ev.target.value === "sida") {
            document.getElementById("sidnr").disabled = false
            document.getElementById("hamtaSida").disabled = false
            document.getElementById("franDatum").disabled = true
            document.getElementById("tillDatum").disabled = true
            document.getElementById("hamta").disabled = true
        } else {
            document.getElementById("franDatum").disabled = false
            document.getElementById("tillDatum").disabled = false
            document.getElementById("hamta").disabled = false
            document.getElementById("sidnr").disabled = true
            document.getElementById("hamtaSida").disabled = true
        }
    } catch (error) {
        console.error(error)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setDateInterval()
    hamtaSida()

    document.getElementById("hamtaSida")?.addEventListener("click", () => hamtaSida(false))
    document.getElementById("hamtaSida-mobil")?.addEventListener("click", () => hamtaSida(true))
})