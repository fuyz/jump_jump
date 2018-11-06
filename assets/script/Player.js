// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
	extends: cc.Component,

	properties: {
    	// 主角跳跃高度
    	jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,

        xSpeed: 0,

        // 辅助形变动作时间
        squashDuration: 0,

        // 跳跃音效资源
        jumpAudio: {
        	default: null,
        	type: cc.AudioClip
        },

    },

    startJump: function(){
        // 初始化键盘输入监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this); 
        // open Accelerometer 初始化重力感应监听：
        cc.systemEvent.setAccelerometerEnabled(true);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
        //初始化touch触摸监听：
        this.node.parent.on(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.parent.on(cc.Node.EventType.TOUCH_MOVE, this.onTouch, this);

         // 初始化跳跃动作
        this.node.runAction(this.setJumpAction());

    },

    setJumpAction: function () {

        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.v2(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 形变
        var squash = cc.scaleTo(this.squashDuration, 1, 1);
        var stretch = cc.scaleTo(this.squashDuration, 1, 1.5);
        var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);

        // 不断重复
        // return cc.repeatForever(cc.sequence(jumpUp, jumpDown));
        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        // 不断重复，而且每次完成落地动作后调用回调来播放声音
        // return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
        return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
    },

    playJumpSound: function () {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;
        this.enabled = true;  

    },

    // 初始化完成后执行的方法
    start () {

    },

    // 触摸事件
    onTouch(event){
        let screenW = this.node.parent.width;
        if(event.touch._point.x < screenW/2){
            this.accLeft = true;
            this.accRight = false;
            // console.log('left');
        }else{
            this.accLeft = false;
            this.accRight = true;
            // console.log('right');
        }
        // console.log(event);
    },

    onDeviceMotionEvent (event) {
        // cc.log('重力感应：'+ event.acc.x + "  " + event.acc.y);
        if(event.acc.x < -0.05 ){
            this.accLeft = true;
            this.accRight = false;
        }else if(event.acc.x > 0.05){
            this.accLeft = false;
            this.accRight = true;
        }else if(event.acc.x <= 0.05 && event.acc.x >= -0.05){
            this.accLeft = false;
            this.accRight = false;
        }
    },

    onKeyDown (event) {
        // set a flag when key pressed
        switch(event.keyCode) {
        	case cc.macro.KEY.a:
        	this.accLeft = true;
        	break;
        	case cc.macro.KEY.d:
        	this.accRight = true;
        	break;
        }
    },

    onKeyUp (event) {
        // unset a flag when key released
        switch(event.keyCode) {
        	case cc.macro.KEY.a:
        	this.accLeft = false;
        	break;
        	case cc.macro.KEY.d:
        	this.accRight = false;
        	break;
        }
    },

    onDestroy () {
        // 取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
        this.node.parent.off(cc.Node.EventType.TOUCH_START, this.onTouch, this);
        this.node.parent.off(cc.Node.EventType.TOUCH_MOVE, this.onTouch, this);
        
    },

    lateUpdate(){
        // this.node.rotation = 0;
    },
	// update 在场景加载后就会每帧调用一次，我们一般把需要经常计算或及时更新的逻辑内容放在这里。
	// 在我们的游戏中，根据键盘输入获得加速度方向后，就需要每帧在 update 中计算主角的速度和位置。
	update: function (dt) {

        if(!this.enabled)return;

        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
        	this.xSpeed -= this.accel * dt;
            this.node.rotation = 15;
        } else if (this.accRight) {
            this.node.rotation = -15;
        	this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if ( Math.abs(this.xSpeed) > this.maxMoveSpeed ) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;

        //判断主角是否跑出左右边界
        // let screenW = cc.view.getFrameSize().width;
        var screenW = this.node.parent.width;
        if(this.node.x <  - screenW/2  ){
            this.node.x = -screenW/2;
        }else if(this.node.x > screenW/2 ){
            this.node.x = screenW/2 ;
        }



    },
    // update (dt) {},
});
