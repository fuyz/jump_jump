// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const PlayerF = require('Player');
// let PlayerF = new Player();
cc.Class({
	extends: cc.Component,

	properties: {

        // 这个属性引用了星星预制资源
        starPrefab: {
        	default: null,
        	type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
        	default: null,
        	type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
        	default: null,
        	type: cc.node
        },

        startBtn: {
        	default: null,
        	type: cc.Node
        },

        // score label 的引用
        scoreDisplay: {
        	default: null,
        	type: cc.Label
        },

        // 得分音效资源
        scoreAudio: {
        	default: null,
        	type: cc.AudioClip
        }

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {

        // 初始化计分
        this.score = 0;

        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height/2;

        // 初始化计时器
        this.timer = 0;
        this.starDuration = 5;  
        this.enabled = false;   

        //初始化touch触摸监听：
        // this.node.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        // cc.systemEvent.on(cc.SystemEvent.EventType.TOUCH_MOVE, this.onTouch, this);  

    },

    onDestroy () {
        // 取消键盘输入监听
        this.startBtn.off(cc.Node.EventType.TOUCH_START, this.onMouseDown, this);

        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        // cc.systemEvent.off(cc.SystemEvent.EventType.TOUCH_MOVE, this.onTouch, this);
    },

    spawnNewStar: function() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());

        // 在星星组件上暂存 Game 对象的引用
        newStar.getComponent('Star').game = this;

        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
        this.enabled = true;

        
    },

    onTouch(event){
    	let screenW = this.ground.width;
    	if(event.touch._point < screenW/2){
 			this.accLeft = true;
            this.accRight = false;
    	}else{
    		this.accLeft = false;
            this.accRight = true;
    	}
    	console.log(event);
    },

    getNewStarPosition: function () {
    	var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        // var maxX = this.node.width/2;
        let maxX = cc.view.getFrameSize().width/2;
        randX = (Math.random() - 0.5) * 2 * maxX;
        // console.log(this.groundY, randX, randY);
        // 返回星星坐标
        return cc.v2(randX, randY);
        // return cc.v2(100, -100);
    },

    start () {

    },

    update (dt) {

        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            // console.log('gamse over')
            this.gameOver();
            return;
        }
        this.timer += dt;
        // console.log('dt:'+ dt);
    },

    gainScore: function () {
    	this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function () {
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        console.log('game over');
        this.node.destroy();
        cc.director.loadScene('game');//启动游戏
        
    }


});