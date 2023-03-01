kaboom({
    background: [0, 0, 0],
    width: 1200,
    height: 800,
})

loadRoot("/assets/");

loadSprite("tuile", "images/tuile.png");

loadSound("musique", "audio/before_the_dawn.ogg");
loadSound("reussite", "audio/reussite.wav");
loadSound("echec", "audio/echec.wav");

// Scene d'accueil
scene("accueil", () => {
    const musique = play("musique", {
        volume: 0.8,
        loop: true,
    })
    add([
        text("Appuyez sur la barre d'espace pour jouer !", {
            width: 800,
        }),
        anchor("center"),
        pos(center()),
    ]);
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
    let vitesse = 800;

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
                    body({ isSolid: true }),
                    "brique"
                ],
                x: () => [
                    sprite("tuile"),
                    color(255, 0, 255),
                    outline(4, 10),
                    area(),
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
        area({
            width: 32,
            height: 32,
            offset: vec2(-16)
        }),
        {
            velocite: Vec2.fromAngle(rand(-60, -40)),
        }
    ]);

    // Mise a jour de la balle
    balle.onUpdate(() => {
        balle.move(balle.velocite.scale(vitesse));
        if (balle.pos.x < 0 || balle.pos.x > width()) {
            balle.velocite.x = -balle.velocite.x;
        }
        if (balle.pos.y < 0) {
            balle.velocite.y = -balle.velocite.y;
        }
        if (balle.pos.y > height()) {
            shake(30);
            play("echec");
            balle.pos.x = width() / 2;
            balle.pos.y = height() - 55;
            vitesse = 800;
            balle.velocite = Vec2.fromAngle(rand(-60, -40));
            vies--;
            if (vies == 0) {
                go("gameover", { score_final: score })
            }
        }
    })

    // Collisions
    balle.onCollide("palet", (p) => {
        vitesse += 60;
        balle.velocite = Vec2.fromAngle(balle.pos.angle(p.pos));
    })

    balle.onCollide("brique", (b) => {
        play("reussite");
        b.destroy();
        score++;
        balle.velocite = Vec2.fromAngle(balle.pos.angle(b.pos));
    })

    balle.onCollide("special", (b) => {
        score++;
        palet.color = hsl2rgb((time() * 0.2 + 1 * 0.1) % 1, 0.7, 0.8);
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
    add([
        text(`Perdu ! Votre score est de ${score_final} !`, {
            width: 800,
        }),
        anchor("center"),
        pos(center()),
    ]);
    onKeyPress("space", () => {
        go("accueil");
    })
});

go("accueil");