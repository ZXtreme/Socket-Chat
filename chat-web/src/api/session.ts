import { Session } from '@/type'
import request from '@/utils/request'

// 获取会话列表数据
const api_getSessionList = (params: { lastTime?: string }) => {
  return request.get('/sessions/get_session_list', { params }) as unknown as getSessionListType
}

type getSessionListType = {
  code: number,
  list: Session[],
  total: number,
}

export {
  api_getSessionList,
}