window.onload = () => {
    rensaLista()
    setDateInterval()
    getCompilation()

    document.getElementById("hamta").addEventListener("click", hamtaNyData)
    document.getElementById("hamta-mobil").addEventListener("click", hamtaNyData)
}

function rensaLista() {
    document.querySelectorAll(".lista-container").forEach(el => el.innerHTML = "")
}

function setDateInterval() {
    const idag = new Date()
    const manad = idag.getMonth()
    const fran = new Date(idag.getFullYear(), manad, 1, 24).toISOString().substring(0, 10)
    const till = new Date(idag.getFullYear(), manad + 1, 0, 24).toISOString().substring(0, 10)

    document.getElementById("franDatum").value = fran
    document.getElementById("tillDatum").value = till
    document.getElementById("franDatum-mobil").value = fran
    document.getElementById("tillDatum-mobil").value = till
}

function getCompilation() {
    const franDatum = document.getElementById("franDatum").value
    const tillDatum = document.getElementById("tillDatum").value

    fetch(`api/compilation/${franDatum}/${tillDatum}`)
        .then(response => {
            if (response.ok) return response.json()
            return response.json()
                .catch(() => null)
                .then(message => {
                    throw { status: response.status, text: response.statusText, url: response.url, message }
                })
        })
        .then(data => fyllLista(data))
        .catch(error => console.error("Fel:", error))
}

function fyllLista(data) {
    const targets = document.querySelectorAll(".lista-container")
    let totalMinuter = 0

    targets.forEach(target => {
        target.innerHTML = ""

        data.tasks.forEach(t => {
            const rad = document.createElement("ul")
            rad.className = "lista"
            rad.innerHTML = `<li>${t.aktivitet}</li><li class="right">${t.time}</li>`
            target.appendChild(rad)

            // Räkna ihop total tid
            const delar = t.time.split(":")
            totalMinuter += parseInt(delar[0]) * 60 + parseInt(delar[1])
        })
    })

    // Visa total tid
    const timmar = Math.floor(totalMinuter / 60)
    const minuter = totalMinuter % 60
    const totalText = `TOTAL TID: ${timmar}h ${minuter}min`
    document.getElementById("total-desktop").textContent = totalText
    document.getElementById("total-mobile").textContent  = totalText
}

function hamtaNyData() {
    rensaLista()
    getCompilation()
}