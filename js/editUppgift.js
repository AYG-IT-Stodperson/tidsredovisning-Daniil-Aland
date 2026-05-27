let allaAktiviteter = []

function getVarde(desktopId, mobilId) {
    const desktop = document.getElementById(desktopId)
    const mobil = document.getElementById(mobilId)
    if (desktop && desktop.offsetParent !== null) return desktop.value
    if (mobil && mobil.offsetParent !== null) return mobil.value
    return desktop?.value ?? ""
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search)
    const uppgiftId = params.has("id") ? parseInt(params.get("id")) : null

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
    document.getElementById("spara-btn-mobil").addEventListener("click", () => sparaUppgift(uppgiftId))
})

function fyllAktivitetsval() {
    const options = allaAktiviteter.map(a =>
        `<option value="${a.id}">${a.activity}</option>`
    ).join("")
    document.getElementById("uppgift-aktivitet").innerHTML = options
    document.getElementById("uppgift-aktivitet-mobil").innerHTML = options
}

async function fillForm(id) {
    try {
        let response = await fetch(`api/task/${id}`)
        if (!response.ok) throw await response.json()
        let post = await response.json()

        const formTitel = document.getElementById("form-titel")
        if (formTitel) formTitel.textContent = "Redigera uppgift"
        const visaId = document.getElementById("visa-id")
        if (visaId) visaId.textContent = `ID: ${post.id}`
        const akt = document.getElementById("uppgift-aktivitet")
        if (akt) akt.value = post.activityId ?? post.aktivitetId
        const datum = document.getElementById("uppgift-datum")
        if (datum) datum.value = post.date ?? post.datum
        const tid = document.getElementById("uppgift-tid")
        if (tid) tid.value = post.time ?? post.tid
        const besk = document.getElementById("uppgift-beskrivning")
        if (besk) besk.value = post.description ?? post.beskrivning

        const formTitelMobil = document.getElementById("form-titel-mobil")
        if (formTitelMobil) formTitelMobil.textContent = "Redigera uppgift"
        const visaIdMobil = document.getElementById("visa-id-mobil")
        if (visaIdMobil) visaIdMobil.textContent = `ID: ${post.id}`
        const aktMobil = document.getElementById("uppgift-aktivitet-mobil")
        if (aktMobil) aktMobil.value = post.activityId ?? post.aktivitetId
        const datumMobil = document.getElementById("uppgift-datum-mobil")
        if (datumMobil) datumMobil.value = post.date ?? post.datum
        const tidMobil = document.getElementById("uppgift-tid-mobil")
        if (tidMobil) tidMobil.value = post.time ?? post.tid
        const beskMobil = document.getElementById("uppgift-beskrivning-mobil")
        if (beskMobil) beskMobil.value = post.description ?? post.beskrivning

    } catch (e) {
        console.error("Kunde inte hämta uppgift:", e)
        alert("Uppgiften hittades inte.")
        emptyForm()
    }
}

function emptyForm() {
    const idag = new Date().toISOString().split("T")[0]
    document.getElementById("uppgift-datum").value = idag
    document.getElementById("uppgift-datum").max = idag
    document.getElementById("uppgift-datum-mobil").value = idag
    document.getElementById("uppgift-datum-mobil").max = idag
}

function valideraFormular() {
    const datum = getVarde("uppgift-datum", "uppgift-datum-mobil")
    const tid = getVarde("uppgift-tid", "uppgift-tid-mobil")
    const akt = document.getElementById("uppgift-aktivitet")
    const aktMobil = document.getElementById("uppgift-aktivitet-mobil")

    if (datum > new Date().toISOString().substring(0, 10)) {
        alert("Datum kan inte vara i framtiden.")
        return false
    }

    const [timmar, minuter] = tid.split(":").map(Number)
    const totalMinuter = timmar * 60 + minuter

    if (totalMinuter < 15) {
        alert("Minst 15 minuter per uppgift.")
        return false
    }
    if (totalMinuter > 480) {
        alert("Max 8 timmar per uppgift.")
        return false
    }
    if (minuter % 15 !== 0) {
        alert("Tid måste anges i 15-minutersintervall.")
        return false
    }
    if (akt.selectedIndex < 0 && aktMobil.selectedIndex < 0) {
        alert("Välj en aktivitet.")
        return false
    }
    return true
}

async function sparaUppgift(uppgiftId) {
    if (!valideraFormular()) return

    let formData = new FormData()
    formData.set("activityId", getVarde("uppgift-aktivitet", "uppgift-aktivitet-mobil"))
    formData.set("date", getVarde("uppgift-datum", "uppgift-datum-mobil"))
    formData.set("time", getVarde("uppgift-tid", "uppgift-tid-mobil"))
    formData.set("description", getVarde("uppgift-beskrivning", "uppgift-beskrivning-mobil").trim())

    let response = await fetch(`api/task/${uppgiftId ?? ""}`, {
        method: uppgiftId ? "PUT" : "POST",
        body: formData
    })

    if (!response.ok) {
        alert("Kunde inte spara uppgift, kontrollera konsolen")
        try { console.error(await response.json()) }
        catch { console.error("Servern skickade inget JSON-svar") }
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