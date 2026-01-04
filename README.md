# Korea Travel Planner (Google Sheets Backend)

這是一個韓國旅遊行程規劃 App，使用 React (Vite) 開發，並以 Google Sheets 作為資料庫儲存。

## 🚀 特色功能
- **Google Sheets 儲存**: 使用 GAS 作為 Web App 轉接層，資料永不過期。
- **Optimistic Updates**: 樂觀更新設計，操作不卡頓，背景自動同步。
- **Naver Map 整合**: 一鍵開啟韓文地址導航，韓國旅遊必備。
- **AI 導遊解說**: 整合 Gemini AI，為每個景點提供在地知識。
- **即時匯率記帳**: 自動獲取 KRW/TWD 匯率，並記錄當下匯率常數。

## 🛠️ 開發環境啟動

1. **安裝依賴**:
   ```bash
   npm install
   ```
2. **設定環境變數**:
   複製 `.env.example` 為 `.env` 並填入：
   - `VITE_GOOGLE_SHEET_ID`: 你的試算表 ID
   - `VITE_GAS_WEBAPP_URL`: Google Apps Script 部署後的 Web App URL

3. **啟動開發伺服器**:
   ```bash
   npm run dev
   ```

## 📊 Google Sheets### 資料表結構 (Sheet Tabs)

為了支援多使用者數據隔離，請在以下分頁的**最後一欄**（或指定位置）新增 `userId` 欄位：

1. **Users**: `username`, `password`, `tripId` (userId = username)
2. **Meta**: `userId`, `title`, `startDate`, `endDate`
3. **Itinerary**: `id`, `day`, `title`, `category`, `time`, `address`, `addressKR`, `budget`, `aiInsight`, `userId`
4. **Logistics**: `type`, `data` (JSON), `userId`
5. **Checklist**: `id`, `category`, `text`, `isChecked`, `userId`
6. **Expenses**: `id`, `title`, `amountKRW`, `amountTWD`, `date`, `category`, `exchangeRate`, `userId`

> [!IMPORTANT]
> **userId** 欄位必須與 **Users** 表中的 `username` 一致，系統才能正確過濾屬於該使用者的資料。

---

## 故障排除 (Bug Fixes)
- **日期偏位修正**: 統一使用 `YYYY-MM-DD` 字串處理。
- **登入介面升級**: 從代碼登入改為 **帳號密碼登入**，支援 **永久登入 (Persistence)**。

## 🔗 Google Apps Script (GAS) 部署指南
1. 開啟 Google Sheet，點選 `Extensions` -> `Apps Script`。
2. 貼入 `services/gas_template.gs` 的內容，並修改 `SHEET_ID`。
3. 點選 `Deploy` -> `New Deployment` -> `Web App`。
4. 設定 `Execute as: Me` 且 `Who has access: Anyone`。
5. **重要：** 部署後的 **Web App URL** 即為 App 所需的 API 網址。

## 🚀 自動部署 (GitHub Actions)

本專案已設定好 GitHub Actions 自動化部署流程。只要你將程式碼推送到 GitHub，系統就會自動建置並發布到 GitHub Pages。

### 設定步驟：

1. 將本專案上傳至 GitHub。
2. 進入 GitHub Repositories 的 **Settings** (設定) 頁面。
3. 點選左側選單的 **Secrets and variables** > **Actions**。
4. 點選 **New repository secret**，新增以下兩個變數（參考 `.env.example`）：
   - name: `VITE_GOOGLE_SHEET_ID`
     - value: (填入你的 Google Sheet ID)
   - name: `VITE_GAS_WEBAPP_URL`
     - value: (填入你的 GAS Web App URL)
5. 推送程式碼到 `main` 分支，GitHub Actions 就會自動開始部署 🚀。
6. 設定 GitHub Pages：
   - 部署完成後，進入 **Settings** > **Pages**。
   - 在 **Build and deployment** > **Branch** 選擇 `gh-pages` 分支 (由 Action 自動建立)。
   - 儲存後，你就會獲得專屬的 App 網址了！

## 🤖 自動化部署
當程式碼推送到 `main` 分支時，GitHub Actions 會自動執行並部署至 GitHub Pages。
