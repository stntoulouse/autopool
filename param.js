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
    }
    document.getElementById('poolers-list').innerHTML += insertHTML;
}

// importation des joueurs
document.getElementById('stats-file').addEventListener('change', function(event) {
    let reader = new FileReader();

    reader.onload = function(evt) {
        if(evt.target.readyState != 2) return;
        if(evt.target.error) {
            alert('Error while reading file');
            return;
        }

        let filecontent = evt.target.result;
        let stats = JSON.parse(filecontent);
        let insertHTML = '<select size="20">';
        for (let player of stats) {
            insertHTML += '<option>[' + player[2] + '] ' + player[0] + ' (' + player[1] + ') ' + player[3] + ' pts</option>';
        }
        insertHTML += '</select>'
        document.getElementById('players-list').innerHTML = insertHTML;
    };

    reader.readAsText(event.target.files[0]);
});