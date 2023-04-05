// Initialisation
kaboom({
    background: [0, 0, 0],
    width: 1200,
    height: 800,
})

// Chargement des assets
loadRoot("assets/");

loadSprite("tuile", "images/tuile.png");

loadSound("musique", "audio/before_the_dawn.ogg");
loadSound("reussite", "audio/reussite.wav");
loadSound("echec", "audio/echec.wav");

// Scene d'accueil
scene("accueil", () => {
    // Lancement musique
    const musique = play("musique", {
        volume: 0.8,
        loop: true,
    })

    // Texte d'accueil
    add([
        text("Appuyez sur la barre d'espace pour jouer !", {
            width: 800,
        }),
        anchor("center"),
        pos(center()),
    ]);

    // Interaction avec la barre d'espace
    onKeyPress("space", () => {
        go("jeu");
        musique.paused = true;
    })
});

// Scene du jeu
scene("jeu", () => {
    // variables globales pour une partie
    let score = 0;
    let vies = 3;
    let vitesse = 400;

    // Creation du niveau
    addLevel(
        [
            "==============",
            "==x========x==",
            "==x========x==",
            "======  ======",
            "==============",
            "==============",
            "=xxx=x==x=xxx=",
        ],
        {
            tileWidth: 65,
            tileHeight: 33,
            pos: vec2(100, 200),
            tiles: {
                "=": () => [
                    sprite("tuile"),
                    color(255, 0, 0),
                    outline(4, 10),
                    area(),
                    anchor("center"),
                    body({ isSolid: true }),
                    "brique"
                ],
                x: () => [
                    sprite("tuile"),
                    color(255, 0, 255),
                    outline(4, 10),
                    area(),
                    anchor("center"),
                    body({ isSolid: true }),
                    "brique",
                    "special"
                ],
            }
        }
    );

    // Ajout du palet
    const palet = add([
        pos(vec2(width() / 2 - 40, height() - 40)),
        rect(120, 20),
        outline(4),
        anchor("center"),
        area(),
        "palet"
    ]);

    // Mise a jour du palet
    onUpdate("palet", (p) => {
        p.pos.x = mousePos().x;
    })

    // Ajout balle
    const balle = add([
        pos(width() / 2, height() - 55),
        circle(10),
        outline(4),
        anchor("center"),
        area({
            width: 20,
            height: 20,
        }),
        {
            velocite: Vec2.fromAngle(rand(-60, -40)),
        }
    ]);

    // Mise a jour de la balle
    balle.onUpdate(() => {
        balle.move(balle.velocite.scale(vitesse));

        // "Collisions" avec les bords
        if (balle.pos.x < 0 || balle.pos.x > width()) {
            balle.pos.x = balle.pos.x < 0 ? 0 : width()
            balle.velocite.x = -balle.velocite.x;
        }
        if (balle.pos.y < 0) {
            balle.pos.y = 0
            balle.velocite.y = -balle.velocite.y;
        }

        // Echec (balle qui passe derriere le paddle)
        if (balle.pos.y > height()) {
            shake(30);
            play("echec");
            balle.pos.x = width() / 2;
            balle.pos.y = height() - 55;
            vitesse = 400;
            balle.velocite = Vec2.fromAngle(rand(-60, -40));
            vies--;

            // Perdu : on lance la scene "gameover" et on passe le score
            if (vies == 0) {
                go("gameover", { score_final: score })
            }
        }
    })

    // Collisions
    balle.onCollide("palet", (p) => {
        vitesse += 25;
        balle.velocite.y = -balle.velocite.y;
    })

    balle.onCollide("brique", (b) => {
        play("reussite");
        b.destroy();
        score++;
        balle.velocite.x = (balle.pos.x > b.pos.x + 132.5 || balle.pos.x < b.pos.x + (100-32.5)) ? -balle.velocite.x : balle.velocite.x
        balle.velocite.y = balle.pos.y > b.pos.y + 216.5 || balle.pos.y < b.pos.y + (200-16.5) ? -balle.velocite.y : balle.velocite.y
    })

    balle.onCollide("special", (b) => {
        score++;
        palet.color = rgb(Math.random()*255, Math.random()*255, Math.random()*255)
        palet.width = randi(50, 200);
        palet.height = randi(20, 100);
    })

    // Texte du score
    add([
        text(score, {
            font: "sink",
            width: 48,
        }),
        pos(100, 100),
        anchor("center"),
        z(50),
        {
            update() {
                this.text = score
            }
        }
    ]);
});

// Scene gameover
scene("gameover", ({ score_final }) => {
    // Texte de gameover
    add([
        text(`Perdu ! Votre score est de ${score_final} !`, {
            width: 800,
        }),
        anchor("center"),
        pos(center()),
    ]);

    // Interaction : rediriger vers l'accueil
    onKeyPress("space", () => {
        go("accueil");
    })
});

go("accueil");