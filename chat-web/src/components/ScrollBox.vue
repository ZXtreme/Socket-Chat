<template>
  <div class="scroll-box">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { debounce } from '@/utils/utils';
import { onMounted, nextTick, getCurrentInstance, ComponentInternalInstance, defineComponent } from 'vue';

export default defineComponent({
  name: 'scroll-box',
  props: {
    // 是否开启高度监听
    listenHeight: {
      type: Boolean,
      default: false,
    },
    // 顶部触发距离
    topDistance: {
      type: Number,
      default: 0,
    },
    // 是否禁止顶部回调
    topDisabled: {
      type: Boolean,
      default: false,
    },
    // 底部触发距离
    bottomDistance: {
      type: Number,
      default: 0,
    },
    // 是否禁止底部回调
    bottomDisabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    // 当前实例
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    // 生命周期
    onMounted(() => {
      if (props.listenHeight) {
        const debounceFunc = debounce(scrollCb);
        // 开启监听
        proxy?.$el.addEventListener('scroll', debounceFunc);
      }
    });

    // methods
    // 滚动的回调
    const scrollCb = function (e: MouseEvent) {
      const el = e.target as HTMLElement
      const elScrollTop = el.scrollTop
      const elScrollHeight = el.scrollHeight
      const elClientHeight = el.clientHeight
      if (!props.topDisabled && elScrollTop <= props.topDistance) {
        // 触顶
        emit('touchTop');
      } else if (!props.bottomDisabled && elScrollHeight - elScrollTop - elClientHeight <= props.bottomDistance) {
        // 触底
        emit('touchBottom');
      }
    };

    // 判断是否触底
    const getIsBottom = function (distance: number) {
      let el = proxy?.$el;
      return el.scrollHeight - el.scrollTop - el.clientHeight <= distance;
    };

    // 滚动到 top 位置
    const scrollToFunc = function (behavior = 'smooth', top = 99999999) {
      proxy?.$el.scrollTo({
        top,
        behavior,
      });
    };

    // 数据插入数组后保持当前高度
    const keepHeight = async (callback: any) => {
      // 加载数据前获取高度
      const originHeight = proxy?.$el.scrollHeight;

      await callback();

      // 数据渲染完成后恢复原来的高度
      nextTick(() => {
        scrollToFunc('auto', proxy?.$el.scrollHeight - originHeight);
      });
    };

    return {
      scrollCb,
      getIsBottom,
      scrollToFunc,
      keepHeight,
    };
  },
});
</script>

<style scoped></style>
