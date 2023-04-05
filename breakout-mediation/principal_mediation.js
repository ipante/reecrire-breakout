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

scene("accueil", () => {
   const musique = play("musique", {
      volume: 0.8,
      loop: true
   });
   add([
      text("Appuyez sur la barre d'espace pour jouer !", {
         width: 800,
      }),
      anchor("center"),
      pos(center()),
   ]);
   onKeyPress("space", () => {
      go("jeu");
      musique.paused = true
   });
});

scene("jeu", () => {
   let score = 0;
   let vies = 3;
   let vitesse = 800;
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
               "brique",
            ],
            x: () => [
               sprite("tuile"),
               color(255, 0, 255),
               outline(4, 10),
               area(),
               body({ isSolid: true }),
               "brique",
               "special",
            ],
         }
      }
   );
   const palet = add([
      pos(vec2(width() / 2 - 40, height() - 40)),
      rect(120, 20),
      outline(4),
      anchor("center"),
      area(),
      "paddle",
   ]);

   add([
      text(score, {
         font: "sink",
         size: 48,
      }),
      pos(100, 100),
      anchor("center"),
      z(50),
      {
         update() {
            this.text = score;
         },
      },
   ]);

   onUpdate("paddle", (p) => {
      p.pos.x = mousePos().x;
   });

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
         velocite: Vec2.fromAngle(rand(-60, -40)),
      },
   ]);

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
         ball.velocite = Vec2.fromAngle(rand(220, 290));
         vies--;
         if (vies == 0) {
            go("gameover", { score: score });
         }
      }
   });

   ball.onCollide("paddle", (p) => {
      vitesse += 60;
      ball.velocite = Vec2.fromAngle(ball.pos.angle(p.pos));
   });

   ball.onCollide("brique", (b) => {
      play("reussite");
      b.destroy();
      score++;
      ball.velocite = Vec2.fromAngle(ball.pos.angle(b.pos));
   });
   ball.onCollide("special", (b) => {
      play("reussite");
      b.destroy();
      palet.color = hsl2rgb((time() * 0.2 + 1 * 0.1) % 1, 0.7, 0.8);
      palet.width = randi(50, 200);
      palet.height = randi(20, 100);
      ball.velocite = Vec2.fromAngle(ball.pos.angle(b.pos));
   });
});

scene("gameover", ({ score }) => {
   add([
      text(`Vous avez perdu... \net fait ${score} points !`, {
         width: width(),
      }),
      anchor("center"),
      pos(center()),
   ]);
   onKeyPress("space", () => {
      go("accueil");
   });
});

go("accueil");
