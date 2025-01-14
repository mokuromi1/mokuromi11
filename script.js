const API_KEY = 'YOUR_API_KEY'; // ここに取得したAPIキーを設定（**絶対に公開しない！**）
const searchForm = document.getElementById('search-form');
const resultsArea = document.getElementById('results-area');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    searchVideos(query);
});

async function searchVideos(query) {
    let videoId = extractVideoId(query);

    const apiUrl = videoId
        ? `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
        : `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${API_KEY}&type=video`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const videos = videoId ? (data.items || []) : (data.items || []); // data.items が存在しない場合への対応
        if (videos.length === 0) {
            resultsArea.innerHTML = '<p>No results found.</p>';
            return;
        }
        displayResults(videos);
    } catch (error) {
        console.error('Error fetching data:', error);
        resultsArea.innerHTML = `<p>Error fetching data: ${error.message}</p>`; // エラーメッセージを表示
    }
}

function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtu.be') {
            const v = urlObj.searchParams.get('v');
            if (v) return v;
            const pathnameParts = urlObj.pathname.split('/');
            if (urlObj.hostname === 'youtu.be' && pathnameParts.length > 1) {
                return pathnameParts[1];
            }
            if (urlObj.pathname.includes('/embed/')) {
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
        const thumbnail = video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url; // サムネイルが存在しない場合への対応

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
