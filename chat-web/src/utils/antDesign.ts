// ant-design UI组件库
import { Modal, Upload, Button, Tooltip } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css';
import type { App } from 'vue';

export default function (app: App) {
  app.use(Modal)
    .use(Upload)
    .use(Button)
    .use(Tooltip)
}