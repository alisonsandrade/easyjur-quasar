import { eventsRoutes } from "./events.routes";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    meta: {
      requiredAuth: true,
    },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("pages/IndexPage.vue"),
        meta: { requiredAuth: true },
      },
      {
        path: "about",
        name: "About",
        component: () => import("pages/About.vue"),
        meta: { requiredAuth: true },
      },
      ...eventsRoutes,
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("pages/LoginPage.vue"),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
