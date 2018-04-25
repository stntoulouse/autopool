// Outils pour la preparation du pool :
//     - Selection des poolers
//     - Chargement des statistiques des joueurs
//     - Bouton de lancement du pool

var POOLERS = [];
var PLAYERS = [];

// Ajout d'un pooler a la liste
document.getElementById('new-pooler').addEventListener('keyup', function (event) {
    if (event.key == 'Enter') {
        addPooler();
    }
});
document.getElementById('add-pooler').addEventListener('click', addPooler);

function addPooler() {
    let poolerName = document.getElementById('new-pooler').value;
    let insertHTML;
    document.getElementById('new-pooler').value = '';
    if (poolerName != '') {
        POOLERS.push(poolerName);
        let position = POOLERS.length - 1;
        insertHTML = '<div class="pooler" id="pooler-' + position + '">[' + (position + 1) + '] ' + poolerName + '</div>';
        document.getElementById('poolers-list').innerHTML += insertHTML;
    }

    activateStartButton();
}

// Importation des joueurs
document.getElementById('select-file').addEventListener('click', function (event) {
    let evt = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
    });
    document.getElementById('stats-file').dispatchEvent(evt);

});

document.getElementById('stats-file').addEventListener('change', function (event) {
    let reader = new FileReader();

    reader.onload = function (evt) {
        if (evt.target.readyState != 2) return;
        if (evt.target.error) {
            alert('Error while reading file');
            return;
        }

        let filecontent = evt.target.result;
        PLAYERS = JSON.parse(filecontent);
        let insertHTML = '<select size="20">';
        for (let player of PLAYERS) {
            insertHTML += '<option>[' + player[2] + '] ' + player[0] + ' (' + player[1] + ') ' + player[3] + ' pts</option>';
        }
        insertHTML += '</select>'
        document.getElementById('players-list').innerHTML = insertHTML;

        activateStartButton();
    };

    reader.readAsText(event.target.files[0]);
});

// Active le bouton si des poolers et des stats ont ete ajoute
function activateStartButton() {
    if (POOLERS.length > 0 && PLAYERS.length > 0) {
        document.getElementById('start-pool').classList.remove('w3-disabled');
    } else {
        if (!document.getElementById('start-pool').classList.contains('w3-disabled')) {
            document.getElementById('start-pool').classList.add('w3-disabled');
        }
    }
}

// Gestion du bouton pour le lancement du pool
document.getElementById('start-pool').addEventListener('click', function (event) {
    if (!document.getElementById('start-pool').classList.contains('w3-disabled')) {
        localStorage.setItem('poolers', JSON.stringify(POOLERS));
        localStorage.setItem('players', JSON.stringify(PLAYERS));
        let positions = { 'C': 0, 'L': 0, 'R': 0, 'D': 0, 'G': 0, 'B': 0 };
        for (let key in positions) {
            positions[key] = document.getElementById('pos-' + key).value;
        }
        localStorage.setItem('positions', JSON.stringify(positions));
        window.open('pool.html', '_self');
    }
});

// Chargement du fichier par defaut
document.getElementById('select-def-file').addEventListener('click', function loadStats() {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'stats.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            PLAYERS = JSON.parse(xobj.responseText);
            // Trie les joueurs par ordre de points decroissants
            PLAYERS.sort((a, b) => b[3] - a[3]);
            let insertHTML = '<select size="20">';
            for (let player of PLAYERS) {
                insertHTML += '<option>[' + player[2] + '] ' + player[0] + ' (' + player[1] + ') ' + player[3] + ' pts</option>';
            }
            insertHTML += '</select>'
            document.getElementById('players-list').innerHTML = insertHTML + '</select>';

            activateStartButton();
        }
    }
    xobj.send(null);
});