# LookGlass
<one-sentence Lookglass is a tool developed for >

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)  
2. [Tech Stack](#tech-stack)  
3. [Folder Structure](#folder-structure)  
4. [Quick Start](#quick-start)  
5. [Changelog](#changelog)  

---

## Project Overview
| Layer | What it does |
|-------|--------------|
| **Frontend** | Next 13 app directory (`lookglass-app/app/…`) – search UI, visualisation dashboard |
| **Backend**  | FastAPI (`lookglass-app/api/…`) – `/search-news` endpoint; aggregates articles from News API, Twitter, Blogs |
| **Persistence** | *None yet* – results cached client-side via `localStorage` |
| **Future** | Add Postgres for article history; Docker-Compose for one-command dev spin-up; Amazon AWS integration with Oisin workflow |

---

## Tech Stack
- **Frontend:** Next JS 13 • React 18 • Tailwind CSS • shadcn/ui
- **Backend:** Python 3.12 • FastAPI • Pydantic • Uvicorn

---

## Folder Structure
```text
lookglass-app/
├─ app/              # Next.js pages & components
│  ├─ searchpage/
│  │  └─ page.tsx    # Search UI (keyword, date, source)
│  ├─ visualisation/
│  └─ page.tsx       # Landing page with article cards 
├─ api/              # Backend 
│  ├─ autosapi.py    # FastAPI factory
│  └─ Tests          # Tests for the article processing
├─ .env              # Environmental variables
├─ components        # Article feed components
├─ Tests             # Tests for the article feeds
└─ README.md
```

## Quick start
### 1. Clone & Enter
```bash
git clone https://github.com/s3874130/lookglass-automation.git
cd lookglass-app
npm install
npm install --legacy-peer-deps         #If you are having issues with the dependency version for newer React modules
```

### 2. Setup Environmental Variables
```bash
# Create .env from template
cp .env.template .env       # Then insert your real API keys in the new .env file.
```

### 3. Activate the virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Start FastAPI backend server
```bash
python3 -m uvicorn api.autosapi:app --reload
```

### 5. Run client in a new terminal
```bash
cd lookglass-app
npm run dev
```
Open [`http://localhost:3000`](http://localhost:3000) with your browser to see the result.

---

## Changelog

All notable changes will be documented in this section.

### [v0.1.0] - 2025-05-14
#### Added
- Initial commit with Next.js template model
- Added Article page as the landing page
- Added all Article UI components
- Added business logic to the article page

### [v0.2.0] - 2025-05-15
#### Added
- Refractored article page
- Added helper functions

### [v0.3.0] - 2025-05-16
#### Added
- Added the search page template
- Fixed bgus with search logic

### [v0.4.0] - 2025-05-20
#### Added
- Added the footer and headers

### [v0.4.1] - 2025-05-20
#### Added
- Added CSS styling on the filters

### [v0.5.0] - 2025-05-22
#### Added
- Added dark themes
- Modularised the footer and headers

### [v0.6.0] - 2025-05-27
#### Added
- Added filtered results feature
- Updated useArticleFeed.ts with comments

### [v0.6.1] - 2025-05-28
#### Added
- Fixed bugs with the search feature

### [v0.7.0] - 2025-05-30
#### Added
- Added comments to the search page logic
- Added badges to colour code claim types
- Added underlining text for claims in article cards
- Added testing for final outputted results from backend

### [v0.8.0] - 2025-06-13
#### Added
- Integrated backend with front end
- Optimised backend FastAPI script to improve run time
- Changed search logic to incorporate a POST request to FastAPI
- Remove hard coded API keys and merge into a .env file

### [v0.8.1] - 2025-06-14
- Recovered search page after merging FastAPI server, lost code in merge process
- Added unit test for front end features

---
