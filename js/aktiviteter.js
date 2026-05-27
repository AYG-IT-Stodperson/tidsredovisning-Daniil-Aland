window.onload = () => {
    getActivities()
}

async function getActivities() {
    try {
        let response = await fetch("api/activity")
        if (response.ok) {
            let data = await response.json()
            fyllLista(data)
        } else {
            let message = null
            try { message = await response.json() } finally {
                throw { status: response.status, text: response.statusText, url: response.url, message }
            }
        }
    } catch (e) {
        if (e.status !== undefined) throw e
        console.error("Kunde inte ladda aktiviteter:", e)
    }
}

function fyllLista(data) {
    const targets = document.querySelectorAll(".item-list, .item-list-mobil")
    if (targets.length === 0) return

    targets.forEach(target => {
        target.innerHTML = ""
        const isMobile = target.classList.contains("item-list-mobil")

        data.activities.forEach(a => {
            if (isMobile) {
                const card = document.createElement("div")
                card.className = "task-card-mobile"
                card.innerHTML = `
                    <div class="task-info">
                        <div class="task-main"><strong>${a.activity}</strong></div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-outline" onclick="redigeraAktivitet(${a.id})">Redigera</button>
                        <button class="btn-outline btn-delete" onclick="alertDelete(${a.id})">Radera</button>
                    </div>
                `
                target.appendChild(card)
            } else {
                const div = document.createElement("div")
                div.className = "item activity-card"
                div.innerHTML = `
                    <span class="activity-name">${a.activity}</span>
                    <div class="action-buttons">
                        <button class="btn-outline" onclick="redigeraAktivitet(${a.id})">Redigera</button>
                        <button class="btn-outline btn-delete" onclick="alertDelete(${a.id})">Radera</button>
                    </div>
                `
                target.appendChild(div)
            }
        })
    })
}

function redigeraAktivitet(id) {
    window.location.href = `editAktivitet.html?id=${id}`
}

function alertDelete(id) {
    if (!confirm(`Vill du radera posten med id=${id}?`)) return

    let formData = new FormData()
    formData.append("action", "delete")

    fetch(`api/activity/${id}`, { method: "POST", body: formData })
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
        .catch(async error => {
            let meddelande = (await error).error
            alert(meddelande.join("\r\n"))
        })
}