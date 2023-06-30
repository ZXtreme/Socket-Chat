<template>
  <div class="input-box" tabindex="1" @drop.prevent="dropFile" @dragover.prevent>
    <!-- 选项栏 -->
    <div class="function-bar">
      <div class="bar-left">
        <!-- emoji 框 -->
        <emoji-dialog @selectEmoji="selectEmoji">
          <i class="iconfont icon-biaoqing-xue"></i>
        </emoji-dialog>
        <!-- 文件框 -->
        <upload-cmp @uploadFile="uploadFile">
          <i class="iconfont icon-wenjianjiawenjianguanli"></i>
        </upload-cmp>
      </div>
      <div class="bar-right">
        <!-- 视频通话 -->
        <i class="iconfont icon-shipin" @click="videoHandler"></i>
      </div>
    </div>

    <!-- 输入框 -->
    <chat-input class="chat-input-cmp" ref="chatInput" @sendMsg="sendMsg" @uploadFile="uploadFile"></chat-input>

    <!-- 底部栏 -->
    <div class="bottom-bar">
      <div class="send" @click="(proxy?.$refs.chatInput as any).sendMsg()">发送</div>
    </div>
  </div>
</template>

<script lang="ts">
import { guid } from '@/utils/utils';
import ChatInput from '@/components/ChatInput.vue';
import EmojiDialog from '@/components/EmojiDialog.vue';
import UploadCmp from '@/components/UploadCmp.vue';
import Pubsub from 'pubsub-js';
import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
import { ComponentInternalInstance, getCurrentInstance, defineComponent } from 'vue';
import { FileInfo, InputChatItem } from '@/type';
import useWebRtc from '@/hooks/webrtc';
import { cloneDeep } from "lodash-es"

export default defineComponent({
  components: { ChatInput, EmojiDialog, UploadCmp },
  name: 'input-box',
  setup() {
    const store = useStore();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    // 发送消息的回调
    // type 0:文字   1:图片    2:文件    3:自定义表情    4: 通知   5: 视频邀请
    const sendMsg = (content: string | File, type = 0, fileInfo?: FileInfo) => {
      const chatItem: InputChatItem = {
        content,
        receiverId: store.state.currentSession.receiverId,
        uuid: guid(),
        type,
        sessionId: store.state.currentSession.sessionId,
        fileInfo,
        // 临时时间戳，在信息发送成功后会改为发送成功的时间
        updatedAt: new Date().getTime(),
      };
      store.state.socket?.emit('chat', chatItem);

      if (content instanceof File) {  // 如果是文件，转化为 blob 类型
        const chatOtherItem = cloneDeep(chatItem)
        chatOtherItem.content = URL.createObjectURL(chatOtherItem.content)
        Pubsub.publish('sendMsg', chatOtherItem);
      } else {
        Pubsub.publish('sendMsg', chatItem);
      }
    };

    // 选择表情的回调，type 0:emoji   1:自定义表情
    const selectEmoji = ({ type, item }: { type: number; item: number | string }) => {
      if (type === 0) {
        proxy && (proxy.$refs.chatInput as typeof ChatInput).addEmoji(item);
      } else if (type === 1) {
        sendMsg(item.toString(), 3);
      }
    };

    // drop 事件的回调
    const dropFile = (e: DragEvent) => {
      const file = e.dataTransfer && e.dataTransfer.files[0];
      file && uploadFile(file);
    };

    // 上传文件
    const uploadFile = (file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        message.warn('上传的文件不能超过 2M 哦');
        return;
      }
      const type = /image\/png|image\/jpeg|image\/gif/.test(file.type) ? 1 : 2;


      sendMsg(file, type, {
        fileName: file.name,
        size: file.size,
      });
    };

    // 发送视频邀请
    const videoHandler = () => {
      sendMsg('[视频通话]', 5);
      useWebRtc({ mode: 'sender', type: ['videoCall'] });
    };

    return {
      sendMsg,
      dropFile,
      uploadFile,
      selectEmoji,
      proxy,
      videoHandler,
      message,
    };
  },
});
</script>

<style scoped>
.input-box {
  /* background-color: #f5f5f5; */
  background-color: #f9f9f9;
  transition: 0.1s all ease;
  border-top: 1px solid rgb(233, 233, 233);
}

.input-box:focus-within {
  background-color: #fff;
  outline: none;
  box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.01);
}

.function-bar {
  display: flex;
  justify-content: space-between;
  padding: 2px 15px;
}

.bar-left {
  display: flex;
}

.iconfont {
  font-size: 20px;
  color: rgb(116, 116, 116);
}

.iconfont:hover {
  color: rgb(66, 66, 66);
}

.iconfont:active {
  /* color: #129611; */
  color: #2495ce;
}

.bar-left>*,
.bar-right>* {
  margin: 0 7px;
}

.bottom-bar {
  text-align: right;
  padding: 3px 22px;
}

.send {
  display: inline-block;
  padding: 3px 14px;
  background: #f5f5f5;
  color: rgb(110, 110, 110);
  font-size: 13px;
  border-radius: 3px;
  transition: 0.1s all ease;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.send:hover {
  /* background-color: #129611; */
  background-color: #3fa7e4;
  color: white;
}
</style>
