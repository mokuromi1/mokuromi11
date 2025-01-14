const API_KEY = 'YOUR_API_KEY'; // 取得したAPIキーを設定（**絶対に公開しない**）
const searchForm = document.getElementById('search-form');
const resultsArea = document.getElementById('results-area');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = document.getElementById('search-query').value;
  searchVideos(query);
});

async function searchVideos(query) {
  // YouTube URLが入力された場合はvideoIdを抽出
    let videoId = null;
    try {
        const url = new URL(query);
        if (url.hostname === 'www.youtube.com' || url.hostname === 'youtu.be') {
            if (url.searchParams.has('v')) {
                videoId = url.searchParams.get('v');
            } else if (url.pathname.length > 1) {
                videoId = url.pathname.substring(1);
            }
        }
    } catch (error) {
        // URLでない場合は検索クエリとして扱う
    }

  const apiUrl = videoId ? `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}` : `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${API_KEY}&type=video`;


  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const videos = videoId ? (data.items ? data.items : []) : (data.items ? data.items : []);
    displayResults(videos);
  } catch (error) {
    console.error('Error fetching data:', error);
    resultsArea.innerHTML = '<p>Error fetching data.</p>';
  }
}

function displayResults(videos) {
  resultsArea.innerHTML = '';

  if (videos && videos.length > 0) {
    videos.forEach(video => {
      const videoId = video.id.videoId || video.id;
      const title = video.snippet.title;
      const thumbnail = video.snippet.thumbnails.medium.url;

      const videoElement = document.createElement('div');
      videoElement.className = "video-container"
      videoElement.innerHTML = `
        <h3>${title}</h3>
        <img src="${thumbnail}" alt="${title}">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
      resultsArea.appendChild(videoElement);
    });
  } else {
    resultsArea.innerHTML = '<p>No results found.</p>';
  }
}
