import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/index',
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/index",
    name: "index",
    component: () => import("../views/Index.vue"),
    redirect: '/chat',
    children: [
      { path: '/chat', name: 'chat', component: () => import("../views/Chat.vue") },
      { path: '/friend', name: 'friend', component: () => import("../views/Friend.vue") },
      { path: '/file', name: 'file', component: () => import("../views/File.vue") },
    ]
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;