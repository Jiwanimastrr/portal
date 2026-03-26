import { onRequestPost as __api_submit_js_onRequestPost } from "/Users/jiwanjeon/Downloads/안티그래비티/00.통합사이트/functions/api/submit.js"

export const routes = [
    {
      routePath: "/api/submit",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_submit_js_onRequestPost],
    },
  ]