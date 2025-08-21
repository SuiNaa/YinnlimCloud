export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 先照請求路徑直接拿靜態檔
    let resp = await env.ASSETS.fetch(request);

    // 若 404，回退到 /index.html（確保首頁一定出來）
    if (resp.status === 404) {
      const fallbackReq = new Request(new URL("/index.html", url), request);
      resp = await env.ASSETS.fetch(fallbackReq);
    }

    return resp;
  }
}
