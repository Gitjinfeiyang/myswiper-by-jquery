/**
 * Created by jinfeiyang on 2017-03-23.
 */

;(function($){

    const [CONTENT,BOX]=['.content','.img-box'];//定义div类名
    const [FAST,SLOW]=['0.4s','0.8s'];//transform速度

    let boxWidth=0;//每个img-box的宽度
    let boxHeight=0;//每个img-box的高度
    let contentWidth=0;//总的宽度
    let contentHeight=0;//总的高度

    //纵向
    let horizontal={
        boxStyle:{
            height:boxHeight,
        },
        contentStyle:{
            height:contentHeight,
            transform:'translate3d(0px,0px,0px)'
        },
        imgStyle:{
            height:'100%'
        }
    };
    //横向排列
    let vertical={
        boxStyle:{
            //overflow:'scroll',
            float:'left',
            width:boxWidth,
        },
        contentStyle:{
            width:contentWidth,
            transform:'translate3d(0px,0px,0px)'
        },
        imgStyle:{
            width:'100%'
        }
    };

    let reg=/matrix(?:(3d)\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))(?:, (-{0,1}\d+)), -{0,1}\d+\)|\(-{0,1}\d+(?:, -{0,1}\d+)*(?:, (-{0,1}\d+))(?:, (-{0,1}\d+))\))/;


    let defaultOptions={
        direction:vertical,
        speed:SLOW,
        autoplay:5000,
        index:true
    };

    class MySwiper{
        constructor(options,container){
            if(options.direction=='horizontal'){
                options.direction=horizontal;
            }else if(options.direction=='vertical'){
                options.direction=vertical;
            }
            if(options.speed=='fast'){
                options.speed=FAST;
            }else if(options.speed=='slow'){
                options.speed=SLOW;
            }
            this.options=$.extend({},defaultOptions,options);
            this.container=container;
            this.content=this.container.children(CONTENT);
            this.box=this.content.children(BOX);

        }

        initStyle(){
            this.caculate(this.content,this.options.direction);//计算各种高度并且赋值
            this.options.direction.contentStyle.transition='all '+this.options.speed;//赋值
            if(this.options.index){
                this.container.css('position','relative');
                this.addIndex();
            }

            this.container.children(CONTENT).css(this.options.direction.contentStyle).children(BOX).//应用计算好的样式
                css(this.options.direction.boxStyle).children('img').css(this.options.direction.imgStyle);
            if(this.options.autoplay>=2000){//应用自动切换
                this.autoSwitch(true);
            }
            this.addEvent();//应用触摸事件
        }

        addEvent(){
            let transformS=0;//初始transform值 用于保存初始状态
            let start=0;
            let distance=0;//划过的距离 矢量
            let b=true;
            let location=0;//在当前页的位置

            this.container.on('touchstart',e => {
                this.autoSwitch(false);
                touchStartHandler(e,this);
            });
            this.container.on('touchmove',e => {
                if(b===false){//函数节流
                 return;
                }
                b=false;

                touchMoveHandler(e,this);

                setTimeout(function(){
                    b=true;
                },5);
            });
            this.container.on('touchend',e => {
                touchEndHandler(e,this);
                this.autoSwitch(true);
            });

            $('#j-next-button').on('click',(function(e){
                this.goNext();
            }).bind(this));

            $('#j-last-button').on('click',(function(e){
                this.goLast();
            }).bind(this));

            function touchStartHandler(e,that){
                if(that.options.direction==vertical){
                    transformS=parseInt(that.content.css('transform').split(',')[4]);
                    that.content.css('transform','translate3d('+transformS+'px,0,0)');
                    start=e.changedTouches[0].clientX;
                }else{
                    transformS=parseInt(that.content.css('transform').split(',')[5].split(')')[0]);
                    that.content.css('transform','translate3d(0,'+transformS+'px,0)');
                    start=e.changedTouches[0].clientY;
                }
                that.content.css('transition','none');
            }

            function touchMoveHandler(e,that){
                if(that.options.direction==vertical){
                    distance=e.changedTouches[0].clientX-start;
                    that.content.css('transform','translate3d('+(transformS+distance)+'px,0,0)');
                }else{
                    distance=e.changedTouches[0].clientY-start;
                    that.content.css('transform','translate3d(0,'+(transformS+distance)+'px,0)');
                }
            }

            function touchEndHandler(e,that){
                that.content.css('transition','all '+that.options.speed);
                if(that.options.direction==vertical){
                    transformS=parseInt(that.content.css('transform').split(',')[4]);
                    location=transformS>=0?transformS%boxWidth:(-1*transformS)%boxWidth;
                    that.autoTransformX(distance,transformS,location);
                }else{
                    transformS=parseInt(that.content.css('transform').split(',')[5].split(')')[0]);
                    location=transformS>=0?transformS%boxHeight:(-1*transformS)%boxHeight;
                    console.log(boxHeight);
                    that.autoTransformY(distance,transformS,location);
                }
            }
        }

        addIndex(){
            let lists='';
            for(let i=0; i<this.box.length; i++){
                lists+=`<li class='index-${-1*i}' style="display:inline-block; width:6px; height:6px; border-radius: 50%; margin-right: 20px;
                            background:rgba(255,255,255,0.5); box-shadow: rgba(218,217,214,0.5); transition:all 0.5s"></li>`;
            }
            this.container.append(`<div style="width:100%;padding-bottom: 10px;position:absolute; 
                            left: 0; bottom:0;"><ul style="text-align: center; margin:0;">${lists}</ul></div>`);
            this.container.on('boxswitched',(function(e,pageIndex){//监听自定义事件
               //console.log(this.container.find(".index-"+pageIndex));
               this.container.find("li").css('transform',"scale(1)");
               this.container.find(".index-"+pageIndex).css('transform',"scale(2)");
            }).bind(this));
        }

        //计算所有img-box加起来的宽度或高度
        caculate(content,direction){
        switch (direction){
            case vertical:
                direction.boxStyle.width=boxWidth=this.container.width();
                content.children(BOX).each(function(){
                    direction.contentStyle.width+=$(this).width();
                });
                break;
            case horizontal:
                direction.boxStyle.height=boxHeight=this.container.height();
                content.children(BOX).each(function(){
                    direction.contentStyle.height+=$(this).height();
                });
                break;
        }
    }

        autoTransformX(distance,transformS,location){
            let pageIndex=parseInt(transformS/boxWidth);//当前页index 从0 ~ -n
            // console.log('pageIndex',pageIndex,'distance',distance,'location',location);


            if(distance>0){//向右滑动 pageIndex为左边页
                if(pageIndex>=0){//判断是否为第一张
                    this.content.css('transform', 'translate3d(0,0,0)');
                    this.container.trigger('boxswitched',[pageIndex]);
                    return;
                }
                if(location<(boxWidth*4/5)){//划过5分之一即上一页
                    this.content.css('transform', 'translate3d(' + (pageIndex * boxWidth) + 'px,0,0)');
                    this.container.trigger('boxswitched',[pageIndex]);

                }else{
                    this.content.css('transform','translate3d('+(pageIndex*boxWidth-boxWidth)+'px,0,0)');
                }
            }else if(distance<0){//向左滑动 pageIndex表示当前页
                if(pageIndex*-1==(this.box.length-1)){//判断是否为最后一张
                    this.content.css('transform','translate3d('+(pageIndex*boxWidth)+'px,0,0)')
                    return;
                }
                if(location>(boxWidth/5)){//划过5分之一
                    this.content.css('transform', 'translate3d(' + (pageIndex * boxWidth - boxWidth) + 'px,0,0)');
                    this.container.trigger('boxswitched',[pageIndex-1]);//pageIndex表示当前页

                }else{
                    this.content.css('transform','translate3d('+(pageIndex*boxWidth)+'px,0,0)');
                }
            }else{

            }

        }

        autoTransformY(distance,transformS,location){
            let pageIndex=parseInt(transformS/boxHeight);//当前页index 从0 ~ -n
            // console.log('pageIndex',pageIndex,'distance',distance,'location',location);


            if(distance>0){//向下滑动 pageIndex为左边页
                if(pageIndex>=0){//判断是否为第一张
                    this.content.css('transform', 'translate3d(0,0,0)');
                    return;
                }
                if(location<(boxHeight*4/5)){//划过5分之一即上一页
                    this.content.css('transform', 'translate3d(0,'+(pageIndex * boxHeight)+'px,0)');
                }else{
                    // console.log('right: back to origin');
                    this.content.css('transform', 'translate3d(0,'+(pageIndex * boxHeight-boxHeight)+'px,0)');
                }
            }else if(distance<0){//向上滑动 pageIndex表示当前页
                if(pageIndex*-1==(this.box.length-1)){//判断是否为最后一张
                    this.content.css('transform', 'translate3d(0,'+(pageIndex * boxHeight)+'px,0)');
                    return;
                }
                if(location>(boxHeight/5)){//划过5分之一
                    this.content.css('transform', 'translate3d(0,'+(pageIndex * boxHeight-boxHeight)+'px,0)');
                }else{
                    // console.log('left:back to origin');
                    this.content.css('transform', 'translate3d(0,'+(pageIndex * boxHeight)+'px,0)');
                }
            }else{

            }
        }

        autoSwitch(swt){
            if(swt){
                this.autoSwitchInterval=setInterval((function(e){
                    this.goNext();
                }).bind(this),this.options.autoplay);
            }else{
                clearInterval(this.autoSwitchInterval);
            }

        }

        //只适用于未运动状态
        goNext(){
            let transformS=0;
            let pageIndex=0;
            if(this.options.direction==vertical){
                transformS=parseInt(this.content.css('transform').split(',')[4]);
                pageIndex=transformS/boxWidth<=((this.box.length-1)*-1)?1:parseInt(transformS/boxWidth);
                this.content.css('transform', 'translate3d(' + (pageIndex * boxWidth-boxWidth) + 'px,0,0)');
            }else{
                transformS=parseInt(this.content.css('transform').split(',')[5].split(')')[0]);
                pageIndex=transformS/boxHeight<=((this.box.length-1)*-1)?1:parseInt(transformS/boxHeight);
                console.log(pageIndex);
                this.content.css('transform', 'translate3d(0,'+(pageIndex * boxHeight-boxHeight)+'px,0)');
            }
            this.container.trigger('boxswitched',[pageIndex-1]);

        }

        goLast(){
            let transformS=0;
            let pageIndex=0;
            if(this.options.direction==vertical){
                transformS=parseInt(this.content.css('transform').split(',')[4]);
                pageIndex=transformS/boxWidth>=0?((this.box.length)*-1):parseInt(transformS/boxWidth);
                this.content.css('transform', 'translate3d(' + (pageIndex * boxWidth+boxWidth) + 'px,0,0)');
            }else{
                transformS=parseInt(this.content.css('transform').split(',')[5].split(')')[0]);
                pageIndex=transformS/boxHeight>=0?((this.box.length)*-1):parseInt(transformS/boxHeight);
                this.content.css('transform', 'translate3d(0,'+(pageIndex * boxHeight+boxHeight)+'px,0)');
            }
            this.container.trigger('boxswitched',[pageIndex+1]);

        }

    }

    $.fn.swiper=function(options){
        let mySwiper=new MySwiper(options,this);
        mySwiper.initStyle();
    }


})(window.jQuery);