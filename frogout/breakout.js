kaboom({
    background: [0, 0, 0],
    width: 1200,
    height: 800,
})

loadRoot("assets/");

loadSprite("tuile", "images/tuile.png");

loadSound("musique", "audio/before_the_dawn.ogg");
loadSound("reussite", "audio/reussite.wav");
loadSound("echec", "audio/echec.wav");

scene("accueil", () => {
    const musique = play("musique");
    add([
        text("Appuyez sur la barre d'espace pour jouer !", {
            width: 800,
        }),
        origin("center"),
        pos(center())
    ]);

    onKeyPress("space", () => {
        go("jeu");
        musique.stop();
    })
})

scene("jeu", () => {
    let score = 0;
    let vies = 3;
    let vitesse = 800;

    const palet = add([
        pos(vec2(width() / 2 - 40, height() - 40)),
        rect(120, 20),
        outline(4),
        origin("center"),
        area(),
        "palet"
    ]);

    onUpdate("palet", (p) => {
        p.pos.x = mousePos().x
    })

    const balle = add([
        pos(width() / 2, height() - 55),
        circle(16),
        outline(4),
        area({
            width: 32,
            height: 32,
            offset: vec2(-16),
        }),
        {
            velocite: Vec2.fromAngle(rand(-60, -40))
        }
    ]);

    balle.onUpdate(() => {
        balle.move(balle.velocite.scale(vitesse));
        if (balle.pos.x < 0 || balle.pos.x > width()) {
            balle.velocite.x = -balle.velocite.x
        }
        if (balle.pos.y < 0) {
            balle.velocite.y = -balle.velocite.y
        }
        if (balle.pos.y > height()) {
            vies--;
            play("echec");
            shake(30);
            balle.pos.x = width() / 2;
            balle.pos.y = height() - 55;
            vitesse = 800;
            balle.velocite = Vec2.fromAngle(rand(-60, -40));
            if (vies == 0) {
                go("gameover", { score_final: score })
            }
        }
    });

    balle.onCollide("palet", () => {
        vitesse += 60;
        balle.velocite = Vec2.fromAngle(balle.pos.angle(palet.pos))
    })

    addLevel(
        [
            "======  ======",
            "==xx======xx==",
            "==============",
            "======xx======",
            "  ==========  ",
            "==============",
            "=xxx======xxx=",
            "====xxxxxx====",
        ],
        {
            width: 65,
            height: 33,
            pos: vec2(100, 200),
            "=": () => [
                sprite("tuile"),
                color(0, 255, 0),
                outline(4, 10),
                area(),
                solid(),
                "brique"
            ],
            "x": () => [
                sprite("tuile"),
                color(150, 50, 255),
                outline(4, 10),
                area(),
                solid(),
                "brique",
                "special"
            ],
        }
    );

    balle.onCollide("brique", (b) => {
        play("reussite");
        b.destroy();
        score = score + 1;
        balle.velocite = Vec2.fromAngle(balle.pos.angle(b.pos))
        vitesse += 10
    })
    balle.onCollide("special", (b) => {
        score++;
        let new_balle = randi(10,24)
        balle.radius = new_balle
        balle.area.width = new_balle*2
        balle.area.height = new_balle*2
        balle.area.offset = vec2(-new_balle)
        palet.width = palet.width - 5
        // ajouter une balle
        // balle + rapide
    })

    add([
        text(score, {
            font: "sink",
            size: 48
        }),
        pos(100, 100),
        origin("center"),
        z(50),
        "score",
    ])

    onUpdate("score", (s) => {
        s.text = score
    })
})
scene("gameover", ({ score_final }) => {
    add([
        text("Vous avez perdu ! Votre score est de " + score_final + " points !", {
            width: 800,
        }),
        origin("center"),
        pos(center())
    ])
})

go("accueil")