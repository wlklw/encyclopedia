// DOM 元素
const loading = document.getElementById('loading');
const speciesNotFound = document.getElementById('speciesNotFound');
const speciesContent = document.getElementById('speciesContent');

// 物種資訊元素
const speciesImage = document.getElementById('speciesImage');
const chineseName = document.getElementById('chineseName');
const scientificName = document.getElementById('scientificName');
const family = document.getElementById('family');
const genus = document.getElementById('genus');
const discoveryLocation = document.getElementById('discoveryLocation');
const discoveryDate = document.getElementById('discoveryDate');
const notes = document.getElementById('notes');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSpeciesDetail();
});

// 載入物種詳情
async function loadSpeciesDetail() {
    try {
        // 取得 URL 參數中的物種 ID
        const urlParams = new URLSearchParams(window.location.search);
        const speciesId = urlParams.get('id');
        
        if (!speciesId) {
            showSpeciesNotFound();
            return;
        }
        
        // 載入物種資料
        const response = await fetch('data/species.json');
        const data = await response.json();
        
        // 尋找對應的物種
        const species = data.species.find(s => s.id === speciesId);
        
        if (!species) {
            showSpeciesNotFound();
            return;
        }
        
        // 顯示物種詳情
        displaySpeciesDetail(species);
        
    } catch (error) {
        console.error('載入物種詳情失敗:', error);
        showError('載入物種資料時發生錯誤，請稍後再試。');
    }
}

// 顯示物種詳情
function displaySpeciesDetail(species) {
    // 隱藏載入中畫面
    loading.style.display = 'none';
    
    // 顯示物種內容
    speciesContent.style.display = 'block';
    
    // 更新頁面標題
    document.title = `${species.chineseName} - 物種圖鑑管理系統`;
    
    // 填入物種資訊
    speciesImage.src = species.image;
    speciesImage.alt = species.chineseName;
    speciesImage.onerror = function() {
        this.src = 'https://via.placeholder.com/400x300?text=圖片載入失敗';
    };
    
    chineseName.textContent = species.chineseName;
    scientificName.textContent = species.scientificName;
    family.textContent = species.family;
    genus.textContent = species.genus;
    discoveryLocation.textContent = species.discoveryLocation;
    discoveryDate.textContent = formatDate(species.discoveryDate);
    notes.textContent = species.notes || '無備註';
}

// 顯示物種未找到畫面
function showSpeciesNotFound() {
    loading.style.display = 'none';
    speciesNotFound.style.display = 'block';
    document.title = '找不到物種 - 物種圖鑑管理系統';
}

// 顯示錯誤訊息
function showError(message) {
    loading.style.display = 'none';
    speciesContent.style.display = 'block';
    speciesContent.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #e74c3c;">
            <h2>載入錯誤</h2>
            <p>${message}</p>
            <a href="index.html" class="button" style="margin-top: 1rem;">回到首頁</a>
        </div>
    `;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

// 處理圖片載入錯誤
function handleImageError(img) {
    img.src = 'https://via.placeholder.com/400x300?text=圖片載入失敗';
    img.alt = '圖片載入失敗';
}