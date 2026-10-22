// Netlify Function: lấy một KEY, xóa khỏi kho GitHub rồi trả về website.
const FILES = { "15": "keys/key15p.txt", "25": "keys/key25p.txt" };
const pattern = /^TFV-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function json(statusCode, body) {
  return { statusCode, headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  }, body: JSON.stringify(body) };
}

export default async (request) => {
  if (request.httpMethod !== "POST") return json(405, { ok:false, error:"Method not allowed" });
  const url = new URL(request.url);
  const tier = url.searchParams.get("type");
  if (!FILES[tier]) return json(400, { ok:false, error:"Loại KEY không hợp lệ" });

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !owner || !repo) return json(500, {ok:false,error:"Server chưa cấu hình GitHub"});

  const path = FILES[tier];
  const api = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path}`;
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  try {
    // Tối đa 3 lần thử nếu SHA thay đổi do cập nhật đồng thời.
    for (let attempt=0; attempt<3; attempt++) {
      const read = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, {headers});
      if (!read.ok) return json(502, {ok:false,error:"Không đọc được kho KEY GitHub"});
      const file = await read.json();
      const decoded = Buffer.from(file.content.replace(/\n/g,""), "base64").toString("utf8");
      const keys = decoded.split(/\r?\n/).map(x=>x.trim()).filter(x=>pattern.test(x));
      if (!keys.length) return json(404, {ok:false,error:"Kho KEY đã hết"});

      const key = keys[0];
      const remaining = keys.slice(1);
      const content = remaining.length ? remaining.join("\n")+"\n" : "";
      const put = await fetch(api, {
        method:"PUT",
        headers:{...headers,"Content-Type":"application/json"},
        body:JSON.stringify({
          message:`Claim ${tier}P key`,
          content:Buffer.from(content,"utf8").toString("base64"),
          sha:file.sha,
          branch
        })
      });

      if (put.ok) {
        // Thông báo quản trị tùy chọn, không làm hỏng việc cấp KEY nếu Telegram lỗi.
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const adminId = process.env.TELEGRAM_ADMIN_ID;
        if (botToken && adminId) {
          try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body:JSON.stringify({chat_id:adminId,text:`🔔 Có người vừa lấy KEY ${tier}P\nKEY: ${key}\nCòn lại: ${remaining.length}`})
            });
          } catch (_) {}
        }
        return json(200,{ok:true,key});
      }
      if (put.status !== 409 && put.status !== 422) return json(502,{ok:false,error:"Không cập nhật được kho KEY"});
    }
    return json(409,{ok:false,error:"Kho KEY đang được cập nhật, hãy thử lại"});
  } catch (e) {
    return json(500,{ok:false,error:"Lỗi máy chủ"});
  }
};
