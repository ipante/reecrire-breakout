/* Voici le kit de lancement Kaboom js pour cette journée !

Cette version enrichie ajoute

- la gestion de plusieurs niveaux
- des conditions de victoire
- une scène de victoire
- un mode debug

Il est recommandé de ne lire cette version qu'une fois
le kaboom initial bien compris !

Isaac Pante

*/

// l'objet Kaboom
// définissez les propriétés générales ici
kaboom({
	background: [0,0,0],
	width : 1200,
	height : 800
})

// définir un chemin racine pour les ressources
// Ctte étape est facultative, elle sert juste
// à raccourcir les chemins suivants
loadRoot("assets/")

// charger les images
loadSprite("tuile","images/tuile.png")
loadSprite("coeur","images/coeur.png")

// charger les sons
loadSound("musique", "audio/before_the_dawn.ogg")
loadSound("reussite", "audio/reussite.wav")
loadSound("echec", "audio/echec.wav")

// définir des niveaux qui seronts récupérés
// par la suite
const niveaux = [
	[
		"==============",
		"==x========x==",
		"==x========x==",
		"======  ======",
		"==============",
		"==============",
		"=xxx=x==x=xxx=",
	],
	[
		"xxxxxxxxxxxxxx",
		"x=============",
		"x==        ==x",
		"x==        ==x",
		"x==        ==x",
		"x============x",
		"xxxxxxxxxxxxxx",
	]

]

let niveau_actuel = 0;

// déclaration d'une scène
// les scènes découpent le jeu
scene("accueil", () => {
	// lancer la musique
	const musique = play("musique")
	add([
		// créer un objet texte
		// le second paramètre permet de modifier son style
		text("Appuyez sur la barre d'espace pour jouer !",{
			width : 800
		}),
		// placer le point d'accroche au centre
		origin("center"),
		// placer le texte au centre
		pos(center()),
	]);
	// ajout de plusieurs textes affichés aléatoirement
	// ici, on lancer une boucle tooutes les ½ secondes
	loop(0.5, () => {
		add([
			// le texte est tiré aléatoirement dans ce tableau
			text(choose(["UNIL","SLI","GAMELAB","Lettres"]),{
				width : 800,
				font : "sink",
				size : 48
			}),
			// la couleur est ajoutée en rgb (red, green, blue)
			// on tire à chaque fois nombre entre 0 et 255
			// randi() garantit qu'il s'agit d'un entier
			// au contraire de rand()
			color(randi(0,255),randi(0,255),randi(0,255)),
			origin("center"),
			pos(randi(0,width()),randi(height()-10,height()-200)),
		]);
	})

	// ajout d'un événement pour lancer l'autre scène
	onKeyPress("space",() =>{
		// charger la scène "jeu"
		go("jeu")
		musique.stop()
	})
})

