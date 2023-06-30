import { Subscribe } from "@/type";
import { onBeforeUnmount } from "vue";

export default function (subList: Subscribe[]) {
  subList.forEach((item, index, list) => {
    // 订阅一个事件，并将订阅事件的的标识符记录下来，便于后续取消订阅
    list[index]['token'] = PubSub.subscribe(item.msgName, item.callback)
  })

  onBeforeUnmount(() => {
    subList.forEach(item => {
      PubSub.unsubscribe(item.token as string)
    })
  })
}