import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/admin-login",
    name: "AdminLogin",
    component: () => import("../views/AdminLogin.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../views/Cart.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Register.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/category/:id",
    name: "Category",
    component: () => import("../views/CategoryProducts.vue"),
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: () => import("@/views/ProductDetail.vue"),
  },
  {
    path: "/payment",
    name: "Payment",
    component: () => import("@/views/Payment.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/Profile.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/views/admin/AdminLogin.vue"),
  },
  {
    path: "/admin",
    component: () => import("@/views/admin/Dashboard.vue"),
    redirect: "/admin/products",
    children: [
      {
        path: "products",
        name: "Products",
        component: () => import("@/views/admin/Products.vue"),
      },
      {
        path: "products/add",
        name: "AddProduct",
        component: () => import("@/views/admin/AddProduct.vue"),
      },
      {
        path: "users",
        name: "Users",
        component: () => import("@/views/admin/Users.vue"),
      },
      {
        path: "orders",
        name: "Orders",
        component: () => import("@/views/admin/Orders.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("token");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem("token");
//   if (to.path.startsWith("/admin") && to.path !== "/admin/login" && !token) {
//     next("/admin/login");
//   } else {
//     next();
//   }
// });

export default router;