// déclaration de la scène de jeu
scene("jeu",() => {

	// initialisation des variables globales
	// score à zéro, vies à 3
	let score = 0
	let vies = 3
	let vitesse = 800;
	let mode_debug = false;

	// dessiner un niveau
	addLevel(niveaux[niveau_actuel], {
		// définir la taille de chaque élément
		width : 65,
		height : 33,
		// définir où positionner le début de la grille
		pos : vec2(175, 200),
		// associer chaque symbole à un composant
		"=" : () => [
			// joindre le sprite
			sprite("tuile"),
			// modifier sa couleur
			color(255,0,0),
			// ajouter une bordure
			outline(4,10),
			// Définir son origine (coordonnées de positionnement)
			origin("center"),
			// donner une hitbox
			area(),
			// rendre l'élément réactif aux collisions
			solid(),
			// lui donner un identifiant
			// pour les interactions à venir
			"brique",
			z(1),
		],
		"x" : () => [
			sprite("tuile"),
			color(255,0,255),
			outline(4,10),
			origin("center"),
			area(),
			solid(),
			// ici on utilise deux identifiants
			// pour associer deux comportements
			// distincts
			"brique",
			"special",
			z(1)
		]
	})

	// ajouter un fond
	const fond = add([
		// placer ce rectangle tout au fond
		z(0),
		rect(width(),height()),
		pos(0,0),
		color(0,0,0)
	])

	// le palet
	const palet = add([
		pos(vec2(width()/2 - 40, height()-40)),
		rect(120, 20),
		outline(4),
		origin("center"),
		area(),
		"paddle",
		z(1)
	])

	// le texte pour le score
	add([
		text(score,{
			font : "sink",
			size : 48
		}),
		pos(100,100),
		origin("center"),
		z(50),
		// lier le texte au score
		// et le faire évoluer en fonction
		{update(){ this.text = score }}
		// notez que ce bloc est un simple objet
		// ajouter à notre composant de score
	])

	// effectuer une action 60 fois par seconde
	onUpdate("paddle", (p) => {
		// si nous ne sommes pas en mode debug
		if(!mode_debug){
			// fixer une vitesse normale
			vitesse = 800
			// la balle se déplace en suivant le palet
			palet.pos.x = mousePos().x
		}
		// si nous sommes en mode debug
		else{
			// le palet va tout seule à toute vitesse
			// en adoptant exactement la positiion de la balle
			vitesse = 1200
			palet.pos.x = balle.pos.x
			// le fond change de couleur
			const t = time() * 10
			// le fond varie en valeur de rouge
			// de 127 à 255 et évolue en fonction du temps
			fond.color.r = wave(127, 255, t)
			// le fond varie en valeur de bleu
			// de 127 à 255 et évolue en fonction du temps
			// le décalage permet de croiser les couleurs
			fond.color.b = wave(127, 255, t+1)
		}
	})		

	// ajouter la balle
	const balle = add([
		pos(width()/2,height()-55),
		// créer un cercle de rayon 16
		origin("center"),
		circle(16),
		outline(4),
		area({
			width: 26,
			height: 26,
		}),
		solid(),
		{
			// dir extrait le vecteur de direction
			// à partir d'un angle donné
			velocite: dir(rand(-60,-40))
			// notez que nous définissons velocite ici
			// il n'appartient pas au langage
		},
	])

	// dès que la balle "change"
	// on effectue un certain nombre de tests
	balle.onUpdate(() => {
		// déplacer la balle
		balle.move(balle.velocite.scale(vitesse))
		// gérer les rebonds sur les murs latéraux...
		if (balle.pos.x < 0 || balle.pos.x > width()) {
			// on la contraint aux limites
			if (balle.pos.x < 0) balle.pos.x = 0;
      		if (balle.pos.x > width()) balle.pos.x = width();
			// et renvoyer la balle
			balle.velocite.x = -balle.velocite.x
		}
		// si la balle tape au sommet...
		if(balle.pos.y < 0){
			// on la contraint à 0 
			balle.pos.y = 0;
			// elle repart dans l'autre sens
			balle.velocite.y = -balle.velocite.y
		}
		// gérer le cas où la balle sort par le bas
		if (balle.pos.y > height()+60) {
			// secouer l'écran
			shake(30)
			play("echec")
			// réinitialiser la balle, sa vitesse, etc.
			balle.pos.x = width()/2
			balle.pos.y = height()-55
			vitesse = 1320
			balle.velocite = dir(rand(220,290))
			// diminuer les vies
			vies--
			// s'il n'y en a plus...
			if(vies==0){
				// appel de la scène d'échec
				// et passage d'un paramètre qui sera récupéré
				// dans cette scène
				go("ohno",{score : score})
			}

		}
	})

	// gérer les collisions
	// avec le paddle
	balle.onCollide("paddle", (p) => {
		vitesse += 60
		// renvoyer la balle avec le bon angle
		balle.velocite = dir(balle.pos.angle(p.pos))
	})
	// avec tous les types de briques
	// grâce à l'identifiant "brique"
	balle.onCollide("brique", (b) => {
		play("reussite")
		score++
		// renvoyer la balle
		gérerCollision(balle, b);

		// Détruire la brique
		b.destroy();

		// vérifier si cette brique
		// était la dernière du plateau
		if(get('brique').length == 0){
			// vérifier s'il y a encore des niveaux
			if(niveau_actuel < niveaux.length-1){
				// si oui, charger le niveau
				niveau_actuel++
				go('jeu')
			}
			else{
				// sinon, envoyer la victoire
				go('ohyes');
			}
			
		}
	})
	// avec les briques spéciales
	// grâce à l'identifiant "special"
	balle.onCollide("special", (b) => {
		// Kaboom ne gère que le rgb, mais des fonctions
		// de conversions nous permettent d'utiliser du hsl !
		palet.color = hsl2rgb((time() * 0.2 + 1 * 0.1) % 1, 0.7, 0.8)
		// transformer aléatoirement la taille du palet
		palet.width = randi(50,200)
		palet.height = randi(20,100)
	})

	// mode debug
	onKeyPress("d",()=>{
		// changer le mode
		mode_debug ? mode_debug = false : mode_debug = true
		// masquer la couleur de fond
		fond.color = rgb(0, 0, 0)
		fond.opacity = 1
	})
})

function gérerCollision(balle, brique) {
	const coté = testerCoté(balle, brique);
	appliquerRebond(balle, coté);
}

function testerCoté(balle, brique) {
	// Tester sur quels coté la collision a eu lieu
	const briqueXMin = brique.pos.x - brique.width/2 - balle.area.width/2;
	const briqueXMax = brique.pos.x + brique.width/2 + balle.area.height/2;
	if (balle.pos.x > briqueXMin && balle.pos.x < briqueXMax) {
		// Cotés horizontaux
		return 'horizontal';
	} else {
		// Cotés verticaux
		return 'vertical';
	}
}

function appliquerRebond(balle, coté) {
	// Ce rebond est incomplet, il faudrait ajouter le vecteur de déplacement
	// (collision.displacement). Dans le cas d'un rebond sur une face
	// horizontale, une part verticale et -2 parts horizontales.
	// Nous pouvons négliger ceci tant que la vitesse de la balle reste
	// raisonnable.
	if (coté === 'horizontal') {
		// on inverse la composante verticale de la vélocité
		balle.velocite.y = -balle.velocite.y;
	} else {
		// on inverse la composante horizontale de la vélocité
		balle.velocite.x = -balle.velocite.x;
	}
}

// déclaration de la scène d'échec
scene("ohno", ({score}) => {
	add([
		text(`Vous avez perdu... \net fait ${score} points !\nAppuyez sur espace pour rejouer.`, {width : width()}),
		origin("center"),
		pos(center()),
	]);
	onKeyPress("space",() =>{
		go("accueil")
	})
})

// déclaration de la scène de victoire
scene("ohyes", ({score}) => {
	add([
		text(`Vous avez gagné avec ${score} points ! BRAVO !\nAppuyez sur espace pour rejouer.`, {width : width()}),
		origin("center"),
		pos(center()),
	]);
	onKeyPress("space",() =>{
		go("accueil")
	})
})

// lancer le jeu
go('accueil');

/* Voilà, vous êtes au bout de la lecture de ce script !
A ce stade, je vous recommande de survoler l'entier
de la documentation Kaboom (elle est courte !).
Cela vous donnera un bon aperçu du système.

Et ensuite, pourquoi ne pas commencer par afficher les vies ?
D'ailleurs, une image "coeur.png" vous attend dans les assets.

Et ensuite, vous pourrez vous attacher aux conditions de victoire,
en faisant la part belle à l'incertitude !

*/