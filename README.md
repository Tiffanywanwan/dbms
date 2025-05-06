
# NCCU 社團管理系統

本系統為針對大學生設計的社團管理平台，支援社團會員管理、社產管理與財務管理三大模組。使用者可登入後根據加入的社團及學期進行各項管理，並透過前後端串接與資料庫操作實現動態內容展示。

---

## 專案結構

```
project/
├── backend/
│   ├── db.js               # MySQL 資料庫連線設定
│   ├── server.js           # Node.js + Express 主伺服器程式
│   ├── homepage.js         # 登入後首頁資料邏輯處理
│
├── public/                 # 前端頁面
│   ├── login.html          # 登入畫面
│   ├── index.html          # 社團總覽首頁
│   ├── club.html           # 單一社團主頁（含三大管理選單）
│   ├── club.js             # club.html 行為控制
│   ├── ...                 # 其他子頁面（會員/社產/財務）
```

---

## 功能說明

  ### 使用者功能
  - 使用學號與密碼登入系統
  - 根據學期查看已加入社團
  - 點擊社團卡片進入社團頁面
  - 點擊頭像可查看與編輯個人資料

  ### 社團管理功能（依角色授權）
  - **會員管理**
    - 會員總覽、會員個資編輯、新增成員、權限設定
  - **社產管理**
    - 社產列表、詳細資料、借還登記、新增/編輯社產
  - **財務管理**
    - 個人繳費紀錄、繳費總覽、單一會員繳費明細

---

## 啟動方式

  ### 安裝套件
  ```bash
  npm install
  ```

  ### 啟動伺服器
  ```bash
  node server.js
  ```
  伺服器預設執行於 `http://localhost:3001`，靜態頁面會由 `/public` 提供。

---

## 技術架構

| 類別   | 使用技術                         |
|--------|----------------------------------|
| 前端   | HTML、CSS、Bootstrap、Tailwind、Bootstrap Icons、Vanilla JS |
| 後端   | Node.js、Express.js              |
| 資料庫 | MySQL，使用 `mysql2` 套件串接     |
| 工具   | VSCode、TablePlus               |

---

## 重要提醒！！！

- 須先建立 MySQL 資料表與帳號，並與 `db.js` 中設定相符。
- 請至 `db.js` 修改user, password, database名稱。
- 初期資料表需包含 `Member`, `Club`, `ClubMember` 等表格結構。
- 我有在github上傳一個SQL檔案 `dbms-project`，可以下載匯入table plus(建議使用相同名稱)。 (或在Table Plus新增"dbms-project"這個資料庫後，複製dbms-project.sql裡面的query，貼到sql editor，點Run All)
- 測試的時候建議使用學號110306001田柾國同學的帳號登入(我幫他加了三個社團)。
- 三大功能的子功能的命名建議參考club.html

