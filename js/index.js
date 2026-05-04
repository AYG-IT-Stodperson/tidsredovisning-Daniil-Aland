window.onload = () => {
    // Rensa listan
    rensaLista();

    // Sätt standardvärden för perioden
    setDateInterval();

    // Hämta från API:et
    getCompilation();

}

function getCompilation() {
    fetch("dummy/sammanstallning.json")
        .then(response =>{
            if(response.ok) {
                return response.json()
            }


            // response är inte ok..
            return response.json()
                .catch(() =>null) // Är svaret inte json händer inget
                .then(message =>{
                    let fel={status:response.status,
                        text: response.statusText,
                        url: response.url,
                        message
                    }

                    throw fel
                })
        })
        .then(data =>{
            fyllLista(data)
        })
        .catch(error => {
            console.error(error)
        })
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






function fyllLista(data) {
    // Hämta alla containrar där vi vill lägga till rader
    let targets = document.querySelectorAll(".lista-container");



    // Loopa igenom varje container (en för mobil, en för desktop)
    targets.forEach(target => {



        // Loopa igenom all data för varje container

        for (let i = 0; i < data.tasks.length; i++) {
            let rad = document.createElement("ul");
            rad.className = "lista";
            rad.innerHTML = `<li>${data.tasks[i].activity}</li><li class="right">${data.tasks[i].time}</li>`;
            target.appendChild(rad);
        }
    });
}