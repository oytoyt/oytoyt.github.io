// const preUrl = 'http://47.107.180.247:7009'
// const preUrl = 'http://localhost:7009'
const preUrl = 'http://119.23.136.26:7009'

// 获取URL参数
function getQueryString(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let r = window.location.search.substr(1).match(reg)
    if (r != null) return unescape(r[2])
    return null
}

window.onload = function () {
    const winAudio = new Audio('source/win.mp3')
    const bgmAudio = new Audio('source/bgm.mp3')
    let isAudioStart = false

    window.addEventListener(
        'click',
        function () {
            const display = $('#hint-title').css('display')
            console.log(display)
            if (isAudioStart === false) {
                bgmAudio.loop = true
                bgmAudio.play()
                console.log('背景音乐')
            }
        },
        false
    )

    // 活动限制人数 >= 3
    const userLimit = 3
    // 是否自动开始
    let autoStart = true
    // 人数满了后不再请求
    let fullLimit = false
    // 是否满员
    let isFilled = false
    // 抽奖计时
    const count_down = 20
    // 水位对应时间值
    const water10 = parseInt(count_down * 1) - 1
    const water20 = parseInt(count_down * 0.9) - 1
    const water30 = parseInt(count_down * 0.8) - 1
    const water40 = parseInt(count_down * 0.7) - 1
    const water50 = parseInt(count_down * 0.6) - 1
    const water60 = parseInt(count_down * 0.5) - 1
    const water70 = parseInt(count_down * 0.4) - 1
    const water80 = parseInt(count_down * 0.3) - 1
    const water90 = parseInt(count_down * 0.2) - 1
    const water100 = 1
    let number = count_down

    // 建立socket连接
    function socket_connect() {
        // socket
        const namespace = '/console'
        const socket = io(preUrl + namespace)
        socket.on('connect', function () {
            console.log('建立socket连接')
            console.log(socket.id)
            socket.emit('console_message', {my: 'console_message'})
            socket.on('server_message', function (params) {
                console.log('服务端消息')
                console.log(params)
                // console.log('报名的人')
                // console.log(params)
                const {state, data, index} = params
                if(index === "reward") return moveList(data.members);
                if (state === 1000) {
                    const {count, list} = data
                    if (count >= userLimit) {
                        isFilled = true
                    }
                    show_user(list)
                }
            })
        })
    }

    // 移动头像
    function moveList(data = {}) {
        console.log("调用了");
        Object.keys(data).forEach(function(key){
            console.log("调用了", getHeight(data[key].times));
             // console.log(key,obj[key]);
             $(`img.user[data-openid=${key}]`).css("transform", `translateY(${getHeight(data[key].times)})`);
        });
    }

    // 活动倒计时
    function activityCountDown(callBack) {
        // 活动开始，倒计时
        setTimeout(() => {
            $('.number_three').addClass('show_number animated zoomIn')
        }, 1000)
        setTimeout(() => {
            $('.number_three').removeClass('show_number animated zoomIn')
            $('.number_two').addClass('show_number animated zoomIn')
        }, 2000)
        setTimeout(() => {
            $('.number_two').removeClass('show_number animated zoomIn')
            $('.number_one').addClass('show_number animated zoomIn')
        }, 3000)
        setTimeout(() => {
            $('.number_one').removeClass('show_number animated zoomIn')
            callBack()
        }, 4000)
    }

    // 请求抽奖
    function requestLottery() {
        const url = `${preUrl}/api/activity/lottery`
        const loading = weui.loading('抽奖...', {
            className: 'content'
        })
        $.get(url, function (res) {
            loading.hide()
            console.log('请求抽奖')
            console.log(res)
            const {state, msg, data} = res
            // weui.toast(msg, 2000)
            if (state === 1000) {
                showWinner(data)
            }
        })
    }

    // 显示中奖用户
    function showWinner(userList) {
        userList.forEach((item, index) => {
            const {headimgurl, nickname} = item
            let {id} = item
            id = '' + id
            const className = `.winner_img${index}`
            $(className).attr('src', headimgurl)
            // 隐藏水缸的中奖用户
            $('.lottery_user').forEach(item => {
                const dataId = $(item).attr('data-id')
                if (id === dataId) {
                    $(item).removeClass('user_show')
                }
            })
            if (index === 0) {
                // 二等奖
                $('.winner_second').html(nickname)
            } else if (index === 1) {
                // 一等奖
                $('.winner_first').html(nickname)
            } else if (index === 2) {
                // 三等奖
                $('.winner_third').html(nickname)
            }
        })
        $('.winner_pannel').addClass('show animated zoomInUp')
        $('.winner_info_pannel').addClass('show animated zoomIn')
        $('.water-full').addClass('show animated fadeIn slower')
        winAudio.play()
    }

    // 倒计时抽奖
    function lottery_action() {
        const className = '.count_down'
        setTimeout(() => {
            // 隐藏倒计时数字
            // $(className).html(number)
            $(className).removeClass('animated zoomIn')
            $(className).addClass('animated zoomIn')
            // 水位动画
            // 头像同步上升
            if (number === 1) {
                $(".activity_user_list.test img").css("transform", "translateY(0)");
                $('.lottery_activity_user_list:not(.test)').removeClass('user_step')
                $('.lottery_activity_user_list:not(.test)').addClass('user_list_water_full')
                $('.water-10').removeClass('water-step')
                $('.water-10').addClass('water_full')
                // $('.water-100').addClass('show animated fadeIn')
                $(className).removeClass('animated zoomIn')
                $(className).html('')
                number = count_down
                // 请求抽奖接口
                requestLottery()
                return
            } else if (number === 19) {
                $('.water-10').addClass('water-step')
                $('.lottery_activity_user_list:not(.test)').addClass('user_step')
                $('.lottery_activity_user_list.test').addClass('testStop')
            }
            lottery_action()
        }, 1000)
        number -= 1
    }

    // 请求开始活动
    function requestStartActivity() {
        const url = `${preUrl}/api/activity/start`
        $.get(url, function (res) {
            console.log('请求开始活动')
            console.log(res)
            const {state} = res
            if (state === 1000) {
                // 显示抽奖界面
                // 点击开始活动倒计时动画
                // 倒计时动画结束
                $('.content').addClass('hide')
                $('.lottery').addClass('show')
                if (autoStart) {
                    $('.lotter-button').addClass('hide')
                }
                activityCountDown(() => {
                    // 活动计时中
                    // lottery_action()
                    // 如果是自动开始
                    lottery_action()
                })
            }
        })
    }

    // 显示报名的用户
    function show_user(list) {
        console.log('显示报名的用户')
        let lastIndex = 0
        if (list.length > 1) {
            lastIndex = list.length - 1
        }
        list.forEach((item, index) => {
            const {headimgurl, id, openid} = item
            const className = `.join_user${index}`
            const lotteryClassName = `.lottery_user${index}`
            const actionUserClass = `.action_user${index}`
            $(className).attr('src', headimgurl)
            $(lotteryClassName).attr('src', headimgurl)
            $(lotteryClassName).attr('data-id', `${id}`)
            $(lotteryClassName).attr('data-openid', `${openid}`)
            const display = $(className).css('display')
            if (display === 'none') {
                // 抽奖页面显示头像
                $(lotteryClassName).addClass('user_show')
                // 显示从水龙头掉落动画
                if (index === lastIndex) {
                    $(actionUserClass).attr('src', headimgurl)
                    // $(actionUserClass).addClass('show animated zoomInDown slower')
                    $(actionUserClass).addClass('show water-down')
                }
                setTimeout(() => {
                    // $(actionUserClass).removeClass('show animated zoomInDown slower')
                    $(actionUserClass).removeClass('show water-down')
                    // 直接掉落  fadeInDownBig
                    // 由水龙头掉落 渐显
                    $(className).addClass('user_show animated zoomIn')
                }, 2400)
                setTimeout(() => {
                    $(className).removeClass('animated zoomIn')
                }, 5000)
            }
        })
    }

    // 轮训请求报名的人
    function customerList() {
        const url = `${preUrl}/api/user/list`
        // 满员 && 开启满员限制
        if (isFilled === true && fullLimit === true) {
            return
        }
        $.get(url, function (res) {
            console.log('报名的人')
            console.log(res)
            const {state, data} = res
            if (state === 1000) {
                const {count, list} = data
                if (count >= userLimit) {
                    isFilled = true
                }
                show_user(list)
            }
        })
    }

    // 结束本轮活动
    function endGame(type) {
        let loadingString = '初始化游戏...'
        let className = 'lottery'
        if (type === 0) {
            loadingString = '清空浴缸...'
            className = 'content'
        }
        const loading = weui.loading(loadingString, {
            className: className
        })
        const url = `${preUrl}/api/activity/end`
        $.post(url, function (res) {
            loading.hide()
            console.log('结束本轮活动')
            console.log(res)
            const {state} = res
            if (state === 1000) {
                resetStatus()
            }
        })
    }

    // 继续游戏
    function resetStatus() {
        console.log('继续游戏')
        isFilled = false
        number = count_down
        // 切换界面
        $('.content').removeClass('hide')
        $('.lottery').removeClass('show')
        // 隐藏参与头像
        const list = Array.from(new Array(20).keys())
        list.forEach((item, index) => {
            const className = `.join_user${index}`
            const lotteryClassName = `.lottery_user${index}`
            $(className).attr('src', 'source/logo.jpg')
            $(lotteryClassName).attr('src', 'source/logo.jpg')
            $(lotteryClassName).attr('data-id', '-1')
            $(className).removeClass('animated zoomIn')
            $(lotteryClassName).removeClass('animated zoomIn')
            $(className).removeClass('user_show')
            $(lotteryClassName).removeClass('user_show')
        })
        // 隐藏掉落图片
        // $('.action_user').removeClass('show animated zoomInDown slower')
        $('.action_user').removeClass('show water-down')
        // 清空水位
        $('.water-10').removeClass('show animated fadeIn slower')
        $('.water-20').removeClass('show animated fadeIn slower')
        $('.water-30').removeClass('show animated fadeIn slower')
        $('.water-40').removeClass('show animated fadeIn slower')
        $('.water-50').removeClass('show animated fadeIn slower')
        $('.water-60').removeClass('show animated fadeIn slower')
        $('.water-70').removeClass('show animated fadeIn slower')
        $('.water-80').removeClass('show animated fadeIn slower')
        $('.water-90').removeClass('show animated fadeIn slower')
        $('.water-100').removeClass('show animated fadeIn slower')
        $('.water-full').removeClass('show animated fadeIn slower')
        // 水位回到初始状态
        $('.lottery_activity_user_list').removeClass('user_list_water_full')
        $('.water-10').removeClass('water_full')
        // 重置奖杯状态
        $('.winner_pannel').removeClass('show animated zoomInUp')
        $('.winner_info_pannel').removeClass('show animated zoomIn')
        // 重置3，2，1倒计时状态
        $('.number_one').removeClass('show_number animated zoomIn')
        $('.number_two').removeClass('show_number animated zoomIn')
        $('.number_three').removeClass('show_number animated zoomIn')
        // 显示开始按钮
        $('.lotter-button').removeClass('hide')
        // 重置预开始按钮
        $('.join-button').removeClass('hide')
        // 重置为活动人数未满
        isFilled = false
    }

    // 计算高度
    function getHeight(times) {
        var max = 60;
        times = times >= max ? max : times;
        return times / max * -500 + "%";
    }

    // ##### 点击事件 #######
    // 全屏点击事件
    $('.fullScreen').on('click', function () {
        let el = document.documentElement
        let rfs =
            el.requestFullScreen ||
            el.webkitRequestFullScreen ||
            el.mozRequestFullScreen ||
            el.msRequestFullscreen
        if (typeof rfs != 'undefined' && rfs) {
            rfs.call(el)
        }
    })
    // 退出全屏点击事件
    $('.exitScreen').on('click', function () {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
        }
        if (typeof cfs != 'undefined' && cfs) {
            cfs.call(el)
        }
    })

    // 清空浴缸
    $('.content-restart').on('click', function name() {
        endGame(0)
    })

    // 继续游戏
    $('.restart').on('click', function name() {
        endGame()
    })

    // 预开始游戏
    $('.join-button').on('click', function name() {
        console.log('点击开始活动')
        if (isFilled === true) {
            // 请求活动开始接口
            $('.join-button').addClass('hide')
            requestStartActivity()
        } else {
            weui.toast(`未满 ${userLimit} 人`, 1500)
        }
    })
    // 开始游戏（游戏计时）
    $('.lotter-button').on('click', function name() {
        console.log('活动计时中')
        $('.lotter-button').addClass('hide')
        lottery_action()
    })

    setTimeout(socket_connect, 1000)

    // 轮询请求已报名的用户
    // setInterval(customerList, 2000)
    customerList()
}
