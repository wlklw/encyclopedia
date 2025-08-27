// 全域變數
let speciesData = [];
let filteredData = [];

// DOM 元素
const speciesGrid = document.getElementById('speciesGrid');
const searchBox = document.getElementById('searchBox');
const totalCount = document.getElementById('totalCount');
const noResults = document.getElementById('noResults');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSpeciesData();
    bindEvents();
});

// 載入物種資料
async function loadSpeciesData() {
    try {
        const response = await fetch('data/species.json');
        const data = await response.json();
        speciesData = data.species;
        filteredData = [...speciesData];
        renderSpeciesGrid();
        updateTotalCount();
    } catch (error) {
        console.error('載入物種資料失敗:', error);
        showError('無法載入物種資料，請檢查 data/species.json 檔案是否存在。');
    }
}

// 渲染物種網格
function renderSpeciesGrid() {
    if (filteredData.length === 0) {
        speciesGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    speciesGrid.style.display = 'grid';
    noResults.style.display = 'none';
    
    speciesGrid.innerHTML = filteredData.map(species => `
        <div class="species-card" onclick="goToSpeciesDetail('${species.id}')">
            <img src="${species.image}" alt="${species.chineseName}" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=圖片載入失敗'">
            <div class="species-card-content">
                <h3>${species.chineseName}</h3>
                <p class="scientific-name">${species.scientificName}</p>
                <div class="species-meta">
                    <span>${species.family}</span>
                    <span>${formatDate(species.discoveryDate)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 前往物種詳情頁
function goToSpeciesDetail(speciesId) {
    window.location.href = `species.html?id=${speciesId}`;
}

// 搜尋功能
function searchSpecies(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredData = [...speciesData];
    } else {
        filteredData = speciesData.filter(species => 
            species.scientificName.toLowerCase().includes(searchTerm) ||
            species.chineseName.toLowerCase().includes(searchTerm) ||
            species.family.toLowerCase().includes(searchTerm) ||
            species.genus.toLowerCase().includes(searchTerm)
        );
    }
    
    renderSpeciesGrid();
    updateTotalCount();
}

// 更新總數顯示
function updateTotalCount() {
    totalCount.textContent = filteredData.length;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
}

// 顯示錯誤訊息
function showError(message) {
    speciesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; color: #e74c3c;">
            <h3>載入錯誤</h3>
            <p>${message}</p>
        </div>
    `;
}

// 綁定事件
function bindEvents() {
    // 搜尋框即時搜尋
    searchBox.addEventListener('input', function(e) {
        searchSpecies(e.target.value);
    });
    
    // 搜尋框 Enter 鍵搜尋
    searchBox.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchSpecies(e.target.value);
        }
    });
    
    // 清空搜尋框時恢復全部結果
    searchBox.addEventListener('blur', function() {
        if (!this.value.trim()) {
            searchSpecies('');
        }
    });
}

// 防抖函數 (可選，用於優化搜尋性能)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 如果需要更好的搜尋性能，可以使用防抖版本
// const debouncedSearch = debounce(searchSpecies, 300);
// searchBox.addEventListener('input', function(e) {
//     debouncedSearch(e.target.value);
// });
