export const eventsRoutes = [
  {
    path: "events",
    name: "DashboardEvent",
    component: () => import("pages/Events/EventsPage.vue"),
    redirect: { name: "EventList" },
    meta: {
      requiredAuth: true,
    },
    children: [
      {
        path: "list",
        name: "EventList",
        component: () => import("pages/Events/EventList.vue"),
      },
      {
        path: "create",
        name: "EventCreate",
        component: () => import("pages/Events/EventCreate.vue"),
      },
      {
        path: "create-massive",
        name: "EventCreateMassive",
        component: () => import("pages/Events/EventCreate.vue"),
      },
    ],
  },
];
