<template>
  <audio :src="audioSrc" hidden ref="toneAudio"></audio>
</template>

<script lang="ts">
import { getCurrentInstance, defineComponent, reactive, ComponentInternalInstance, toRefs } from 'vue'

export default defineComponent({
  setup() {
    const state = reactive({
      audioSrc: require('@/assets/audio/msg_tone.mp3'),
    })
    const { proxy } = getCurrentInstance() as ComponentInternalInstance

    const playTone = function () {
      const toneAudio = proxy?.$refs.toneAudio as HTMLAudioElement
      // 判断是否正在播放提示音
      if (!toneAudio.paused) return

      toneAudio.currentTime = 0  // 音频从指定时间开始播放

      // 受到浏览器限制，第一次播放需要用户操作，没想这块业务要怎么解决 直接捕获异常了
      toneAudio.play().catch((err) => {
        console.log(err);
      })
    }

    return {
      ...toRefs(state),
      playTone,
    }
  },
})
</script>

<style></style>
