# 🚀 Automated Job Tracker Pipeline

A fully automated, 100% stateless Node.js background worker that scans your Gmail for job applications, uses AI to parse the company and role, and automatically logs them into a Notion database.

## 🌟 Features
- **Gmail Integration:** Polls your inbox for recent job applications.
- **AI-Powered Filtering:** Uses an LLM (via Zorveus or OpenAI) to extract structured data and ruthlessly ignore newsletters and job alerts.
- **Notion Sync:** Pushes valid applications directly to a Notion Database.
- **Stateless & Cloud-Ready:** Uses Notion as the source of truth for deduplication, meaning it can be deployed on ephemeral cloud hosts (like Render or Railway) without losing state.

---

## 🛠️ Prerequisites

Before you begin, you will need:
1. **Notion API Key** & Database ID
2. **Google Cloud OAuth Credentials** (Desktop App, to access Gmail)
3. **Zorveus (or OpenAI) API Key** (For the AI extraction)

### 1. Notion Setup
1. Create a "Full Page" Database in Notion with the following exactly-named columns:
   - `S/N` (Title property)
   - `Company` (Rich text)
   - `Role` (Rich text)
   - `Status` (Multi-select)
   - `Date` (Date property)
   - `EmailID` (Text property - *you can hide this in your view, it's used for deduplication*)
2. Go to [Notion Integrations](https://www.notion.so/my-integrations) and create a new integration to get your API Key.
3. Share your database page with the integration you just created.

### 2. Gmail Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API**.
3. Create an **OAuth Consent Screen** (External). Add your email as a "Test user".
4. Create **Credentials** > **OAuth client ID** > **Desktop app**.
5. Download the JSON and save it in the root folder as `credentials.json`.

---

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/job-tracker-pipeline.git
   cd job-tracker-pipeline
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   # Notion
   NOTION_API_KEY=secret_...
   NOTION_DATABASE_ID=your_database_id

   # AI API
   ZORVEUS_API_KEY=zrv_...

   # Google
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost
   ```

3. **Generate your Gmail Token:**
   Run the auth script to get your login link:
   ```bash
   node getAuthUrl.js
   ```
   Click the link, log in, and you will be redirected to a `localhost` URL that will likely say "Site cannot be reached". Copy the entire URL from your browser's address bar. 

   Extract the `code=` value from the URL and run:
   ```bash
   node getToken.js "YOUR_EXTRACTED_CODE_HERE"
   ```
   This will generate a `token.json` file.

4. **Run it locally:**
   ```bash
   npm start
   ```
   The script will immediately process the last 30 days of emails and then poll every 5 minutes.

---

## ☁️ Cloud Deployment (Render / Railway)

Because cloud hosts use ephemeral file systems, this bot is designed to be **stateless**. Instead of tracking processed emails in a local JSON file, it queries your Notion database to check for existing `EmailID`s.

1. **Push to GitHub:**
   Your `.gitignore` will safely exclude `.env`, `credentials.json`, and `token.json`.
   ```bash
   git add .
   git commit -m "Deploying to cloud"
   git push origin main
   ```

2. **Deploy as a Background Worker:**
   - Go to [Render](https://render.com) or [Railway](https://railway.app).
   - Create a new **Background Worker** (or standard app running `npm start`).
   
3. **Configure Environment Variables in the Cloud:**
   Since your secrets aren't on GitHub, you must paste them into the host's environment variable settings:
   - `NOTION_API_KEY`
   - `NOTION_DATABASE_ID`
   - `ZORVEUS_API_KEY`
   - `GOOGLE_CREDENTIALS` (Paste the *entire contents* of your `credentials.json` file as a single string)
   - `GOOGLE_TOKEN` (Paste the *entire contents* of your `token.json` file as a single string)

Once deployed, your bot will run silently in the background 24/7!
