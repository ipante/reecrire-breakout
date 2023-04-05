kaboom({
    width: 1200,
    height: 800,
    background: [0, 0, 0]
});

// Charger image
loadSprite("tuile", "./assets/images/tuile.png");

// Charger les sons
loadSound("musique", "./assets/audio/before_the_dawn.ogg");
loadSound("reussite", "./assets/audio/reussite.wav");
loadSound("echec", "./assets/audio/echec.wav");

// Scène "accueil"
scene("accueil", () => {
    add([
        text("Appuyez sur la barre d'espace pour jouer !", {
            width: 500,
        }),
        anchor("center"),
        pos(center())
    ])

    const musique = play("musique", {
        volume: 0.8,
        loop: true,
    })

    onKeyPress("space", () => {
        go("jeu");
        musique.paused = true;
    })
})

scene("jeu", () => {
    let vies = 3;
    let score = 0;
    let briques_restantes = 3;

    addLevel(
        [
            "==============",
            "==  ======  ==",
            "==============",
            "======  ======",
            "==============",
            "==  ======  ==",
            "==============",
        ],
        {
            tileWidth: 65,
            tileHeight: 33,
            pos: vec2(150, 200),
            tiles: {
                "=": () => [
                    sprite("tuile"),
                    color(255, 0, 255),
                    outline(4, 10),
                    area(),
                    body({ isSolid: true }),
                    "brique"
                ]
            }
        }
    )

    const palet = add([
        rect(120, 20),
        pos(vec2(width()/2, height()-40)),
        outline(4),
        anchor("center"),
        area(),
        "palet"
    ]);

    onUpdate("palet", (palet) => {
        palet.pos.x = mousePos().x;
    });

    const balle = add([
        circle(10),
        outline(4),
        anchor("center"),
        pos(vec2(width() / 2, height()-60)),
        area({
            width: 20,
            height: 20,
        }),
        {
            velocite: Vec2.fromAngle(rand(-60, -40)),
        }
    ]);

    let vitesse = 600
    balle.onUpdate(() => {
        balle.move(balle.velocite.scale(vitesse))

        if (balle.pos.x < 0 || balle.pos.x > width()) {
            balle.velocite.x = -balle.velocite.x;
        }

        if (balle.pos.y < 0) {
            balle.velocite.y = -balle.velocite.y
        }

        if (balle.pos.y > height()) {
            shake(30);
            play("echec");
            vitesse = 600;
            vies--;
            balle.pos.x = width() / 2;
            balle.pos.y = height()-60;
            balle.velocite = Vec2.fromAngle(rand(-60, -40));
            if (vies == 0) {
                go("gameover", {score_final: score})
            }
        }
    })

    balle.onCollide("palet", () => {
        balle.velocite.y = -balle.velocite.y
        vitesse += 25;
    })

    balle.onCollide("brique", (b) => {
        score++;
        briques_restantes--;
        b.destroy();
        if (balle.pos.x > b.pos.x + 182.5 || balle.pos.x < b.pos.x + (150 - 32.5)) {
            balle.velocite.x = -balle.velocite.x;
        }
        if (balle.pos.y > b.pos.y + 216.5 || balle.pos.y < b.pos.y + (200 - 16.5)) {
            balle.velocite.y = -balle.velocite.y;
        }
        if (briques_restantes == 0 ){
            go("victoire", {score_final: score})
        }
    })

    add([
        text("Vies 3", {
            width: 120,
        }),
        anchor("center"),
        pos(vec2(width()-100, 100)),
        {
            update() {
                this.text = "Vies " + vies
            }
        }
    ])

    add([
        text("Score 0", {
            width: 120,
        }),
        anchor("center"),
        pos(vec2(100, 100)),
        {
            update() {
                this.text = "Score " + score
            }
        }
    ])
})

scene("gameover", ({score_final}) => {
    add([
        text("Vous avez perdu ! Votre score est de : " + score_final + ". Appuyez sur la barre d'espace pour recommencer", {
            width: 800,
        }),
        anchor("center"),
        pos(center())
    ])

    onKeyPress("space", () => {
        go("accueil");
    })
})

scene("victoire", ({score_final}) => {
    let temps = 0;
    add([
        text("Vous avez détruit le mur. Retentez l'expérience en appuyant sur la barre d'espace pour recommencer", {
            width: 800,
        }),
        anchor("center"),
        pos(center()),
        {
            update() {
                temps++;
                if (temps % 15 == 0) {
                    this.color = rgb(rand(0, 255), rand(0, 255), rand(0,255))
                }
            }
        }
    ])

    onKeyPress("space", () => {
        go("accueil");
    })
})

go("accueil") // Aller à la scène "accueil"

