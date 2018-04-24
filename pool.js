//-----------------------------------------------------------------------------------------------
//    DONNEES CODEES EN DUR EN ATTENDANT LA RECUPERATION DES DONNEES SAISIES PAR L'UTILISATEUR
//-----------------------------------------------------------------------------------------------

// var STATS_FILE = 'stats.json';
// var STATS;

// // Charge la liste de stats
// loadStats(function (response) {
//     STATS = response;
// });

var PLACES_DISPO = {
    'C': 3,
    'L': 3,
    'R': 3,
    'D': 4,
    'G': 2,
    'B': 4
};

// var POOLERS_NAMES = [];

//-----------------------------------------------------------------------------------------------

// Recuperation des donnes saisies sur la page de parametrage
var STATS = localStorage.getItem('players');
var POOLERS_NAMES = localStorage.getItem('poolers');

// Previent le chargement de la page sans avoir entre les parametres
if (STATS == null || POOLERS_NAMES == null) {
    window.open('index.html', '_self');
} else {
    STATS = JSON.parse(STATS);
    POOLERS_NAMES = JSON.parse(POOLERS_NAMES);
}



// CLASSE POOLER
function Pooler(pos) {
    this.position = pos;
    this.name = pos;
    this.pool = [];
    this.places_libres = Object.assign({}, PLACES_DISPO);
    this.max_bench = this.places_libres;
    this.points = 0;

    // Retourne la liste des joueurs pour une position donnee
    this.players_by_pos = function (pos) {
        let result = [];
        for (let player of this.pool) {
            if (player[2].toUpperCase() == pos.toUpperCase()) {
                result.push(player);
            }
        }
        return result;
    }

    // Ajoute un joueur sous la forme ['prenom nom', 'equipe', 'position', points]
    this.add_player = function (player) {
        this.pool.unshift(player);
        // Met a jour la liste des joueurs dispos
        // S'il reste de la place au poste du joueur on enleve une place dispo
        if (this.places_libres[player[2]] > 0) {
            this.places_libres[player[2]] -= 1;
            // Sinon, on enleve une dispo sur le bench
        } else {
            this.places_libres['B'] -= 1;
        }
        // Met a jour le nombre de points du pooler
        this.points += player[3];
    }

    // Retire un joueur par son nom
    this.remove_player = function (player_name) {
        // Recherche le joueur a retirer parmis la liste des joueurs du pooler
        for (let i = 0; i < this.pool.length; i++) {
            // Si les noms correspondent
            if (this.pool[i][0].toUpperCase() == player_name.toUpperCase()) {
                // On retire le joueur de la liste du pooler
                let player = this.pool.splice(i, 1);
                // Si le nombre de joueurs a ce poste etait inferieur ou egal aux places autorisees
                if (this.player_by_pos(player[2]).length + 1 < PLACES_DISPO[player[2]]) {
                    // On ajoute une dispo a cette position
                    this.places_libres[player[2]] += 1;
                    // Sinon, le joueur etait sur le bench
                } else {
                    // On ajoute une dispo sur le bench
                    this.places_libres['B'] += 1;
                }
                // On met a jour les points du pooler
                this.points -= player[3];
                break;
            }
        }
    }

    // Retourne les places dispo pour la position choisie incluant le bench
    this.places_dispo_pos = function (pos) {
        return this.places_libres['B'] + this.places_libres[pos.toUpperCase()];
    }
}

