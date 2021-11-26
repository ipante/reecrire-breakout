/* Voici le kit de lancement Kaboom js pour cette journée !

Voici quelques ressources pour vous aider
La documentation de Kaboom : https://kaboomjs.com/
Des codes d'exemple : https://kaboomjs.com/play?demo=add

Kaboom dispose de plusieurs fonctions pour créer de l'alétoire !
rand(), mais aussi randi(), randSeed...
sans compter l'utilisation 

Bon codage !

Signé, Isaac Pante
*/

// l'objet Kaboom
// définissez les propriétés générales ici
kaboom({
	background: [0,0,0]
})

// charger les images
loadSprite("tuile","images/tuile.png")
loadSprite("coeur","images/coeur.png")

// charger les sons
loadSound("musique", "audio/before_the_dawn.ogg")
loadSound("reussite", "audio/reussite.wav")
loadSound("echec", "audio/echec.wav")

// déclaration d'une scène
// les scènes découpent le jeu
scene("accueil", () => {
	// lancer la musique
	const musique = play("musique")
	add([
		// créer un objet texte
		text("appuyez sur la barre d'espace"),
		// placer le point d'accroche au centre
		origin("center"),
		// placer le texte au centre
		pos(center()),
	]);
	onKeyPress("space",() =>{
		// charger la scène "jeu"
		go("jeu")
		musique.stop()
	})
})

// déclaration de la scène de jeu
scene("jeu",() => {
	// initialisation des variables globales
	// score à zéro et vies à 3
	let score = 0
	let vies = 3
	let vitesse = 800;
	// dessiner un niveau
	addLevel([
		"==============",
		"==x========x==",
		"==x========x==",
		"======  ======",
		"==============",
		"==============",
		"=xxx=x==x=xxx=",
	], {
		// définir la taille de chaque élément
		width : 65,
		height : 33,
		// définir où positionner le début de la grille
		pos : vec2(100, 200),
		// associer chaque symbole à un composant
		"=" : () => [
			// joindre le sprite
			sprite("tuile"),
			// modifier sa couleur
			color(255,0,0),
			// ajouter une bordure
			outline(4,10),
			// donner une hitbox
			area(),
			// rendre l'élément réactif aux collisions
			solid(),
			// lui donner un identifiant
			// pour les interactions à venir
			"brique"
		],
		"x" : () => [
			sprite("tuile"),
			color(255,0,255),
			outline(4,10),
			area(),
			solid(),
			// ici on utilise deux identifiants
			// pour associer deux comportements
			// distincts
			"brique",
			"special"
		]
	})
	// le palet
	const palet = add([
		pos(vec2(width()/2 - 40, height()-40)),
		rect(120, 20),
		outline(4),
		origin("center"),
		area(),
		"paddle",
	])

	// le texte pour le score
	add([
		text(score),
		pos(100,100),
		origin("center"),
		z(50),
		// lier le texte au score
		// et le faire évoluer en fonction
		{update(){ this.text = score }}
		// notez que ce bloc est un simple objet
		// ajouter à notre composant de score
	])

	// observer chaque mouvement du paddle et y
	// associer le mouvement de la souris
	onUpdate("paddle", (p) => {
		p.pos.x = mousePos().x
	})

	// ajouter la balle
	const ball = add([
		pos(width()/2,height()-55),
		// créer un cercle de rayon 16
		circle(16),
		outline(4),
		area({
			width: 32,
			height: 32,
			offset: vec2(-16)
		}),
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
	ball.onUpdate(() => {
		// déplacer la balle
		ball.move(ball.velocite.scale(vitesse))
		// gérer les rebonds sur les murs latéraux...
		if (ball.pos.x < 0 || ball.pos.x > width()) {
			// et renvoyer la balle
			ball.velocite.x = -ball.velocite.x
		}
		// si la balle tape au sommet...
		if(ball.pos.y < 0){
			// elle repart dans l'autre sens
			ball.velocite.y = -ball.velocite.y
		}
		// gérer le cas où la balle sort par le bas
		if (ball.pos.y > height()+60) {
			// secouer l'écran
			shake(30)
			play("echec")
			// réinitialiser la balle, sa vitesse, etc.
			ball.pos.x = width()/2
			ball.pos.y = height()-55
			vitesse = 320
			ball.velocite = dir(rand(220,290))
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
	ball.onCollide("paddle", (p) => {
		vitesse += 60
		// renvoyer la balle avec le bon angle
		ball.velocite = dir(ball.pos.angle(p.pos))
	})
	// avec tous les types de briques
	// grâce à l'identifiant "brique"
	ball.onCollide("brique", (b) => {
		play("reussite")
		b.destroy()
		// augmenter le score
		score++
		ball.velocite = dir(ball.pos.angle(b.pos))
	})
	// avec les briques spéciales
	// grâce à l'identifiant "special"
	ball.onCollide("special", (b) => {
		play("reussite")
		b.destroy()
		// Kaboom ne gère que le rgb, mais des fonctions
		// de conversions nous permettent d'utiliser du hsl !
		palet.color = hsl2rgb((time() * 0.2 + 1 * 0.1) % 1, 0.7, 0.8)
		// transformer aléatoirement la taille du palet
		palet.width = randi(50,200)
		palet.height = randi(20,100)
		ball.velocite = dir(ball.pos.angle(b.pos))
	})
})

// déclaration de la scène d'échec
scene("ohno", ({score}) => {
	add([
		text(`Vous avez perdu... \net fait ${score} points !`, {width : width()}),
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

Et ensuite, pourquoi ne pas afficher les vies ?
Une image "coeur.png" vous attend dans les assets.

Et ensuite, en route pour l'incertitude !
*/