# XAI FE (Frontend)

This is a **Next.js frontend application** bootstrapped using  
[`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

---

## Prerequisites

Before running this project, make sure the following tools are installed on your system.

---

### 1. Node.js (Required)

This project requires **Node.js v18 or later**.

#### Check if Node.js is installed
Run:
```bash
node -v
````

If you see a version like `v18.x.x` or higher, you’re good to go 
If not, follow the installation steps below.

---

#### 🪟 Install Node.js (Windows)

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version**
3. Run the installer and follow the steps
4. Restart your terminal
5. Verify installation:

```bash
node -v
npm -v
```

---

####  Install Node.js (Linux – Ubuntu/Debian)

```bash
sudo apt update
sudo apt install nodejs npm -y
```

Verify:

```bash
node -v
npm -v
```

>  If the version is below v18, install using **Node Version Manager (nvm)**.

---

#### Install Node.js (macOS)

Using Homebrew:

```bash
brew install node
```

Verify:

```bash
node -v
npm -v
```

---

### 2. Git (Optional but Recommended)

Check:

```bash
git --version
```

Install from: [https://git-scm.com](https://git-scm.com)

---

## Project Setup

### Clone the Repository

```bash
git clone <your-repo-url>
cd xai-fe
```

---

### Install Dependencies

```bash
npm install
```

This installs all dependencies listed in `package.json`.

---

### Environment Variables

Create a `.env.local` file in the root directory if it doesn’t exist:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Update values based on your backend configuration.

---

##  Running the Project

### Start Development Server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:3000
```

---

##  Build for Production

```bash
npm run build
```

Start production server:

```bash
npm run start
```

---

##  Project Structure

```
xai-fe/
├── public/          # Static assets
├── src/             # Application source code
├── .env.local       # Environment variables
├── package.json     # Dependencies & scripts
├── next.config.ts   # Next.js configuration
├── tsconfig.json    # TypeScript configuration
└── README.md
```

---

## Tech Stack

* **Next.js**
* **React**
* **TypeScript**
* **PostCSS**
* **ESLint**

---

## Notes

* Make sure **Node.js version compatibility** is maintained
* Do not commit `.env.local` to Git
* Restart the dev server after changing environment variables



