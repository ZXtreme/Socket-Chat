// 生成uuid (Universally Unique Identifier，通用唯一标识符)
export function guid() {
  function S4() { // 随机生成 0000 - ffff 的字符串
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) // +1 是为了不用补前导零
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

// 防抖
export function debounce(callback: any) {
  let timer = -1;
  return function (params: { [propname: string]: any }, delay = 200) {
    if (timer) clearTimeout(timer)
    // setTimeout返回的是id
    timer = setTimeout(() => {
      callback(params)
    }, delay)
  }
}

// 节流
export function throttle(callback: any) {
  let timer = -1;
  return function (params: { [propname: string]: any }, delay = 200) {
    if (timer) return
    timer = setTimeout(() => {
      callback(params)
      timer = -1;
    }, delay)
  }
}

// 将文本中的 [emoji-xxx] 转化为对应的 emoji 标签
export function transToTag(content: string, size = 24) {
  const reg = /\[([a-z]+)-([0-9]+)\]/g;
  if (!content) return ''
  return content.replace(reg, (res, $1, $2) => {
    const digit_$2 = parseInt($2)
    if ($1 === 'emoji' && digit_$2 >= 1 && digit_$2 <= 124) return `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=" alt="[emoji-${$2}]" style="height: ${size - 0.083 * size}px;width: ${size}px;background: url(${require("@/assets/emoji/emoji.png")});background-repeat: no-repeat;background-size: ${size}px;margin:0 1px;background-position:0 ${-size * $2}px;vertical-align: text-bottom;" draggable="false">`
    return `[${$1}-${$2}]`
  })
}