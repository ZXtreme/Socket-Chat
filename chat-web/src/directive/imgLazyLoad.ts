// 加载失败显示的图片
const defaultImg = './assets/img/img_fail.jpg'

export default {
  mounted(el: HTMLImageElement) {
    const observe = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { // 元素进入视口
          const img = entry.target;
          const data_src = img.getAttribute('data-src') as string
          img.setAttribute('src', data_src)
          img.removeAttribute('data-src')
          img.addEventListener('error', () => { // 图片加载失败时的处理
            img.setAttribute('src', defaultImg); // 替换为错误占位图像的路径
          });
          observe.unobserve(img)
        }
      })
    })

    // dom 的创建渲染需要一定时间，这里延迟 200 毫秒获取，不然会获取不到里面的 img 属性
    const init = () => {
      observe.disconnect()
      setTimeout(() => {
        const imgs = el.querySelectorAll('img[data-src]')
        imgs.forEach(img => {
          observe.observe(img)
        })
      }, 200)
    }

    const observeMutation = new MutationObserver(() => {
      init()
    });

    // 配置 MutationObserver，指定观察所有后代节点的变化
    const config = { childList: true, subtree: true };

    // 开始观察目标元素及其后代节点的变化
    observeMutation.observe(el, config);
  }
}