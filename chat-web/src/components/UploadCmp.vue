<template>
  <div class="upload-cmp">
    <input type="file" v-show="false" id="uploadFile" @change="uploadFile" />
    <label for="uploadFile">
      <slot></slot>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'upload-cmp',
  setup(props, { emit }) {
    const uploadFile = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (target) {
        const file = (target.files as FileList)[0]
        emit('uploadFile', file);
        (e.target as HTMLInputElement).value = ''
      }
    }

    return {
      uploadFile,
    }
  }
})
</script>
