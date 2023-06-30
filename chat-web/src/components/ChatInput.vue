<template>
  <div class="input-container">
    <div class="chat-input" contenteditable @click="getLastLocation" @keydown="keydownFunc" @keyup="keyupFunc"
      @paste.prevent="pasteFunc" @input="inputFunc"></div>
  </div>
</template>

<script lang="ts">
import { transToTag } from '@/utils/utils';
import { reactive, toRefs, ComponentInternalInstance, defineComponent, getCurrentInstance, onMounted } from 'vue';
import { message } from 'ant-design-vue';

export default defineComponent({
  name: 'chat-input',
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const state = reactive({
      content: '',
    });

    // 光标最后的选区范围
    let lastLocation: Range | null
    // 输入框的 ref
    let chatInput: HTMLElement
    // 获取 Selection 对象，表示用户选择的文本范围或光标的当前位置
    let selection: Selection | null

    onMounted(() => {
      chatInput = proxy && proxy.$el.querySelector('.chat-input');
      selection = getSelection();
    });

    // 记录光标的位置
    const getLastLocation = (e?: MouseEvent) => {
      chatInput.focus();
      lastLocation = selection?.getRangeAt(0) as Range;

      // Range 对象表示一个文本范围或选择范围。
      // 通过调用 range.collapse(false)，可以将 Range 对象的起始位置和结束位置合并为一个点，将光标定位到该点的末尾
      if (!e || e.type !== 'click') {
        lastLocation.collapse(false);
      }
    };

    // 插入表情
    const addEmoji = (index: number) => {
      // 选择 emoji 时会 blur，因此需要插入 blur 前的光标位置处
      lastLocation || getLastLocation();

      const emoji = document.createElement('img');
      emoji.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=';
      emoji.alt = `[emoji-${index}]`;
      emoji.draggable = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      emoji.style = `
        height: 22px;
        width: 24px;
        background: url(${require('@/assets/emoji/emoji.png')});
        background-repeat: no-repeat;
        background-size: 24px;
        margin:0 1px;
        background-position:0 ${-24 * index}px;
        vertical-align: text-bottom;
      `;
      insertNode(emoji);
    };

    // 插入节点
    const insertNode = (node: Node) => {
      selection?.removeAllRanges();    // 这两行将光标移动到 lastLocation 处
      lastLocation && selection?.addRange(lastLocation);

      lastLocation?.deleteContents();  // 删除选区范围内的内容
      lastLocation?.insertNode(node);  // 在选区范围内插入新的节点

      getLastLocation()
    };

    // 发送消息
    const sendMsg = () => {
      let content = chatInput.innerHTML.trim();
      if (content === '') {
        message.warn('发送内容不能为空哦');
        return;
      } else if (content.length > 5000) {
        message.warn('发送内容长度不能超过5000哦');
        return;
      }

      content = getAltValue(content);
      content = content.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');

      emit('sendMsg', content);
      chatInput.innerHTML = '';
    };

    // 获取img标签中alt的值
    const getAltValue = (content: string) => {
      const reg = /<img.*?alt="(.*?)".*?>/g;
      return content.replace(reg, '$1');
    };

    // 粘贴事件
    const pasteFunc = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0];
      // 如果粘贴的是文件，直接发送该文件
      if (file) {
        emit('uploadFile', file);
        return;
      }

      // 只获取粘贴的文本内容
      let content = e.clipboardData?.getData('text');
      // 转义标签，防止用户手动插入标签
      content = content?.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
      content = content && transToTag(content);
      !content && (content = '')

      // 将文本插回光标处
      const textNode = document.createTextNode(content);
      insertNode(textNode)
    };

    // 输入的回调：contenteditable 末尾换行必须至少存在一个 \n
    const inputFunc = () => {
      if (!/\n$/.test(chatInput.innerHTML)) {
        let node = document.createTextNode('\n');
        chatInput.appendChild(node);
      }
    };

    // 键盘按下的回调
    const keydownFunc = (e: KeyboardEvent) => {
      const kc = e.key === "Enter";

      if (e.ctrlKey && kc) {   // ctrl + Enter 为换行
        e.preventDefault();
        const node = document.createTextNode('\n');
        getLastLocation()
        insertNode(node);
        chatInput.scrollTo({   // 让滚动条自动往上滚一行
          top: chatInput.scrollTop + 20,
          behavior: 'smooth',
        });
      } else if (kc) {         // Enter 为发送消息
        e.preventDefault();
        sendMsg();
      }
    };

    // 键盘弹起的回调
    const keyupFunc = (e: KeyboardEvent) => {
      let kc = e.key;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(kc)) {  // 方向键
        getLastLocation();
      } else if (kc === 'Backspace') {   // 删除键  在删完最后一行内容时会产生br
        if (/<br>/g.test(chatInput.innerHTML)) {
          chatInput.innerHTML = chatInput.innerHTML.replace(/<br>/g, '');
          const range = window.getSelection(); // 创建 range
          range?.selectAllChildren(chatInput); // range 选择 obj 下所有子内容
          range?.collapseToEnd(); // 光标移至最后
        }
      }
    };

    return {
      ...toRefs(state),
      addEmoji,
      pasteFunc,
      inputFunc,
      keydownFunc,
      keyupFunc,
      getLastLocation,
      sendMsg,
    };
  },
});
</script>

<style scoped>
.chat-input {
  height: 102px;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: scroll;
  line-height: 20px;
  padding: 0 22px;
}

.chat-input::selection {
  background-color: #279fdb;
}

.chat-input:focus {
  outline: none;
}
</style>
