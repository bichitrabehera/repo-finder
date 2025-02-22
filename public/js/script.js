document.addEventListener("DOMContentLoaded", function () {
    loadSearchResults(); // Load previous search results when the page reloads

    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const domain = document.getElementById("domainInput").value.trim();
            if (!domain) return alert("Please enter a domain");

            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "Searching...";

            try {
                const res = await fetch(`/search?domain=${domain}`);
                const data = await res.json();

                if (data.repos.length === 0) {
                    resultsDiv.innerHTML = "<p class='text-red-600'>No repositories found.</p>";
                    return;
                }

                // ✅ Save search results and query in localStorage
                localStorage.setItem("lastSearch", JSON.stringify(data.repos));
                localStorage.setItem("lastQuery", domain);

                displaySearchResults(data.repos);
            } catch (error) {
                resultsDiv.innerHTML = "<p class='text-red-600'>Error fetching data.</p>";
            }
        });
    }
});

// ✅ Function to Display Search Results
function displaySearchResults(repos) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = repos
        .map(repo => `
            <div class="p-4 bg-gray-900 text-white border border-gray-600">
                <a href="${repo.html_url}" 
                   class="text-blue-400 font-bold" 
                   target="_blank"
                   onclick="addToHistory('${repo.name}', '${repo.html_url}')">
                   ${repo.name}
                </a>
                <p>${repo.description || "No description available"}</p>
                <span class="text-gray-400">⭐ ${repo.stars}</span>
            </div>
        `)
        .join("");
}

// ✅ Load Search Results from localStorage on Page Load
function loadSearchResults() {
    const lastSearch = JSON.parse(localStorage.getItem("lastSearch"));
    const lastQuery = localStorage.getItem("lastQuery");

    if (lastSearch && lastQuery) {
        document.getElementById("domainInput").value = lastQuery;
        displaySearchResults(lastSearch);
    }
}
