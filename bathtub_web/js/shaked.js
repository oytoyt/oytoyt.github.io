// 获取URL参数
function getQueryString(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let r = window.location.search.substr(1).match(reg)
    if (r != null) return unescape(r[2])
    return null
}

window.onload = function () {
    const openid = getQueryString('openid')
    let socket;
    //音频加载标志
    this.audioLoaded = false
    this.shakeAudio = new Audio()	//摇一摇声音
    this.shakeAudio.src = 'source/shake_sound.mp3'

    // 25s 后跳转到开奖页面
    setTimeout(() => {
        console.log('跳转到开奖页面')
        window.location.href = `${location.origin}/reward.html?openid=${openid}`
    }, 25 * 1000)

    // 建立socket连接
    function socket_connect() {
        // socket
        // const preUrl = 'http://47.107.180.247:7009'
        // const preUrl = 'http://localhost:7009'
        const preUrl = 'http://119.23.136.26:7009'
        const namespace = '/reward'
        socket = io(preUrl + namespace)
        socket.on('connect', function () {
            console.log('建立socket连接')
            console.log(socket.id)
            socket.on('server_message', function (params) {
                console.log('服务端消息')
                console.log(params)
                params && params.length > 0 && params.forEach((item, index) => {
                    const {openid: rewardOpenid} = item
                    if (rewardOpenid === openid) {
                        let ranking = 1
                        if (index === 0) {
                            ranking = 2
                        } else if (index === 1) {
                            ranking = 1
                        } else if (index === 2) {
                            ranking = 2
                        }
                        window.location.href = `${location.origin}/reward.html?ranking=${ranking}`
                    }
                })
            })
        })
    }

    const that = this

    //create a new instance of shake.js.
    const myShakeEvent = new Shake({
        threshold: 15
    });

    // start listening to device motion
    myShakeEvent.start();

    // register a shake event
    window.addEventListener('shake', shake_action, false);
    window.addEventListener('touchstart', shake_action, false);

    function shake_action() {
        console.log("摇一摇");
        socket && socket.emit("console_message", openid);
        if (that.audioLoaded === false) {
            that.audioLoaded = true
            //摇一摇音效
            that.shakeAudio.play()
            //摇一摇
            $('#id-shake-image').addClass('animated shake')
        }

        clearTimeout()
        setTimeout(function () {
            that.audioLoaded = false
            $('#id-shake-image').removeClass('animated shake')
        }, 1000)
    }

    // window.addEventListener(
    //     'touchstart',
    //     function () {
    //         const display = $('#hint-title').css('display')
    //         console.log(display)
    //         if (display !== 'none') {
    //             shake_action()
    //         }
    //         document.getElementsByClassName('bodymask')[0].style.display = 'none'
    //         //create a new instance of shake.js.
    //         const myShakeEvent = new Shake({
    //             threshold: 15
    //         });

    //         // start listening to device motion
    //         myShakeEvent.start();

    //         console.log("摇一摇");
    //         socket && socket.emit("console_message", openid);
    //     },
    //     false
    // )

    socket_connect()
}
