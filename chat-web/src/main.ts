import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/css/base.css"
import clickOutside from "./directive/clickOutside"
import imgLazyLoad from "./directive/imgLazyLoad";
import antDesign from "./utils/antDesign";

const app = createApp(App);
// 自定义指令
app.directive('clickoutside', clickOutside)
app.directive('lazyload', imgLazyLoad)

app.use(antDesign)
app.use(store).use(router).mount("#app");
