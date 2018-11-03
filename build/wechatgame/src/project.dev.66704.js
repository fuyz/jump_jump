window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "701b3DcMB5GfqNHWHuSYkqt", "Game");
    "use strict";
    var PlayerF = require("Player");
    cc.Class({
      extends: cc.Component,
      properties: {
        starPrefab: {
          default: null,
          type: cc.Prefab
        },
        maxStarDuration: 0,
        minStarDuration: 0,
        ground: {
          default: null,
          type: cc.Node
        },
        player: {
          default: null,
          type: cc.node
        },
        startBtn: {
          default: null,
          type: cc.Node
        },
        scoreDisplay: {
          default: null,
          type: cc.Label
        },
        scoreAudio: {
          default: null,
          type: cc.AudioClip
        }
      },
      onLoad: function onLoad() {
        this.score = 0;
        this.groundY = this.ground.y + this.ground.height / 2;
        this.timer = 0;
        this.starDuration = 5;
        this.enabled = false;
      },
      spawnNewStar: function spawnNewStar() {
        var newStar = cc.instantiate(this.starPrefab);
        this.node.addChild(newStar);
        newStar.setPosition(this.getNewStarPosition());
        newStar.getComponent("Star").game = this;
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
        this.enabled = true;
      },
      getNewStarPosition: function getNewStarPosition() {
        var randX = 0;
        var randY = this.groundY + Math.random() * this.player.getComponent("Player").jumpHeight + 50;
        var maxX = cc.view.getFrameSize().width / 2;
        randX = 2 * (Math.random() - .5) * maxX;
        return cc.v2(randX, randY);
      },
      start: function start() {},
      update: function update(dt) {
        if (this.timer > this.starDuration) {
          this.gameOver();
          return;
        }
        this.timer += dt;
      },
      gainScore: function gainScore() {
        this.score += 1;
        this.scoreDisplay.string = "Score: " + this.score;
        cc.audioEngine.playEffect(this.scoreAudio, false);
      },
      gameOver: function gameOver() {
        this.player.stopAllActions();
        console.log("game over");
        this.node.destroy();
        cc.director.loadScene("game");
      }
    });
    cc._RF.pop();
  }, {
    Player: "Player"
  } ],
  Player: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "688efhATARAz7c/kcAmDset", "Player");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        jumpHeight: 0,
        jumpDuration: 0,
        maxMoveSpeed: 0,
        accel: 0,
        squashDuration: 0,
        jumpAudio: {
          default: null,
          type: cc.AudioClip
        }
      },
      startJump: function startJump() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        cc.systemEvent.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
        this.node.parent.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouch, this);
        this.node.runAction(this.setJumpAction());
      },
      setJumpAction: function setJumpAction() {
        var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        var squash = cc.scaleTo(this.squashDuration, 1, 1);
        var stretch = cc.scaleTo(this.squashDuration, 1, 1.5);
        var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);
        var callback = cc.callFunc(this.playJumpSound, this);
        return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
      },
      playJumpSound: function playJumpSound() {
        cc.audioEngine.playEffect(this.jumpAudio, false);
      },
      onLoad: function onLoad() {
        this.accLeft = false;
        this.accRight = false;
        this.xSpeed = 0;
      },
      onTouch: function onTouch(event) {
        var screenW = this.node.parent.children[4].width;
        if (event.touch._point.x < screenW / 2) {
          this.accLeft = true;
          this.accRight = false;
          console.log("left");
        } else {
          this.accLeft = false;
          this.accRight = true;
          console.log("right");
        }
      },
      onDeviceMotionEvent: function onDeviceMotionEvent(event) {
        if (event.acc.x < -.05) {
          this.accLeft = true;
          this.accRight = false;
        } else if (event.acc.x > .05) {
          this.accLeft = false;
          this.accRight = true;
        } else if (event.acc.x <= .05 && event.acc.x >= -.05) {
          this.accLeft = false;
          this.accRight = false;
        }
      },
      onKeyDown: function onKeyDown(event) {
        switch (event.keyCode) {
         case cc.macro.KEY.a:
          this.accLeft = true;
          break;

         case cc.macro.KEY.d:
          this.accRight = true;
        }
      },
      onKeyUp: function onKeyUp(event) {
        switch (event.keyCode) {
         case cc.macro.KEY.a:
          this.accLeft = false;
          break;

         case cc.macro.KEY.d:
          this.accRight = false;
        }
      },
      onDestroy: function onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
        this.node.parent.off(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.parent.off(cc.Node.EventType.TOUCH_MOVE, this.onTouch, this);
      },
      update: function update(dt) {
        this.accLeft ? this.xSpeed -= this.accel * dt : this.accRight && (this.xSpeed += this.accel * dt);
        Math.abs(this.xSpeed) > this.maxMoveSpeed && (this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed));
        this.node.x += this.xSpeed * dt;
        var screenW = cc.view.getFrameSize().width;
        this.node.x < -screenW / 2 ? this.node.x = -screenW / 2 : this.node.x > screenW / 2 && (this.node.x = screenW / 2);
      },
      start: function start() {}
    });
    cc._RF.pop();
  }, {} ],
  Star: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cb95cgjVfpO844B2ty4aRFs", "Star");
    "use strict";
    function _defineProperty(obj, key, value) {
      key in obj ? Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      }) : obj[key] = value;
      return obj;
    }
    cc.Class(_defineProperty({
      extends: cc.Component,
      properties: {
        pickRadius: 0
      },
      getPlayerDistance: function getPlayerDistance() {
        var playerPos = this.game.player.getPosition();
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
      },
      onPicked: function onPicked() {
        this.game.spawnNewStar();
        this.node.destroy();
      },
      update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
          this.onPicked();
          return;
        }
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
      },
      start: function start() {}
    }, "onPicked", function onPicked() {
      this.game.spawnNewStar();
      this.game.gainScore();
      this.node.destroy();
    }));
    cc._RF.pop();
  }, {} ]
}, {}, [ "Game", "Player", "Star" ]);