// CLASSE POOL
function Pool(nb_poolers = POOLERS_NAMES.length, slots = PLACES_DISPO) {
    this.nb_poolers = nb_poolers;
    this.poolers = [];
    this.slots = slots;
    this.tour_generator = new Draft_rotation(nb_poolers);
    let retour_tour = this.tour_generator.next();
    this.tour = retour_tour[0];
    this.attente = retour_tour[1];
    this.available_players = STATS.slice();
    this.picks = 1;
    // Cree la liste des poolers
    for (let i = 0; i < this.nb_poolers; i++) {
        this.poolers.push(new Pooler(i))
    }

    // Retourne la liste des joueurs dispos pour une position donnee
    this.joueurs_dispo_pos = function (pos) {
        result = [];
        for (pl of this.available_players) {
            if (pl[2].toUpperCase() == pos.toUpperCase()) {
                result.push(pl);
            }
        }
        return result;
    }

    // Ajoute un joueur au pooler qui doit choisir et le retire des joueurs dispos
    this.pooler_pick = function (player, pooler = undefined, auto_next = true) {
        if (pooler == undefined) {
            pooler = this.tour;
        }
        // Ajoute le joueur au pooler
        this.poolers[pooler].add_player(player);
        // Retire le joueur de la liste des joueurs dispos (tient compte des multiples occurences pour les joueurs avec plusieurs postes)
        // this.available_players.unshift(this.available_players.indexOf(player));
        for (pl of this.available_players.slice()) {
            if (pl[0] == player[0] && pl[1] == player[1]) {
                this.available_players.splice(this.available_players.indexOf(pl), 1);
            }
        }
        if (auto_next) {
            // Passe au tour suivant
            let retour_tour = this.tour_generator.next();
            this.tour = retour_tour[0];
            this.attente = retour_tour[1];
            this.picks += 1;
        }
    }

    // Retourne le joueur concidere comme le meilleur choix a ce moment du pool
    this.meilleur_choix = function (bench_pos = ['C', 'L', 'R', 'D', 'G']) {
        if (bench_pos.length == 0) {
            bench_pos = ['C', 'L', 'R', 'D', 'G'];
        }
        let pooler = this.poolers[this.tour];
        // Obtient les postes dispo du pooler hors bench
        let postes_dispo = [];
        for (let poste in pooler.places_libres) {
            if (poste != 'B' && pooler.places_libres[poste] > 0) {
                postes_dispo.push(poste);
            }
        }
        // Si plus de postes dispos hors bench
        if (postes_dispo.length <= 0) {
            // On recupere les positions recherchees pour le bench
            postes_dispo = bench_pos;
        }
        // On cree un dict avec les meilleurs joueurs dispo pour chaque poste recherche
        let players_by_pos = {};
        for (let poste of postes_dispo) {
            // Cree une entree dans le dict pour le poste
            players_by_pos[poste] = [];
            // On cherche tous les joueurs dispo a ce poste
            for (let player of this.available_players) {
                if (player[2] == poste) {
                    // Et on l'ajoute au dict
                    players_by_pos[poste].push(player);
                }
            }
            // Classe les joueurs par points decroissants
            // PYTHON : players_by_pos[poste].sort(key = lambda x: x[3], reverse = True)
            players_by_pos[poste].sort((a,b) => b[3] - a[3]);
        }
        // On cree un array pour le meilleur choix a date
        let best_choice = ['', 0];
        for (let pos in players_by_pos) {
            let points;
            let max_possib_picked_players = 0;
            // Si il y a une attente avant la prochaine opportunite de draft
            if (this.attente.length > 0) {
                // Parcours la liste des joueurs qui vont avoir a choisir avant le prochain tour du pooler
                // La liste d'attente etant toujours symetrique, on marche par paire
                for (let other_pooler of this.attente.slice(0,this.attente.length/2)) {
                    // S'il reste de la place a cette position on ajoute au nombre de pick max pour cette position
                    if (this.poolers[other_pooler].places_dispo_pos(pos) >= 2) {
                        max_possib_picked_players += 2;
                    } else {
                        max_possib_picked_players += 1;
                    }
                }
                // Pour chaque poste on calcule les points du meilleur joueur - les points du joueur de meme pos dispo au prochain tour
                points = players_by_pos[pos][0][3] - players_by_pos[pos][max_possib_picked_players][3];
            // Sinon (on a deux coups bac a bac)
            } else { 
                points = players_by_pos[pos][0][3];
            }
            // Si best joueur a date on met a jour best_choice
            if (points > best_choice[1]) {
                best_choice = [pos, points];
            }
        }
        // On retourne le premier joueur de la position du meilleur choix
        return players_by_pos[best_choice[0]][0]
    }

}


//------------------------------------------------------------------------------
//                             FONCTIONS D'AIDE
//------------------------------------------------------------------------------

// Fonction de chargement des statistiques des joueurs depuis un fichier JSON
function loadStats(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', STATS_FILE, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            let stats = JSON.parse(xobj.responseText);
            // Trie les joueurs par ordre de points decroissants
            stats.sort((a, b) => b[3] - a[3]);
            callback(stats);
        }
    }
    xobj.send(null);
}

// RETOURNE UNE LISTE CLASSEE DES JOUEURS SELON LEUR POSITION
function sort_players(stats, pos) {
    result = [];
    // Cree une liste de tous les joueurs a la position donnee
    for (let player of stats) {
        if (player[2] == pos) {
            result.push(player);
        }
    }
    // Classe la liste par ordre de points decroissants
    result.sort((a, b) => b[3] - a[3]);
    return result;
}

// GENERATEUR POUR LA ROTATION DU DRAFT
function Draft_rotation(poolers) {
    // Generateur pour connaitre num du pooler a jouer et la liste des joueurs avant son prochain choix
    this.rotation = Array.from({length: poolers}, (x,i) => i).concat(Array.from({length: poolers}, (x,i) => poolers-1-i));
    this.longueur = this.rotation.length;
    this.rotation = this.rotation.concat(Array.from({length: poolers}, (x,i) => i));
    this.i = -1;
    this.next = function () {
        this.i += 1;
        if (this.i == this.longueur) {
            this.i = 0;
        }
        let prochain = this.rotation.slice(this.i + 1, this.rotation.indexOf(this.rotation[this.i], this.i + 1));
        // Retourne le numero du joueur qui doit drafter et la liste des tours avant le prochain choix
        // Ex : 0, [1, 2, 3, 3, 2, 1]  ==> Au tour de joueur 0 de choisir. Pourra rechoisir apres joueurs 1, 2, 3, 3, 2, 1
        return [this.rotation[this.i], prochain];
    }
}