# 🌊 Humpback Hydro Concept

Welcome to the **Humpback Hydro Concept** repository! This is a modern, high-performance web application concept built on the edge. 🚀

## ✨ Features

- **⚡ Blazing Fast:** Powered by [vinext](https://github.com/cloudflare/vinext) and Vite for an incredibly fast development and production experience.
- **🛠️ Full-Stack:** Seamless frontend and backend integration.
- **🗄️ Edge Databases:** Integrated with Cloudflare D1 and Drizzle ORM for serverless database access.
- **🎨 Modern Styling:** Styled beautifully using Tailwind CSS.
- **🔒 Secure Authentication:** Optional dispatch-owned ChatGPT sign-in helpers included.

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js `>=22.13.0`
- Linux environment (requires `flock`, `curl`, and GNU `timeout` for CI scripts)

### Installation

1. **Install dependencies:**
   ```bash
   npm run install:ci
   ```
   *(Note: This uses a locked, optimized CI install process.)*

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will spin up the Vite/Vinext development server locally.

3. **Build the artifact:**
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `app/` - Your main site code lives here. Edit away!
- `db/` - Database schemas and index files.
- `public/` - Static assets like images and audio.
- `scripts/` - CI/CD and build validation shell scripts.

## 🧰 Diagnostic Commands

Here are some helpful commands to manage your workflow:
- `npm run dev` 🛠️ Start the local development server.
- `npm run build` 🏗️ Build and validate the deployable artifact.
- `npm run start` 🏁 Start the built Vinext application.
- `npm test` 🧪 Validate and verify rendered development previews.
- `npm run db:generate` 🗃️ Generate Drizzle migrations after schema changes.

## 📚 Learn More

Dive deeper into the technologies powering this project:
- 📖 [vinext Documentation](https://github.com/cloudflare/vinext)
- 📖 [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

---
*Built with ❤️ and powered by Cloudflare edge architecture.*
