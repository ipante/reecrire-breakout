kaboom({
	background: [0,0,0],
	width : 1200,
	height : 800
})

loadRoot("assets/")

loadSprite("tuile","images/tuile.png")
loadSprite("coeur","images/coeur.png")

loadSound("musique", "audio/before_the_dawn.ogg")
loadSound("reussite", "audio/reussite.wav")
loadSound("echec", "audio/echec.wav")

scene("accueil", () => {
	const musique = play("musique")
	add([
		text("Appuyez sur la barre d'espace pour jouer !",{
			width : 800
		}),
		origin("center"),
		pos(center()),
	]);
	loop(0.5, () => {
		add([
			text(choose(["UNIL","EPFL","SLI","CDH","GAMELAB","Lettres"]),{
				width : 800,
				font : "sink",
				size : 48
			}),
			color(randi(0,255),randi(0,255),randi(0,255)),
			origin("center"),
			pos(randi(0,width()),randi(height()-10,height()-200)),
		]);
	})

	onKeyPress("space",() =>{
		go("jeu")
		musique.stop()
	})
})

scene("jeu",() => {
	let score = 0
	let vies = 3
	let vitesse = 800;
	addLevel([
		"==============",
		"==x========x==",
		"==x========x==",
		"======  ======",
		"==============",
		"==============",
		"=xxx=x==x=xxx=",
	], {
		width : 65,
		height : 33,
		pos : vec2(100, 200),
		"=" : () => [
			sprite("tuile"),
			color(255,0,0),
			outline(4,10),
			area(),
			solid(),
			"brique"
		],
		"x" : () => [
			sprite("tuile"),
			color(255,0,255),
			outline(4,10),
			area(),
			solid(),
			"brique",
			"special"
		]
	})
	const palet = add([
		pos(vec2(width()/2 - 40, height()-40)),
		rect(120, 20),
		outline(4),
		origin("center"),
		area(),
		"paddle",
	])

	add([
		text(score,{
			font : "sink",
			size : 48
		}),
		pos(100,100),
		origin("center"),
		z(50),
		{update(){ this.text = score }}
	])

	onUpdate("paddle", (p) => {
		p.pos.x = mousePos().x
	})

	const ball = add([
		pos(width()/2,height()-55),
		circle(16),
		outline(4),
		area({
			width: 32,
			height: 32,
			offset: vec2(-16)
		}),
		{
			velocite: dir(rand(-60,-40))
		},
	])

	ball.onUpdate(() => {
		ball.move(ball.velocite.scale(vitesse))
		if (ball.pos.x < 0 || ball.pos.x > width()) {
			ball.velocite.x = -ball.velocite.x
		}
		if(ball.pos.y < 0){
			ball.velocite.y = -ball.velocite.y
		}
		if (ball.pos.y > height()+60) {
			shake(30)
			play("echec")
			ball.pos.x = width()/2
			ball.pos.y = height()-55
			vitesse = 320
			ball.velocite = dir(rand(220,290))
			vies--
			if(vies==0){
				go("ohno",{score : score})
			}

		}
	})

	ball.onCollide("paddle", (p) => {
		vitesse += 60
		ball.velocite = dir(ball.pos.angle(p.pos))
	})
	
	ball.onCollide("brique", (b) => {
		play("reussite")
		b.destroy()
		score++
		ball.velocite = dir(ball.pos.angle(b.pos))
	})
	ball.onCollide("special", (b) => {
		play("reussite")
		b.destroy()
		palet.color = hsl2rgb((time() * 0.2 + 1 * 0.1) % 1, 0.7, 0.8)
		palet.width = randi(50,200)
		palet.height = randi(20,100)
		ball.velocite = dir(ball.pos.angle(b.pos))
	})
})

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

go('accueil');