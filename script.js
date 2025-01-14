const API_KEY = 'AIzaSyBhvzctVsyI1NL4dcLFMqStsxzwSQI0d9s'; // 送っていただいたAPIキーを設定 (!!! 開発・テスト用。本番環境では絶対にこの方法を使わない !!!)
const searchForm = document.getElementById('search-form');
const resultsArea = document.getElementById('results-area');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    searchVideos(query);
});

async function searchVideos(query) {
    let videoId = extractVideoId(query);
    let apiUrl;
    let apiMethod = videoId ? "videos" : "search"; // 検索方法を記録

    if (videoId) {
        apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;
    } else {
        apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${API_KEY}&type=video`;
    }

    console.log("Searching using:", apiMethod); // 検索方法をログ出力
    console.log("API Request URL:", apiUrl);

    try {
        const response = await fetch(apiUrl);
        console.log("API Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Response Error Text:", errorText);

            // エラーレスポンスをJSONとしてパースを試みる (もしJSON形式の場合、詳細なエラー情報が得られる可能性がある)
            try {
                const errorJson = JSON.parse(errorText);
                console.error("API Response Error JSON:", JSON.stringify(errorJson, null, 2));
            } catch (jsonError) {
                console.error("Error parsing JSON:", jsonError);
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response Data:", JSON.stringify(data, null, 2));

        const videos = data.items || [];
        if (videos.length === 0) {
            resultsArea.innerHTML = '<p>No results found.</p>';
            return;
        }
        displayResults(videos);
    } catch (error) {
        console.error("Error fetching data:", error);
        resultsArea.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
    }
}

function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtu.be') {
            if (urlObj.searchParams.has('v')) {
                return urlObj.searchParams.get('v');
            } else if (urlObj.hostname === 'youtu.be' && urlObj.pathname.length > 1) {
                return urlObj.pathname.substring(1);
            } else if (urlObj.pathname.includes('/embed/')) {
                return urlObj.pathname.split('/embed/')[1];
            }
        }
    } catch (error) {
        // URLでない場合はnullを返す
    }
    return null;
}

function displayResults(videos) {
    resultsArea.innerHTML = '';

    videos.forEach(video => {
        const videoId = video.id.videoId || video.id;
        const title = video.snippet.title;
        const thumbnail = video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url;

        const videoElement = document.createElement('div');
        videoElement.className = "video-container";
        videoElement.innerHTML = `
            <h3>${title}</h3>
            <img src="${thumbnail}" alt="${title}">
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;
        resultsArea.appendChild(videoElement);
    });
}
