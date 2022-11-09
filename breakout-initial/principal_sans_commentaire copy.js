// paddle et déplacement du paddle
// balle et rebonds avec le bord
// briques
// interactions avec les briques

// 0 : mise en place
kaboom({
  background: [0, 0, 0],
  width: 1200,
  height: 800,
});

loadRoot("assets/");

loadSprite("tuile", "images/tuile.png");

loadSound("musique", "audio/before_the_dawn.ogg");
loadSound("reussite", "audio/reussite.wav");
loadSound("echec", "audio/echec.wav");

// 1 : scène d'accueil

scene("accueil", () => {
  const musique = play("musique");
  add([
    text("Appuyez sur la barre d'espace pour jouer !", {
      width: 800,
    }),
    origin("center"),
    pos(center()),
  ]);

  onKeyPress("space", () => {
    go("jeu");
    musique.stop();
  });
});
// > lancer la scène
// > ajouter scène gameover

// 2 : scène de jeu

scene("jeu", () => {
  let score = 0;
  let vies = 3;
  let vitesse = 1800;

  // 3 : ajouter le palet

  const palet = add([
    pos(vec2(width() / 2 - 40, height() - 40)),
    rect(120, 20),
    outline(4),
    origin("center"),
    area(),
    "paddle",
  ]);

  // 4 : mouvements palet

  onUpdate("paddle", (p) => {
    p.pos.x = mousePos().x;
  });

  // 5 : ajout de la balle

  const ball = add([
    pos(width() / 2, height() - 55),
    circle(16),
    outline(4),
    area({
      width: 32,
      height: 32,
      offset: vec2(-16),
    }),
    {
      velocite: dir(rand(-60, -40)),
    },
  ]);

  // 6 : mouvements de la balle && perte de vie

  ball.onUpdate(() => {
    ball.move(ball.velocite.scale(vitesse));
    if (ball.pos.x < 0 || ball.pos.x > width()) {
      ball.velocite.x = -ball.velocite.x;
    }
    if (ball.pos.y < 0) {
      ball.velocite.y = -ball.velocite.y;
    }
    if (ball.pos.y > height() + 60) {
      shake(30);
      play("echec");
      ball.pos.x = width() / 2;
      ball.pos.y = height() - 55;
      vitesse = 320;
      ball.velocite = dir(rand(220, 290));
      vies--;
      if (vies == 0) {
        go("gameover", { score: score });
      }
    }
  });

  // 7 : interactions balle palet

  ball.onCollide("paddle", (p) => {
    vitesse += 60;
    ball.velocite = dir(ball.pos.angle(p.pos));
  });

  // 8 : ajout du niveau

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
        color(255, 0, 255),
        outline(4, 10),
        area(),
        solid(),
        "brique",
        "special",
      ],
    }
  );

  // 9 : interactions balle et mur (2 types)

  ball.onCollide("brique", (b) => {
    play("reussite");
    b.destroy();
    score++;
    ball.velocite = dir(ball.pos.angle(b.pos));
  });
  ball.onCollide("special", (b) => {
    play("reussite");
    b.destroy();
    palet.color = hsl2rgb((time() * 0.2 + 1 * 0.1) % 1, 0.7, 0.8);
    palet.width = randi(50, 200);
    palet.height = randi(20, 100);
    ball.velocite = dir(ball.pos.angle(b.pos));
  });

  // 10 : ajout du score

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

  // 11 : évolution

  onUpdate("score", (s) => {
    s.text = score;
  });
});

// 12 : scène échec

scene("gameover", ({ score }) => {
  add([
    text(`Vous avez perdu... \net fait ${score} points !`, {
      width: width(),
    }),
    origin("center"),
    pos(center()),
  ]);
  onKeyPress("space", () => {
    go("accueil");
  });
});

// 1

go("accueil");
