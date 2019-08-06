// const preUrl = 'http://47.107.180.247:7009'
const preUrl = 'http://119.23.136.26:7009'

// 获取URL参数
function getQueryString(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let r = window.location.search.substr(1).match(reg)
    if (r != null) return unescape(r[2])
    return null
}

window.onload = function () {
    // const openid = localStorage.getItem('openId')
    const openId = getQueryString('openid')
    // 获取中奖名单
    const url = `${preUrl}/api/activity/result`
    $.get(url, function (res) {
        console.log('获取中奖名单')
        console.log(res)
        const {data: params, state} = res
        if (state === 1000) {
            // 保存openId
            let rankingString = '谢谢参与'
            params && params.length > 0 && params.forEach((item, index) => {
                const {openid, ranking} = item
                console.log(`名次 ${ranking}`)
                if (openid === openId) {
                    if (ranking > 0) {
                        $('.reward').css('display', 'block')
                    }
                    if (ranking === 1 || ranking === '1') {
                        rankingString = '获得第一名'
                    }else if (ranking === 2 || ranking === '2') {
                        rankingString = '获得第二名'
                    }else if (ranking === 3 || ranking === '3') {
                        rankingString = '获得第三名'
                    }
                }
                $('.reward-info').html(rankingString)
            })
        }
    })

    // ##### 点击事件 #######

    $('.close-button').on('click', function name() {
        console.log('关闭')
        window.location.href = location.origin + '/index.html'
    })
}
