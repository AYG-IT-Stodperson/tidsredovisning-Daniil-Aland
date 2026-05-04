// örs när sidan laddas
window.onload = () => {
    rensaLista(); // tömmer gamla element
    getTasks();   // hämtar och visar uppgifter
}

// tömmer innehållet i både desktop och mobil listorna
function rensaLista() {
    let listor = document.querySelectorAll(".item-list, .item-list-mobil");
    listor.forEach(lista => {
        lista.innerHTML = "";
    });
}



// simulerar hämtning av data (en fast lista med uppgifter)
function getTasks() {
    let retur = {
        tasks: [
            { id: 1, datum: "2026-04-28", tid: "00:45", aktivitet: "API - Aktiviteter", beskrivning: "Hämta alla aktiviteter" },
            { id: 2, datum: "2026-04-28", tid: "00:20", aktivitet: "API - Aktiviteter", beskrivning: "Hämta enskild aktivitet" },
            { id: 3, datum: "2026-04-24", tid: "03:00", aktivitet: "Gränssnitt - Sammanställning", beskrivning: "Skapa vy för sammanställning" }
        ]
    };
    fyllLista(retur); // Skickar datan till rit-funktionen
}

// huvudfunktion för att bygga upp listan i HTML
function fyllLista(data) {
    let targets = document.querySelectorAll(".item-list, .item-list-mobil");

    targets.forEach(target => {
        target.innerHTML = "";
        // Kontrollera om den aktuella behållaren är för mobiler
        const isMobile = target.classList.contains("item-list-mobil");

        // skapar rubriker, men bara för dator vyn
        if (!isMobile) {
            let rubrikRad = document.createElement("ul");
            rubrikRad.className = "lista heading";
            rubrikRad.innerHTML = `
                <li style="width: 15%;">Datum</li>
                <li style="width: 10%;">Tid</li>
                <li style="width: 25%;">Aktivitet</li>
                <li style="width: 30%;">Beskrivning</li>
                <li style="width: 20%;"></li> 
            `;
            target.appendChild(rubrikRad);
        }

        // går igenom varje uppgift och skapa rätt sorts HTML element


        data.tasks.forEach(task => {
            if (isMobile) {
                // MOBIL LAYOUT: Bygger upp ett "kort" med staplad info
                let card = document.createElement("div");
                card.className = "task-card-mobile";
                card.innerHTML = `
                    <div class="task-info">
                        <div class="task-row"><strong>${task.datum}</strong> <span>${task.tid}</span></div>
                        <div class="task-main"><strong>${task.aktivitet}</strong></div>
                        <div class="task-desc">${task.beskrivning}</div>
                    </div>
                    <div class="action-buttons">
                        <a href="#redigera-fomular" onclick='fyllRedigeraFormular(${JSON.stringify(task)})'>Redigera</a>
                        <button class="btn-outline btn-delete" style="margin-left:10px;">Radera</button>
                    </div>
                `;
                target.appendChild(card);
            } else {


                // DESKTOP LAYOUT: Bygger upp en rad i en tabell/lista
                let rad = document.createElement("ul");
                rad.className = "lista";
                rad.innerHTML = `
                    <li style="width: 15%;">${task.datum}</li>
                    <li style="width: 10%;">${task.tid}</li>
                    <li style="width: 25%;">${task.aktivitet}</li>
                    <li style="width: 30%;">${task.beskrivning}</li>
                    <li class="right" style="width: 20%;">
                        <div class="action-buttons">
                            <a href="#redigera-fomular" class="btn-outline" onclick='fyllRedigeraFormular(${JSON.stringify(task)})'>Redigera</a>
                            <button class="btn-outline btn-delete">Radera</button>
                        </div>
                    </li>
                `;
                target.appendChild(rad);
            }
        });
    });
}

// fyller i formuläret med värden från den uppgift man klickat på
function fyllRedigeraFormular(task) {
    const editSection = document.getElementById("redigera-fomular");
    const inputs = editSection.querySelectorAll("input, select");



    // placerar data i respektive input-fält baserat på ordning
    inputs[0].value = task.aktivitet;
    inputs[1].value = task.datum;
    inputs[2].value = task.tid;
    inputs[3].value = task.beskrivning;
}


// visar/döljer formuläret på mobila enheter
function toggleMobilForm() {
    const form = document.getElementById("mobile-log-form");
    form.style.display = (form.style.display === "none") ? "block" : "none";
}



// samlar in data från formulären och loggar i konsolen
function sparaNyUppgift(isMobile) {




    // väljer rätt ID namn beroende på om vi sparar från mobil eller desktop
    const data = {
        aktivitet: document.getElementById(isMobile ? "mobile-task-activity" : "desktop-select-id").value,
        datum: document.getElementById(isMobile ? "mobile-task-date" : "desktop-date-id").value,
    };

    console.log("Sparar uppgift:", data);



    // stänger mobilmenyn om det var därifrån vi sparade
    if(isMobile) toggleMobilForm();
}