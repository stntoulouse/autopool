// gestion du bouton ajouter un pooler
document.getElementById('add-pooler').addEventListener("click", addPooler);
document.getElementById('new-pooler').addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        addPooler();
    }
});

function addPooler() {
    let newPoolerName = document.getElementById('new-pooler').value;
    if (newPoolerName != '') {
        document.getElementById('new-pooler').value = '';
        POOLERS_NAMES.push(newPoolerName);
        let position = POOLERS_NAMES.length - 1;
        document.getElementById('poolers-list').innerHTML += '<div class="pooler" id="pooler-' + position + '">' + newPoolerName + '<div id="players-of-' + position + '"></div></div>';
    }
}