kaboom({ background: [0, 0, 0], width: 1200, height: 800 });

loadRoot("assets/");

loadSprite("tuile", "images/tuile.png");

loadSound("musique", "audio/before_the_dawn.ogg");
loadSound("reussite", "audio/reussite.wav");
loadSound("echec", "audio/echec.wav");

scene("accueil", () => {
  const musique = play("musique");
  add([
    text("Appuyez sur le bouton A pour jouer !", {
      width: 800,
    }),
    origin("center"),
    pos(center()),
  ]);

  onUpdate("text", () => {
    pollGamepads();
    if (gamepads[0]) {
      const buttons = gamepads[0].buttons;
      const buttonsPressed = [];
      buttons.forEach((b, i) => {
        if (b.pressed) buttonsPressed.push(i);
      });

      if (buttonsPressed.includes(0)) {
        go("jeu");
        musique.stop();
      }
    }
  });
});

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
    "palet",
  ]);

  onUpdate("palet", () => {
    // palet.pos.x = mousePos().x;
    pollGamepads();
    const buttons = gamepads[0].buttons;
    const buttonsPressed = [];
    buttons.forEach((b, i) => {
      if (b.pressed) buttonsPressed.push(i);
    });

    if (buttonsPressed.includes(14)) {
      palet.pos.x -= buttonsPressed.includes(2) ? 20 : 10;
    } else if (buttonsPressed.includes(15)) {
      palet.pos.x += buttonsPressed.includes(2) ? 20 : 10;
    }
  });

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
      velocite: Vec2.fromAngle(rand(-60, -40)),
    },
  ]);

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
        go("gameover", { score: score });
      }
    }
  });

  balle.onCollide("palet", () => {
    vitesse += 60;
    balle.velocite = Vec2.fromAngle(balle.pos.angle(palet.pos));
  });

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
      width: 65,
      height: 33,
      pos: vec2(100, 200),
      "=": () => [
        sprite("tuile"),
        color(255, 0, 0),
        outline(4, 10),
        area(),
        solid(),
        "brique",
      ],
      x: () => [
        sprite("tuile"),
        color(0, 255, 0),
        outline(4, 10),
        area(),
        solid(),
        "brique",
        "special",
      ],
    }
  );

  balle.onCollide("brique", (b) => {
    play("reussite");
    b.destroy();
    score++;
    balle.velocite = Vec2.fromAngle(balle.pos.angle(b.pos));
  });

  balle.onCollide("special", (b) => {
    play("reussite");
    b.destroy();
    palet.color = hsl2rgb((time() * 0.2 + 1 * 0.1) % 1, 0.7, 0.8);
    palet.width = randi(50, 200);
    palet.height = randi(20, 100);
    balle.velocite = Vec2.fromAngle(balle.pos.angle(b.pos));
  });

  add([
    text(score, {
      font: "sink",
      size: 48,
    }),
    pos(100, 100),
    origin("center"),
    z(50),
    "score",
  ]);

  onUpdate("score", (s) => {
    s.text = score;
  });
});

scene("gameover", ({ score }) => {
  add([
    text(
      `Vous avez perdu... et fait ${score} point ! Appuyez sur B pour retourner au menu`,
      {
        width: width(),
      }
    ),
    origin("center"),
    pos(center()),
  ]);

  onUpdate("text", () => {
    pollGamepads();
    if (gamepads[0]) {
      const buttons = gamepads[0].buttons;
      const buttonsPressed = [];
      buttons.forEach((b, i) => {
        if (b.pressed) buttonsPressed.push(i);
      });

      if (buttonsPressed.includes(1)) {
        go("accueil");
      }
    }
  });
});

go("accueil");
