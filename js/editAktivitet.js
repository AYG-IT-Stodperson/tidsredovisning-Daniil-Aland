let allaAktiviteter = []
let aktivitetsId = null

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search)
    aktivitetsId = params.has("id") ? parseInt(params.get("id")) : null

    fetch("api/activity")
        .then(response => {
            if (response.ok) return response.json()
            else throw response.json()
        })
        .then(data => {
            allaAktiviteter = data.activities
            if (aktivitetsId !== null) {
                fillForm(aktivitetsId)
            } else {
                emptyForm()
            }
        })
        .catch(error => console.error(error))

    document.getElementById("spara-btn")?.addEventListener("click", sparaAktivitet)
    document.getElementById("spara-btn-mobil")?.addEventListener("click", sparaAktivitet)
})

function fillForm(id) {
    const a = allaAktiviteter.find(a => a.id === id)
    if (!a) return

    // Ändra titlar i formulären
    const formTitel = document.getElementById("form-titel")
    if (formTitel) formTitel.textContent = "Redigera aktivitet"

    const formTitelMobil = document.getElementById("form-titel-mobil")
    if (formTitelMobil) formTitelMobil.textContent = "Redigera aktivitet"

    // Visa ID
    const visaId = document.getElementById("visa-id")
    if (visaId) visaId.textContent = `ID: ${a.id}`

    const visaIdMobil = document.getElementById("visa-id-mobil")
    if (visaIdMobil) visaIdMobil.textContent = `ID: ${a.id}`

    // FIX: Sätter .value istället för setAttribute för att det ska fungera i mobilvyn
    const inputNamn = document.getElementById("aktivitet-namn")
    if (inputNamn) inputNamn.value = a.activity

    const inputNamnMobil = document.getElementById("aktivitet-namn-mobil")
    if (inputNamnMobil) inputNamnMobil.value = a.activity
}

function emptyForm() {
    const formTitel = document.getElementById("form-titel")
    if (formTitel) formTitel.textContent = "Ny aktivitet"

    const formTitelMobil = document.getElementById("form-titel-mobil")
    if (formTitelMobil) formTitelMobil.textContent = "Ny aktivitet"

    const visaId = document.getElementById("visa-id")
    if (visaId) visaId.textContent = ""

    const visaIdMobil = document.getElementById("visa-id-mobil")
    if (visaIdMobil) visaIdMobil.textContent = ""

    const inputNamn = document.getElementById("aktivitet-namn")
    if (inputNamn) inputNamn.value = ""

    const inputNamnMobil = document.getElementById("aktivitet-namn-mobil")
    if (inputNamnMobil) inputNamnMobil.value = ""

    inputNamn?.focus()
}

function getNamn() {
    const desktop = document.getElementById("aktivitet-namn")
    const mobil = document.getElementById("aktivitet-namn-mobil")

    // Kollar vilket element som faktiskt visas på skärmen just nu (display: none ger offsetParent === null)
    if (desktop && desktop.offsetParent !== null) return desktop.value.trim()
    if (mobil && mobil.offsetParent !== null) return mobil.value.trim()

    // Fallback om webbläsaren inte har ritat färdigt eller om CSS saknas
    return desktop?.value.trim() || mobil?.value.trim() || ""
}

async function sparaAktivitet() {
    if (!verifieraForm()) {
        alert("Åtgärda felen")
        return
    }

    let formData = new FormData()
    formData.set("action", "save")
    formData.set("activity", getNamn())

    let response = await fetch(`api/activity/${aktivitetsId ?? ""}`, {
        method: "POST",
        body: formData
    })

    if (!response.ok) {
        alert("Kunde inte spara aktivitet, kontrollera konsolen")
        console.error(await response.json())
        return
    }

    let svar = await response.json()
    if (aktivitetsId) {
        alert("Uppdatera lyckades")
        window.location.href = "aktiviteter.html"
    } else {
        alert("Spara ny aktivitet lyckades")
        window.location.href = `editAktivitet.html?id=${svar.id}`
    }
}

function verifieraForm() {
    const namn = getNamn()
    const desktop = document.getElementById("aktivitet-namn")
    const mobil = document.getElementById("aktivitet-namn-mobil")

    if (desktop) desktop.setCustomValidity("")
    if (mobil) mobil.setCustomValidity("")

    if (namn === "") {
        alert("Aktiviteten måste finnas")
        if (desktop) desktop.setCustomValidity("Aktiviteten måste finnas")
        if (mobil) mobil.setCustomValidity("Aktiviteten måste finnas")
        return false
    }

    if (allaAktiviteter.find(a =>
        a.activity.toLocaleLowerCase() === namn.toLocaleLowerCase() &&
        a.id !== aktivitetsId
    )) {
        alert("Aktiviteten finns redan")
        if (desktop) desktop.setCustomValidity("Aktiviteten finns redan")
        if (mobil) mobil.setCustomValidity("Aktiviteten finns redan")
        return false
    }

    return true
}