window.onload = () => {
    // Rensa listan
    rensaLista();

    // Sätt standardvärden för perioden
    setDateInterval();

    // Hämta från API:et
    getCompilation();
}

function rensaLista() {
    // Vi hämtar alla containrar (både mobil och desktop)
    let listor = document.querySelectorAll(".lista-container");
    listor.forEach(lista => {
        lista.innerHTML = "";
    });
}

function setDateInterval() {
    let idag = new Date();
    let aktuellManad = idag.getMonth();

    // Skapar datumobjekt
    let fromDatum = new Date(idag.getFullYear(), aktuellManad, 1, 24);
    let toDatum = new Date(idag.getFullYear(), aktuellManad + 1, 0, 24);

    let fromStr = fromDatum.toISOString().substring(0, 10);
    let toStr = toDatum.toISOString().substring(0, 10);


    // Sätt värden i Desktop-fälten
    document.getElementById("franDatum").value = fromStr;
    document.getElementById("tillDatum").value = toStr;


    // Sätt värden i Mobil-fälten (viktigt!)
    document.getElementById("franDatum-mobil").value = fromStr;
    document.getElementById("tillDatum-mobil").value = toStr;
}

function getCompilation() {
    // Simulerat API-svar


    let retur = {
        tasks: [
            { id: 1, time: "03:00", name: "Databas" },
            { id: 3, time: "02:15", name: "API-anrop" },
            { id: 4, time: "03:30", name: "Javascript" },
            { id: 5, time: "01:00", name: "Styling" },
        ]
    }
    fyllLista(retur);
}


function fyllLista(data) {
    // Hämta alla containrar där vi vill lägga till rader
    let targets = document.querySelectorAll(".lista-container");



    // Loopa igenom varje container (en för mobil, en för desktop)
    targets.forEach(target => {



        // Loopa igenom all data för varje container

        for (let i = 0; i < data.tasks.length; i++) {
            let rad = document.createElement("ul");
            rad.className = "lista";
            rad.innerHTML = `<li>${data.tasks[i].name}</li><li class="right">${data.tasks[i].time}</li>`;
            target.appendChild(rad);
        }
    });
}