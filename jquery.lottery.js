/*
    //正面数据 标题，图片，副标题
    //反面数据
    //开始翻牌的样式
    //点击牌面的事件
    //您可翻 x 次
    options: {
        front: {
            template: '',
            data: []
        },
        back: '',
        startBtn: '',
        pick: function (i) {
        },
        startLottery: function () {
        }
    }
*/
$.fn.lottery = function(options) {
    var me = this,
        mleft = me.offset().left,
        mtop = me.offset().top,
        backTemplate = '<div class="fQ_front">{{back}}</div>',
        frontTemplate = '<div class="fQ_back">{{front}}</div>',
        //重新洗牌函数
        _mess = function(arr) {
            var _floor = Math.floor, _random = Math.random, 
                len = arr.length, i, j, arri, 
                n = _floor(len/2)+1; 
            while( n-- ){ 
                i = _floor(_random()*len); 
                j = _floor(_random()*len); 
                if( i!==j ){ 
                    arri = arr[i]; 
                    arr[i] = arr[j]; 
                    arr[j] = arri; 
                } 
            } 
            //增加切牌操作 
            i = _floor(_random()*len); 
            arr.push.apply(arr, arr.splice(0,i));
        },
        _replace = function(str, obj) {
            var result = str;
            for (var key in obj) {
                result = result.replace('{{' + key + '}}', obj[key]);
            }
            return result;
        },
        _animate = function(tarray, p, i){
            if (i < tarray.length) {
                var t = $(tarray[i]),
                    isArray = Object.prototype.toString.call(p) === '[object Array]',
                    thisLeft = t.offset().left - mleft,
                    thisTop = t.offset().top - mtop,
                    start = 0,
                    stepLeft, stepTop, intervalTimer;
                if (isArray) {
                    stepLeft = (p[i].left - thisLeft) / 50;
                    stepTop = (p[i].top - thisTop) / 50;
                } else {
                    stepLeft = (p.left - thisLeft) / 50;
                    stepTop = (p.top - thisTop) / 50;
                }
                
                intervalTimer = setInterval(function(){
                    if (start === 50) {
                        clearInterval(intervalTimer);
                    } else if (start === 5) {
                        _animate(tarray, p, i + 1);
                    } else if (start === 49) {
                        if (isArray) {
                            t.css(p[i]); 
                        } else {
                            t.css(p);
                        }
                        if (i === tarray.length - 1) {
                            // console.log('last done');
                        }
                    } else {
                        t.css({
                            left: t.offset().left - mleft + stepLeft,
                            top: t.offset().top - mtop + stepTop
                        });
                    }
                    start++;
                }, 20);
            } else {
                // console.log('fail: function done.');
            }
        }

    if (!options) {
        console.error('param error: "options" is required.');
    } else {
        if (options.front && options.back) {
            // && options.front.template && options.front.data
            var frontData = options.front, lotteryArray = [], start = 0;
            backTemplate = backTemplate.replace('{{back}}', options.back);
            if (frontData.data.length) {
                frontData.data.map(function(t){
                    if (start === 4) {
                        lotteryArray.push('<div class="start">' + options.startBtn + '</div>');
                    }
                    lotteryArray.push('<div class="fQ_container" data-index="' + start + '">' 
                        + backTemplate 
                        + frontTemplate.replace('{{front}}', _replace(frontData.template, t))
                        + '</div>'
                    );
                    start++;
                });
            }
            //已经将翻牌的数据存入到了lotteryArray，使用html重写
            me.html('<li>' + lotteryArray.join('</li><li>') + '</li>');
            //设置翻牌和点击的事件
            me.on('tap', '.fQ_container', function(){
                if ($(this).data('start') && options.pick && options.pick instanceof Function) {
                    options.pick(options.front.data[$(this).data('index')]);
                    $(this).removeClass('fQ_flip');
                }
            });
            me.on('tap', '.start', function(){
                //点击了开始翻牌按钮
                var lotteryItems = me.find('.fQ_container'), 
                    targetItem = me.find('.start'),
                    positions = [],
                    lotteryCopy = [];
                if (!$(this).data('finished')){
                    $(this).data('finished', 'done');
                    lotteryItems.addClass('fQ_flip');
                    setTimeout(function(){
                        _animate(lotteryItems, 
                            {
                                left: targetItem.offset().left - mleft,
                                top: targetItem.offset().top - mtop
                            }, 0);
                    }, 800);

                    //随机返还到原来的位置
                    lotteryItems.each(function(){
                        // positions.push($(this).offset());
                        positions.push({
                            left: $(this).offset().left - mleft,
                            top: $(this).offset().top - mtop,
                        });
                        lotteryCopy.push($(this));
                    });

                    //将数组位置重新洗牌
                    _mess(positions);
                    _mess(lotteryCopy);

                    setTimeout(function(){
                        _animate(lotteryCopy, positions, 0);
                        lotteryItems.data('start', 'true');
                    },3000);
                    
                    if (options.startLottery && options.startLottery instanceof Function) {
                        options.startLottery();
                    }
                }
            });
        } else {
            console.error('param error: "options.front"/"options.back" is required.');
        }
    }
    return me;
};