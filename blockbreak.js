$(function() {
  var Q = window.Q = Quintus()
                     .include("Sprites, Scenes, Input, Audio, UI")
					 .enableSound()
                     .setup();

  Q.input.keyboardControls();
  Q.input.touchControls({ 
            controls:  [ ['left','<' ],[],[],[],['right','>' ] ]
  });
  
    function goHTML5Audio() {
    Q.assets = {};
    loadAssetsAndGo();
  }

  function goWebAudio() {
    Q.assets = [];
    Q.audio.enableWebAudioSound();
    loadAssetsAndGo();
  }

  Q.Sprite.extend("Paddle", {     // extend Sprite class to create Q.Paddle subclass
    init: function(p) {
      this._super(p, {
        sheet: 'paddle',
        speed: 225,
        x: 0,
      });
      this.p.x = Q.width/2;
      this.p.y = Q.height - this.p.h;
      if(Q.input.keypad.size) {
        this.p.y -= Q.input.keypad.size + this.p.h;
      }
    },

    step: function(dt) {
      if(Q.inputs['left']) { 
        this.p.x -= dt * this.p.speed;
      } else if(Q.inputs['right']) {
        this.p.x += dt * this.p.speed;
      }
      if(this.p.x < 0) { 
        this.p.x = 0;
      } else if(this.p.x > Q.width) { 
        this.p.x = Q.width;
      }
//      this._super(dt);	      // no need for this call anymore
    }
  });

  Q.Sprite.extend("Ball", {
    init: function() {
      this._super({
        sheet: 'ball',
        speed: 200,
        dx: 1,
        dy: 1,
      });
      this.p.y = Q.height / 2 - this.p.h;
      this.p.x = Q.width / 2 + this.p.w / 2;
	  
	  this.on('hit', this, 'collision');  // Listen for hit event and call the collision method
	  
	  this.on('step', function(dt) {      // On every step, call this anonymous function
		  var p = this.p;
		  Q.stage().collide(this);   // tell stage to run collisions on this sprite

		  p.x += p.dx * p.speed * dt;
		  p.y += p.dy * p.speed * dt;

		  if(p.x < 0) { 
		  Q.audio.play('powerdown');
			p.x = 0;
			p.dx = 1;
		  } else if(p.x > Q.width - p.w) { 
		  Q.audio.play('powerdown');
			p.dx = -1;
			p.x = Q.width - p.w;
		  }

		  if(p.y < 0) {
		  Q.audio.play('powerdown');
			p.y = 0;
			p.dy = 1;
		  } else if(p.y > Q.height) {
		  this.destroy();
		  Q.stage().trigger('decLives');
		  }
	  });
    },
	
	collision: function(col) {                // collision method
		if (col.obj.isA("Paddle")) {
			Q.audio.play('powerup');
//			alert("collision with paddle");
			this.p.dy = -1;
		} else if (col.obj.isA("Block")) {
//			alert("collision with block");
			col.obj.destroy();
			this.p.dy *= -1;
			Q.stage().trigger('removeBlock');
		}
	}
  });

  Q.Sprite.extend("Block", {
    init: function(props) {
      this._super(_(props).extend({ sheet: 'block'}));
      this.on('collision',function(ball) { 
        this.destroy();
        ball.p.dy *= -1;
        Q.stage().trigger('removeBlock');
      });
    }
  });
  
  Q.UI.Text.extend("Score",{
    init: function() {
      this._super({
		color: "orange",
        label: "Score: 0",
        align: "right",
        x: 55,
        y: 18,
        weight: "normal",
        size:18
      });
      Q.state.on("change.score",this,"score");
    },

    score: function(score) {
      this.p.label = "Score: " + score;
    }
  });
  
   Q.UI.Text.extend("Lives",{
    init: function() {
      this._super({
		color: "orange",
        label: "Lives: 3",
        align: "center",
		x: Q.width - 50 ,
        y: 18,
        weight: "normal",
        size:18
      });

      Q.state.on("change.lives",this,"lives");
    },

    lives: function(lives) {
      this.p.label = "Lives: " + lives;
    }
  });
  
  Q.scene('title', function(stage) {
	
	var container = stage.insert(new Q.UI.Container({
      fill: "orange",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      x: Q.width/2,
	  y: Q.height/2 -100,
    }));
	
	  stage.insert(new Q.UI.Text({ 
      label: "Block\nBreak",
      color: "black",
	  align: 'center',
      x: 0,
      y: 0,
	  size: 40
    }),container);
	
	 container.fit(20,20);

    stage.insert(new Q.UI.Text({
	  color: "orange",
      label: " Hit the spacebar to start",
      align: 'center',
      x: Q.width/2,
      y: Q.height/2 + 40,
      weight: "normal",
      size: 20
    }));
	
	
    stage.insert(new Q.UI.Text({
	  color: "orange",
      label: "During the game: use L/R arrow\nkeys to move paddles",
      align: 'center',
      x: Q.width/2,
      y: Q.height/2 + 120,
      weight: "normal",
      size: 20
    }));	
	

Q.input.on('fire',function() {
Q.state.reset({ score: 0, lives: 3 });
   Q.stageScene('game');
  });
  });
  
    Q.scene('gameOver', function(stage) {
	
	var container = stage.insert(new Q.UI.Container({
      fill: "orange",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      x: Q.width/2,
	  y: Q.height/2 - 60,
    }));
	
	  stage.insert(new Q.UI.Text({ 
      label: "Game\nOver!",
      color: "black",
	  align: 'center',
      x: 0,
      y: 0,
	  size: 40
    }),container);
	
	 container.fit(20,20);

    stage.insert(new Q.UI.Text({
	  color: "orange",
      label: " Hit the spacebar to play again",
      align: 'center',
      x: Q.width/2,
      y: Q.height/2 + 60,
      weight: "normal",
      size: 20
    }));
	Q.input.on('fire',function() {
	Q.state.reset({ score: 0, lives: 3 });
	Q.stageScene('game');
		});
  });
  
   Q.scene('win', function(stage) {
	
	var container = stage.insert(new Q.UI.Container({
      fill: "orange",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      x: Q.width/2,
	  y: Q.height/2 - 60,
    }));
	
	  stage.insert(new Q.UI.Text({ 
      label: "You\nWin!",
      color: "black",
	  align: 'center',
      x: 0,
      y: 0,
	  size: 40
    }),container);
	
	 container.fit(20,20);

    stage.insert(new Q.UI.Text({
	  color: "orange",
      label: " Hit the spacebar to play again",
      align: 'center',
      x: Q.width/2,
      y: Q.height/2 + 60,
      weight: "normal",
      size: 20
    }));
	Q.input.on('fire',function() {
	Q.state.reset({ score: 0, lives: 3 });
	Q.stageScene('game');
		});
  });
	
	Q.scene("hud",function(stage) {
    stage.insert(new Q.Score());
    stage.insert(new Q.Lives());
  }, { stage: 1 });

  Q.audio.enableHTML5Sound();
  

  Q.load(['blockbreak.png'], function() {
  Q.load({"brickDeath": "brickDeath.mp3",
          "powerup": "powerup.mp3", 
          "powerdown": "powerdown.mp3"}, function() { 
	Q.sheet("ball", "blockbreak.png", { tilew: 20, tileh: 20, sy: 0, sx: 0 });
	Q.sheet("block", "blockbreak.png", { tilew: 40, tileh: 20, sy: 20, sx: 0 });
	Q.sheet("paddle", "blockbreak.png", { tilew: 60, tileh: 20, sy: 40, sx: 0 });		 		 
	Q.scene('game',new Q.Scene(function(stage) {
      stage.insert(new Q.Paddle());
      stage.insert(new Q.Ball());
	  
	Q.stageScene("hud"); 	  

      var blockCount=0;
      for(var x=0;x<6;x++) {
        for(var y=0;y<5;y++) {
          stage.insert(new Q.Block({ x: x*50+35, y: y*30+40 }));
          blockCount++;
        }
      }
      stage.on('removeBlock',function() {
        Q.audio.play('brickDeath');
		blockCount--;
		Q.state.inc("score",50);
        if(blockCount == 0) {
          Q.stageScene('win');
        }
      });
	  
	   stage.on('decLives',function() {
	   Q.state.dec("lives",1);
       if(Q.state.get("lives") == 0) {
			    Q.stageScene("gameOver");
				} else {
		  stage.insert(new Q.Ball());
		  }
      });
    }));
  
    Q.stageScene('title');
  });  
  });  
});