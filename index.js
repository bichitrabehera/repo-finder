const express = require('express');
const axios = require("axios"); // Import axios

const PORT = 8000;
const app = express();

app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.set('views', 'views'); // Ensure Express looks for views in the "views" folder

app.use(express.static('public')); // Serve static files from "public" folder
app.use(express.json()); // Middleware to parse JSON requests

let history = []; // Store history in memory (use a database in production)

// Home Page
app.get('/', (req, res) => {
    res.render('index'); // Render "views/index.ejs"
});

// Search GitHub Repositories
app.get("/search", async (req, res) => {
    const domain = req.query.domain;
    if (!domain) return res.json({ error: "No domain provided" });

    try {
        const response = await axios.get(
            `https://api.github.com/search/repositories?q=${domain}+in:readme,description`,
            {
                headers: {
                    "User-Agent": "request", // GitHub requires a user agent
                },
            }
        );

        const repos = response.data.items.map(repo => ({
            name: repo.name,
            html_url: repo.html_url,
            description: repo.description || "No description",
            stars: repo.stargazers_count,
        }));

        res.json({ repos });
    } catch (error) {
        console.error("GitHub API Error:", error.message);
        res.json({ error: "Failed to fetch data from GitHub" });
    }
});

app.post('/add-to-history', (req, res) => {
    const { repoName } = req.body;

    if (!repoName) {
        return res.status(400).json({ error: "Missing repoName" });
    }

    if (!history.includes(repoName)) {
        history.push(repoName);
    }

    res.json({ success: true, history });
});


// ✅ Fix: Render the History Page with Stored History
app.get('/history', (req, res) => {
    res.render('history', { history });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
