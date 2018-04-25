// Outils pour le deroulement du draft

// Creation de l'objet pool
POOL = new Pool();

// Mise en place des poolers
let insertHTML = '';
for (let i = 0; i < POOLERS_NAMES.length; i++) {
    insertHTML += `
    <div class="w3-quarter w3-padding">
        <div class="w3-card w3-container" style="height:280px; overflow-y:auto;" id="pooler-${i}">
            <div class="w3-container w3-center">
                <h2>${POOLERS_NAMES[i]}</h2>
                <p>Total : <span id="total-${i}">0</span> pts</p>
                <h3>Joueurs :</h3>
                <div id="players-${i}"></div>
            </div>
        </div>
    </div>`;
}
document.getElementById('poolers').innerHTML = insertHTML;

updateContent();

// Gestion du bouton drafter
document.getElementById('draft-player').addEventListener('click', function (event) {
    POOL.pooler_pick(POOL.meilleur_choix());
    updateContent();
})

// Met a jour les donnes affiches pour le poolers
function updateContent() {
    for (let i = 0; i < POOLERS_NAMES.length; i++) {
        let insertHTML = '';
        for (let player of POOL.poolers[i].pool) {
            insertHTML += '<p style="font-size:small;">' + formatPlayer(player) + '</p>';
        }
        document.getElementById('players-' + i).innerHTML = insertHTML;
        document.getElementById('total-' + i).innerHTML = POOL.poolers[i].points;
    }
    highlightPooler();
    showBestChoice();
}

// Affichage du meilleur choix
function showBestChoice() {
    document.getElementById('best-choice').innerHTML = formatPlayer(POOL.meilleur_choix());
}


// Met en surbrillance le pooler qui doit choisir un joueur
function highlightPooler() {
    for (let i = 0; i < POOLERS_NAMES.length; i++) {
        document.getElementById('pooler-' + i).classList.remove('w3-theme');
    }
    document.getElementById('pooler-' + POOL.tour).classList.add('w3-theme');
}

// Formate les donnees du joueur pour un affichage a l'ecran
function formatPlayer(player) {
    return '[' + player[2] + '] ' + player[0] + ' (' + player[1] + ') ' + player[3] // + ' pts';
}