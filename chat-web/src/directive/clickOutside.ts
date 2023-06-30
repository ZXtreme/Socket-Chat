// 自定义指令点击空白关闭 box

const clickOutsideDirective = {
  mounted(el: HTMLElement, binding: any) {
    // 定义点击外部区域触发的回调函数
    const onClickOutside = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {  // 判断点击的区域是否在绑定的元素外部
        binding.value(event);  // 执行绑定指令时传入的回调函数
      }
    };
    document.addEventListener('click', onClickOutside);
    (el as any)._clickOutside = onClickOutside; // 在元素上存储回调函数的引用，以便解绑时移除监听器
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', (el as any)._clickOutside);
    delete (el as any)._clickOutside;
  }
}

export default clickOutsideDirective