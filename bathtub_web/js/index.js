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
    // 微信公众平台配置的授权域名
    const redirectURI = encodeURIComponent(location.origin)
    // 微信公众号appId
    const appId = 'wx1a1d4735f92e3696'

    // 建立socket连接
    function socket_connect() {
        // socket
        const namespace = '/led'
        const socket = io(preUrl + namespace)
        socket.on('connect', function () {
            console.log('建立socket连接')
            console.log(socket.id)
            socket.emit('client_message', {my: 'data'})
            socket.on('server_message', function (params) {
                console.log('服务端消息')
                console.log(params)
                const {index} = params
                if (index === 'activity') {
                    // 活动开始，倒计时
                    // weui.toast('活动开始，倒计时3秒', 1000)
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
                        // 跳转到摇一摇界面
                        const openid = localStorage.getItem('openId')
                        window.location.href = `${location.origin}/join.html?openid=${openid}`
                    }, 4000)
                }
            })
        })
    }

    // 报名
    function takePartIn(params) {
        const url = `${preUrl}/api/user/join`
        const loading = weui.loading('报名...', {
            className: 'content'
        })
        $.post(url, params, function (res) {
            loading.hide()
            console.log('报名')
            console.log(res)
            const {state, msg} = res
            weui.toast(msg, 2000)
            if (state === 1000) {
                socket_connect()
            }else{
                socket_connect()
            }
        })
    }

    const code = getQueryString('code')
    console.log('微信code')
    console.log(code)
    if (code) {
        // 获取openId
        const url = `${preUrl}/api/wx/openid?code=${code}`
        $.get(url, function (res) {
            console.log('获取openId')
            console.log(res)
            const {data, state} = res
            if (state === 1000) {
                const {openid} = data
                // 保存openId
                localStorage.setItem('openId', openid)
                // 报名
                const params = {openId: openid}
                takePartIn(params)
            }
        })
    }

    // ##### 点击事件 #######

    $('.join-button').on('click', function name() {
        console.log('报名参加')
        // 检查是否已获取openID
        const openId = localStorage.getItem('openId')
        if (openId === undefined || openId === null) {
            console.log('未获取公众号openId')
            console.log('先获取微信code')
            window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectURI}&response_type=code&scope=snsapi_userinfo#wechat_redirect`
        } else {
            console.log('已获取公众号openId，报名')
            // 报名
            const params = {openId}
            takePartIn(params)
        }
    })
}
