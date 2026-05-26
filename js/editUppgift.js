let allaAktiviteter = []
let aktivitetsId = null

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search)
    const uppgiftId = params.has("id") ? parseInt(params.get("id")) : null

    // Hämta aktiviteter för dropdown
    fetch("api/activity")
        .then(response => {
            if (response.ok) return response.json()
            else throw response.json()
        })
        .then(data => {
            allaAktiviteter = data.activities
            fyllAktivitetsval()

            if (uppgiftId !== null) {
                fillForm(uppgiftId)
            } else {
                emptyForm()
            }
        })
        .catch(error => console.error(error))

    document.getElementById("spara-btn").addEventListener("click", () => sparaUppgift(uppgiftId))
})

function fyllAktivitetsval() {
    const select = document.getElementById("uppgift-aktivitet")
    select.innerHTML = allaAktiviteter.map(a =>
        `<option value="${a.id}">${a.activity}</option>`
    ).join("")
}

async function fillForm(id) {
    try {
        let response = await fetch(`api/task/${id}`)
        if (!response.ok) throw await response.json()

        let post = await response.json()
        document.getElementById("form-titel").textContent       = "Redigera uppgift"
        document.getElementById("visa-id").textContent          = `ID: ${post.id}`
        document.getElementById("uppgift-aktivitet").value      = post.activityId ?? post.aktivitetId
        document.getElementById("uppgift-datum").value          = post.date ?? post.datum
        document.getElementById("uppgift-tid").value            = post.time ?? post.tid
        document.getElementById("uppgift-beskrivning").value    = post.description ?? post.beskrivning

    } catch (e) {
        console.error("Kunde inte hämta uppgift:", e)
        alert("Uppgiften hittades inte.")
        emptyForm()
    }
}

function emptyForm() {
    const idag = new Date().toISOString().split("T")[0]
    document.getElementById("uppgift-datum").value = idag
    document.getElementById("uppgift-datum").max   = idag
}


function valideraFormular() {
    let valid = true
    const datum = document.getElementById("uppgift-datum").value
    const tid   = document.getElementById("uppgift-tid").value
    const akt   = document.getElementById("uppgift-aktivitet")


    if (datum > new Date().toISOString().substring(0, 10)) {
        alert("Datum kan inte vara i framtiden.")
        valid = false
    }
    if (tid > "08:00") {
        alert("Max 8 timmar per uppgift.")
        valid = false
    }
    if (tid < "00:15") {
        alert("Minst 15 minuter per uppgift.")
        valid = false
    }
    if (!["00", "15", "30", "45"].includes(tid.substring(3, 5))) {
        alert("Tid måste anges i 15-minutersintervall.")
        valid = false
    }
    if (akt.selectedIndex < 0) {
        alert("Välj en aktivitet.")
        valid = false
    }

    return valid
}


async function sparaUppgift(uppgiftId) {
    if (!valideraFormular()) return

    let formData = new FormData()
    formData.set("activityId", document.getElementById("uppgift-aktivitet").value)
    formData.set("date",       document.getElementById("uppgift-datum").value)
    formData.set("time",       document.getElementById("uppgift-tid").value)
    formData.set("description", document.getElementById("uppgift-beskrivning").value.trim())

    let response = await fetch(`api/task/${uppgiftId ?? ""}`, {
        method: uppgiftId ? "PUT" : "POST",
        body: formData
    })

    if (!response.ok) {
        alert("Kunde inte spara uppgift, kontrollera konsolen")
        try {
            console.error(await response.json())
        } catch {
            console.error("Servern skickade inget JSON-svar")
        }
        return
    }

    let svar = await response.json()
    if (uppgiftId) {
        alert("Uppdatera lyckades")
        window.location.href = "uppgifter.html"
    } else {
        alert("Spara ny uppgift lyckades")
        window.location.href = `editUppgift.html?id=${svar.id}`
    }
}