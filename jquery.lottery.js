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
        hasLotteryCount: true/false,
        pick: function (i) {
        },
        startLottery: function () {
        }
    }
*/
$.fn.lottery = function(options) {
    var me = this,
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
        };
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
            me.delegate('.fQ_container', 'click', function(){
                if ($(this).data('start') && options.pick && options.pick instanceof Function) {
                    options.pick(options.front.data[$(this).data('index')]);
                    $(this).removeClass('fQ_flip');
                }
            });
            me.delegate('.start', 'click', function(){
                //点击了开始翻牌按钮
                var lotteryItems = me.find('.fQ_container'), 
                    targetItem = me.find('.start'),
                    positions = [];
                if (!$(this).data('finished')){
                    $(this).data('finished', 'done');
                    lotteryItems.data('start', 'true');
                    $('.fQ_container').addClass('fQ_flip');
                    lotteryItems.animate(targetItem.position(), 1000);

                    //随机返还到原来的位置
                    lotteryItems.each(function(){
                        positions.push($(this).position());
                    });

                    //将数组位置重新洗牌
                    _mess(positions);
                    _mess(lotteryItems);

                    function lotteryAnimate(i) {
                        if (i < lotteryItems.length) {
                            $(lotteryItems[i]).animate(positions[i], 200, function(){
                                lotteryAnimate(i + 1);
                            });
                        }
                    }
                    lotteryAnimate(0);
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