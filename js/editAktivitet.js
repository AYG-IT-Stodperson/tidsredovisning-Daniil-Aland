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

    document.getElementById("form-titel")?.textContent && (document.getElementById("form-titel").textContent = "Redigera aktivitet")
    document.getElementById("form-titel-mobil")?.textContent && (document.getElementById("form-titel-mobil").textContent = "Redigera aktivitet")

    document.getElementById("visa-id")?.textContent && (document.getElementById("visa-id").textContent = `ID: ${a.id}`)
    document.getElementById("visa-id-mobil")?.textContent && (document.getElementById("visa-id-mobil").textContent = `ID: ${a.id}`)

    document.getElementById("aktivitet-namn")?.setAttribute("value", a.activity)
    document.getElementById("aktivitet-namn-mobil")?.setAttribute("value", a.activity)
}

function emptyForm() {
    document.getElementById("form-titel").textContent = "Ny aktivitet"
    document.getElementById("form-titel-mobil").textContent = "Ny aktivitet"
    document.getElementById("visa-id").textContent = ""
    document.getElementById("visa-id-mobil").textContent = ""
    document.getElementById("aktivitet-namn").value = ""
    document.getElementById("aktivitet-namn-mobil").value = ""
    document.getElementById("aktivitet-namn").focus()
}

function getNamn() {
    const desktop = document.getElementById("aktivitet-namn")
    const mobil = document.getElementById("aktivitet-namn-mobil")
    if (desktop && desktop.offsetParent !== null) return desktop.value.trim()
    if (mobil && mobil.offsetParent !== null) return mobil.value.trim()
    return desktop?.value.trim() ?? ""
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

    document.getElementById("aktivitet-namn").setCustomValidity("")
    document.getElementById("aktivitet-namn-mobil").setCustomValidity("")

    if (namn === "") {
        alert("Aktiviteten måste finnas")
        document.getElementById("aktivitet-namn").setCustomValidity("Aktiviteten måste finnas")
        document.getElementById("aktivitet-namn-mobil").setCustomValidity("Aktiviteten måste finnas")
        return false
    }

    if (allaAktiviteter.find(a =>
        a.activity.toLocaleLowerCase() === namn.toLocaleLowerCase() &&
        a.id !== aktivitetsId
    )) {
        alert("Aktiviteten finns redan")
        document.getElementById("aktivitet-namn").setCustomValidity("Aktiviteten finns redan")
        document.getElementById("aktivitet-namn-mobil").setCustomValidity("Aktiviteten finns redan")
        return false
    }

    return true
}