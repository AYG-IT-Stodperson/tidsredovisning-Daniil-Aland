// körs automatiskt när webbsidan har laddats klart
window.onload = () => {
    getActivities();
};


// hämtar data just nu är det en hårdkodad lista, och sedan skickar vidare den
async function getActivities() {
    try {
        let response = await fetch("dummy/aktiviteter.json")
        if (response.ok) {
            let data = await response.json()
            fyllLista(data)
    }   else {
        let message = null
        try{
            message=await response.json()
        }   finally {
            let fel ={status:response.status,
            text: response.statusText,
            url: response.url,
            message
            }
        throw fel

        }
    }
}   catch (error) {
    console.error(error)
    }
}


// skapar HTML element för varje aktivitet och placerar dem på sidan
function fyllLista(data) {



    // hittar alla listor (både för desktop och mobil)
    let targets = document.querySelectorAll(".item-list, .item-list-mobil");



    targets.forEach(target => {
        target.innerHTML = ""; // rensar listan innan den fylls på nytt


        // loopar igenom varje aktivitet i datan
        data.activities.forEach(act => {
            let itemDiv = document.createElement("div");
            itemDiv.className = "item activity-card";



            // skapar innehållet för aktiviteten med namn och knappar
            itemDiv.innerHTML = `
                <span class="activity-name">${act.aktivitet}</span>
                <div class="action-buttons">
                    <a href="#redigera-fomular" class="btn-outline" style="text-decoration:none;" 
                       onclick='visaRedigera(${JSON.stringify(act)})'>Redigera</a>
                    <button class="btn-outline btn-delete">Radera</button>
                </div>
            `;

            // lägger till den färdiga diven i listan
            target.appendChild(itemDiv);
        });
    });
}

// visar formuläret för att redigera en specifik aktivitet
function visaRedigera(act) {
    const editSection = document.getElementById("redigera-fomular");
    const input = document.getElementById("edit-activity-name");

    if (editSection && input) {
        input.value = act.aktivitet; // Sätter aktivitetens namn i textfältet
        editSection.style.display = "block"; // Visar sektionen
        editSection.scrollIntoView({ behavior: 'smooth' }); // Scrollar mjukt till formuläret
    }
}


stangRedigera(e)
function stangRedigera(e) {
    if (e) {
        e.preventDefault(); // Detta stoppar sidan från att hoppa upp!
    }
    const editSection = document.getElementById("redigera-fomular");
    if (editSection) {
        editSection.style.display = "none";
    }
}