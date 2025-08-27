// DOM 元素
const addSpeciesForm = document.getElementById('addSpeciesForm');
const imageInput = document.getElementById('speciesImage');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const exportButton = document.getElementById('exportButton');
const successMessage = document.getElementById('successMessage');

// 全域變數
let originalSpeciesData = [];
let newSpeciesData = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadOriginalData();
    bindEvents();
    setDefaultDate();
});

// 載入原始資料
async function loadOriginalData() {
    try {
        const response = await fetch('data/species.json');
        const data = await response.json();
        originalSpeciesData = data.species;
    } catch (error) {
        console.error('載入原始資料失敗:', error);
        // 如果載入失敗，使用空陣列
        originalSpeciesData = [];
    }
}

// 設定預設日期為今天
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('discoveryDate').value = today;
}

// 綁定事件
function bindEvents() {
    // 表單提交事件
    addSpeciesForm.addEventListener('submit', handleFormSubmit);
    
    // 圖片選擇事件
    imageInput.addEventListener('change', handleImageSelect);
    
    // 匯出按鈕事件
    exportButton.addEventListener('click', exportUpdatedData);
    
    // 表單重置事件
    addSpeciesForm.addEventListener('reset', function() {
        hideImagePreview();
        hideSuccessMessage();
    });
}

// 處理表單提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    // 收集表單資料
    const formData = new FormData(addSpeciesForm);
    const speciesData = collectFormData(formData);
    
    // 驗證資料
    if (!validateSpeciesData(speciesData)) {
        return;
    }
    
    // 處理圖片
    handleImageUpload(speciesData, formData.get('speciesImage'));
    
    // 顯示成功訊息
    showSuccessMessage();
    
    // 顯示匯出按鈕
    exportButton.style.display = 'inline-block';
}

// 收集表單資料
function collectFormData(formData) {
    return {
        id: generateSpeciesId(),
        scientificName: formData.get('scientificName').trim(),
        chineseName: formData.get('chineseName').trim(),
        family: formData.get('family').trim(),
        genus: formData.get('genus').trim(),
        discoveryLocation: formData.get('discoveryLocation').trim(),
        discoveryDate: formData.get('discoveryDate'),
        notes: formData.get('notes').trim() || '',
        image: '' // 將在處理圖片時設定
    };
}

// 產生物種 ID
function generateSpeciesId() {
    const existingIds = originalSpeciesData.map(s => s.id);
    let counter = 1;
    let newId;
    
    do {
        newId = `sp${String(counter).padStart(3, '0')}`;
        counter++;
    } while (existingIds.includes(newId));
    
    return newId;
}

// 驗證物種資料
function validateSpeciesData(data) {
    const requiredFields = ['scientificName', 'chineseName', 'family', 'genus', 'discoveryLocation', 'discoveryDate'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            alert(`請填寫${getFieldDisplayName(field)}`);
            return false;
        }
    }
    
    // 檢查學名是否重複
    if (originalSpeciesData.some(s => s.scientificName.toLowerCase() === data.scientificName.toLowerCase())) {
        alert('此學名已存在，請檢查是否重複新增');
        return false;
    }
    
    // 檢查日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.discoveryDate)) {
        alert('請選擇正確的發現日期');
        return false;
    }
    
    return true;
}

// 取得欄位顯示名稱
function getFieldDisplayName(field) {
    const displayNames = {
        scientificName: '學名',
        chineseName: '中文名',
        family: '科',
        genus: '屬',
        discoveryLocation: '發現地點',
        discoveryDate: '發現日期'
    };
    return displayNames[field] || field;
}

// 處理圖片選擇
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        // 驗證檔案類型
        if (!file.type.startsWith('image/')) {
            alert('請選擇圖片檔案');
            e.target.value = '';
            return;
        }
        
        // 驗證檔案大小 (限制 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('圖片檔案大小不能超過 5MB');
            e.target.value = '';
            return;
        }
        
        // 顯示預覽
        showImagePreview(file);
    } else {
        hideImagePreview();
    }
}

// 顯示圖片預覽
function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// 隱藏圖片預覽
function hideImagePreview() {
    imagePreview.style.display = 'none';
    previewImg.src = '';
}

// 處理圖片上傳
function handleImageUpload(speciesData, imageFile) {
    if (imageFile && imageFile.size > 0) {
        // 產生圖片檔名
        const fileExtension = imageFile.name.split('.').pop().toLowerCase();
        const imageName = `${speciesData.id}.${fileExtension}`;
        speciesData.image = `images/${imageName}`;
        
        // 注意：由於這是前端應用，實際的圖片需要手動上傳到 images/ 目錄
        console.log(`請將選擇的圖片重新命名為 ${imageName} 並上傳到 images/ 目錄`);
    } else {
        // 使用預設圖片
        speciesData.image = 'images/default.jpg';
    }
    
    // 儲存新物種資料
    newSpeciesData = speciesData;
}

// 顯示成功訊息
function showSuccessMessage() {
    successMessage.style.display = 'block';
    successMessage.scrollIntoView({ behavior: 'smooth' });
}

// 隱藏成功訊息
function hideSuccessMessage() {
    successMessage.style.display = 'none';
    exportButton.style.display = 'none';
}

// 匯出更新後的資料
function exportUpdatedData() {
    if (!newSpeciesData) {
        alert('沒有新增的物種資料可以匯出');
        return;
    }
    
    // 建立更新後的資料結構
    const updatedData = {
        species: [...originalSpeciesData, newSpeciesData]
    };
    
    // 建立下載連結
    const dataStr = JSON.stringify(updatedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `species_updated_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // 顯示提示訊息
    alert(`資料已匯出為 ${exportFileDefaultName}\n\n請執行以下步驟：\n1. 將此檔案重新命名為 species.json\n2. 上傳到 data/ 目錄覆蓋原檔案\n3. 如有上傳圖片，請將圖片檔案上傳到 images/ 目錄`);
}

// 格式化檔案大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
