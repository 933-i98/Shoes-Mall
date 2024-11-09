import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.mount("#app");

// 添加全局错误处理
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// 处理 ResizeObserver 错误
const resizeHandler = debounce(() => {
  const messages = [
    "ResizeObserver loop completed with undelivered notifications.",
    "ResizeObserver loop limit exceeded",
  ];

  const error = (error) => {
    if (messages.includes(error.message)) {
      const resizeObserverErr = error;
      resizeObserverErr.name = "ResizeObserverError";
      window.dispatchEvent(new ErrorEvent("error", { error }));
    }
  };

  window.addEventListener("error", error);
}, 250);

window.addEventListener("resize", resizeHandler);
