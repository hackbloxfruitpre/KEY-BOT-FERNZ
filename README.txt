TFV KEY - BO DU AN DAY DU

CAU TRUC:
- bot.py: bot Telegram quan tri, tao KEY va ghi truc tiep vao GitHub.
- public/index15.html: trang lay KEY 15P (CSS/JS da nam trong HTML).
- public/index25.html: trang lay KEY 25P (CSS/JS da nam trong HTML).
- netlify/functions/claim.mjs: backend cap KEY va xoa KEY da cap khoi GitHub.
- keys/key15p.txt, keys/key25p.txt: kho KEY.
- netlify.toml: cau hinh Netlify.

1) BOT TERMUX:
  pkg update -y
  pkg install python -y
  pip install pyTelegramBotAPI requests
  Sua BOT_TOKEN, ADMIN_ID, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH o dau bot.py
  Chay: python bot.py

2) GITHUB TOKEN:
  Fine-grained token, chi chon repository nay, Repository permissions > Contents > Read and write.
  Khong chia se token, khong dua token vao HTML.

3) NETLIFY:
  Ket noi deploy repository bang Git (Netlify Functions khong chay voi static drag-and-drop don gian).
  Build publish directory: public
  Functions directory: netlify/functions
  Them Environment variables:
    GITHUB_TOKEN
    GITHUB_OWNER
    GITHUB_REPO
    GITHUB_BRANCH (main neu dung main)
    TELEGRAM_BOT_TOKEN (tuy chon, de nhan thong bao)
    TELEGRAM_ADMIN_ID (tuy chon)
  Sau do redeploy.

4) KHO KEY:
  Hai file keys/key15p.txt va keys/key25p.txt phai ton tai.
  Bot tao KEY se them vao file tuong ung.
  Website claim se xoa KEY dau tien sau khi cap.
  Moi dong mot KEY theo dang TFV-XXXX-XXXX-XXXX.

CANH BAO:
- Khong commit bot.py co token vao repository cong khai. Tot nhat luu bot.py rieng tren dien thoai va khong upload len GitHub.
- Bot va Netlify cung ghi/xoa kho GitHub. SHA giup phat hien mot so xung dot, nhung khong dam bao giao dich nguyen tu khi nhieu yeu cau cung luc. He thong co luong truy cap cao nen dung co so du lieu co transaction.
- Endpoint cap KEY hien chua co ma truy cap/chong spam. Can them rate limit/xac thuc neu mo cong khai.
- Chi chia se trang website; khong chia se BOT_TOKEN/GITHUB_TOKEN.
