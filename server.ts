import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const RTDB_URL = "https://project-a-ff1a9-default-rtdb.asia-southeast1.firebasedatabase.app";

  // Meta tag injection logic
  const getHtmlWithMeta = async (req, template, vite) => {
    const { uid, id } = req.params;
    let title = "Bloodnet | ব্লাডনেট";
    let description = "একটি আধুনিক রক্তদান এবং দাতা ম্যানেজমেন্ট প্ল্যাটফর্ম। প্রাণের টানে রক্তের বন্ধন।";
    let image = "https://api.dicebear.com/7.x/pixel-art/svg?seed=bloodnet";

    try {
      if (uid) {
        // Profile Request
        const res = await fetch(`${RTDB_URL}/users/${uid}.json`);
        const userData = await res.json();
        if (userData) {
          title = `${userData.fullName} | Blood Group: ${userData.bloodGroup}`;
          description = `${userData.occupation || 'Life Saver'} • ${userData.district || 'Location'} • ব্লাডনেট - প্রাণের টানে রক্তের বন্ধন।`;
          image = userData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`;
        }
      } else if (id) {
        // Post Request
        const res = await fetch(`${RTDB_URL}/announcements/${id}.json`);
        const postData = await res.json();
        if (postData) {
          title = postData.title || "Announcement | Bloodnet";
          description = postData.content || description;
          if (postData.media && postData.media[0]) {
            image = postData.media[0].url;
          }
        }
      }
    } catch (e) {
      console.error("Meta fetch error:", e);
    }

    const metaTags = `
      <title>${title}</title>
      <meta name="description" content="${description}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${image}">
      <meta property="og:type" content="website">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${image}">
    `;

    let html = template;
    if (vite) {
      html = await vite.transformIndexHtml(req.originalUrl, template);
    }
    
    // Simple regex replacement for title and injection for others
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace("</head>", `${metaTags}</head>`);
    
    return html;
  };

  // Route for profiles
  app.get("/profile/:uid", async (req, res, next) => {
    try {
      const templatePath = process.env.NODE_ENV === "production" 
        ? path.resolve(__dirname, "dist/index.html") 
        : path.resolve(__dirname, "index.html");
      
      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let template = fs.readFileSync(templatePath, "utf-8");
      const html = await getHtmlWithMeta(req, template, (process.env.NODE_ENV !== "production" ? app.get('vite') : undefined));
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      next(e);
    }
  });

  // Route for posts
  app.get("/post/:id", async (req, res, next) => {
    try {
      const templatePath = process.env.NODE_ENV === "production" 
        ? path.resolve(__dirname, "dist/index.html") 
        : path.resolve(__dirname, "index.html");

      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let template = fs.readFileSync(templatePath, "utf-8");
      const html = await getHtmlWithMeta(req, template, (process.env.NODE_ENV !== "production" ? app.get('vite') : undefined));
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      next(e);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Store vite instance
    app.set('vite', vite);
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
