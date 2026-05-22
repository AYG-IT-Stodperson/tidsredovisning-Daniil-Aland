window.onload = () => {
    rensaLista()
    // setDateInterval()
    getActivities()
}

function rensaLista() {
    document.getElementById("tom").innerHTML = ""
}

function setDateInterval() {
    let idag = new Date()
    let aktuellManad = idag.getMonth()
    let fromDatum = new Date(idag.getFullYear(), aktuellManad, 1, 24)
    let toDatum = new Date(idag.getFullYear(), aktuellManad + 1, 0, 24)
    document.getElementById("franDatum").value = fromDatum.toISOString().substring(0, 10)
    document.getElementById("tillDatum").value = toDatum.toISOString().substring(0, 10)
}

async function getActivities() {
    try {
        let response = await fetch("api/activity")
        if (response.ok) {
            let data = await response.json()
            fyllLista(data)
        } else {
            let message = null
            try {
                message = await response.json()
            } finally {
                let fel = {
                    status: response.status,
                    text: response.statusText,
                    url: response.url,
                    message
                }
                throw fel
            }
        }
    } catch (e) {
        if (e.status !== undefined) throw e
        console.error("Kunde inte ladda aktiviteter:", e)
    }
}

function fyllLista(data) {
    let lista = document.getElementById("tom")
    lista.innerHTML = ""

    data.activities.forEach(a => {
        let div = document.createElement("div")
        div.className = "item activity-card"
        div.innerHTML = `
            <span class="activity-name">${a.activity}</span>
            ${a.datum ? `<span class="activity-date">${a.datum}</span>` : ""}
            <div class="action-buttons">
                <button class="btn-outline" onclick="redigeraAktivitet(${a.id})">Redigera</button>
                <button class="btn-outline btn-delete" onclick="alertDelete(${a.id})">Radera</button>
            </div>
        `
        lista.appendChild(div)
    })
}

function redigeraAktivitet(id) {
    window.location.href = `editAktivitet.html?id=${id}`
}

function alertDelete(id) {
    if (!confirm(`Vill du radera posten med id=${id}?`)) return

    let formData = new FormData()
    formData.append("action", "delete")

    fetch(`api/activity/${id}`, {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (response.ok) return response.json()
            else throw response.json()
        })
        .then(data => {
            if (data.result) {
                alert("Radera lyckades")
                window.location.reload()
            } else {
                alert(data.message.join("\r\n"))
            }
        })
        .catch(async (error) => {
            let meddelande = (await error).error
            alert(meddelande.join("\r\n"))
        })
}