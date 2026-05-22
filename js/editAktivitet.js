let allaAktiviteter = []
let aktivitetsId = null

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search)
    aktivitetsId = params.has("id") ? parseInt(params.get("id")) : null

    // Hämta alla aktiviteter från API:et
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

    document.getElementById("spara-btn").addEventListener("click", sparaAktivitet)
})

function fillForm(id) {
    const a = allaAktiviteter.find(a => a.id === id)
    if (!a) return
    document.getElementById("form-titel").textContent = "Redigera aktivitet"
    document.getElementById("visa-id").textContent    = `ID: ${a.id}`
    document.getElementById("aktivitet-namn").value   = a.activity
}

function emptyForm() {
    document.getElementById("form-titel").textContent = "Ny aktivitet"
    document.getElementById("visa-id").textContent    = ""
    document.getElementById("aktivitet-namn").value   = ""
    document.getElementById("aktivitet-namn").focus()
}

async function sparaAktivitet() {
    if (!verifieraForm()) {
        alert("Åtgärda felen")
        return
    }

    let formData = new FormData()
    formData.set("action", "save")
    formData.set("activity", document.getElementById("aktivitet-namn").value.trim())

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
    let returKod = true

    document.getElementById("aktivitet-namn").setCustomValidity("")

    let aktivitet = document.getElementById("aktivitet-namn").value.trim()

    if (aktivitet === "") {
        alert("Aktiviteten måste finnas")
        document.getElementById("aktivitet-namn").setCustomValidity("Aktiviteten måste finnas")
        returKod = false
    } else if (allaAktiviteter.find(a =>
        a.activity.toLocaleLowerCase() === aktivitet.toLocaleLowerCase() &&
        a.id !== aktivitetsId
    )) {
        alert("Aktiviteten finns redan")
        document.getElementById("aktivitet-namn").setCustomValidity("Aktiviteten finns redan")
        returKod = false
    }

    return returKod
}