/**
 * 全球生育率數據模型
 * 
 * 實現了單一職責原則(SRP)：數據與邏輯分離，每個對象只負責其特定領域的功能
 * 採用了工廠模式(Factory Pattern)來創建國家對象，便於擴展與維護
 */

// 國家工廠函數 - 創建標準化的國家數據對象
const createCountry = (name, code, fertilityRate, population, continent, flagUrl, description) => {
    return {
        name,              // 國家名稱
        code,              // 國家代碼
        fertilityRate,     // 生育率 (每位女性平均生育子女數)
        population,        // 人口數量 (百萬)
        continent,         // 所屬洲份
        flagUrl,           // 國旗圖片URL
        description,       // 國家簡介
        
        // 根據人口和生育率計算出生機率
        getBirthProbability: function(totalBirths) {
            return (this.population * this.fertilityRate) / totalBirths;
        }
    };
};

/**
 * 全球國家數據
 * 數據來源：聯合國經濟和社會事務部人口司2025年預測
 * 
 * 遵循開放封閉原則(OCP)：可以擴展新國家而不修改現有代碼
 */
const countriesData = [
    // 亞洲國家
    createCountry("中國", "CN", 1.7, 1411, "亞洲", 
        "https://flagcdn.com/w320/cn.png", 
        "全球人口最多的國家，經濟快速發展，生育率受一胎化政策影響後逐漸調整。"),
    
    createCountry("印度", "IN", 2.1, 1390, "亞洲", 
        "https://flagcdn.com/w320/in.png", 
        "人口即將超越中國成為世界第一，仍保持高於更替水平的生育率。"),
    
    createCountry("日本", "JP", 1.3, 125.8, "亞洲", 
        "https://flagcdn.com/w320/jp.png", 
        "面臨嚴重的少子高齡化問題，生育率處於全球較低水平。"),
    
    createCountry("台灣", "TW", 1.07, 23.6, "亞洲", 
        "https://flagcdn.com/w320/tw.png", 
        "面臨極低生育率挑戰，為世界上生育率最低的地區之一。"),
        
    createCountry("南韓", "KR", 0.84, 51.74, "亞洲", 
        "https://flagcdn.com/w320/kr.png", 
        "生育率為世界最低水平，面臨嚴重的人口結構問題。"),
    
    createCountry("新加坡", "SG", 1.14, 5.9, "亞洲", 
        "https://flagcdn.com/w320/sg.png", 
        "城市國家，高度發達經濟體，生育率長期低於更替水平。"),
        
    createCountry("菲律賓", "PH", 2.53, 111.0, "亞洲", 
        "https://flagcdn.com/w320/ph.png", 
        "年輕人口比例高，生育率高於亞洲平均水平。"),
        
    createCountry("越南", "VN", 2.0, 97.3, "亞洲", 
        "https://flagcdn.com/w320/vn.png", 
        "經濟快速發展，生育率正在下降但仍接近更替水平。"),
    
    createCountry("泰國", "TH", 1.5, 69.8, "亞洲", 
        "https://flagcdn.com/w320/th.png", 
        "生育率低於更替水平，逐漸面臨人口老化問題。"),
        
    // 歐洲國家
    createCountry("法國", "FR", 1.84, 65.4, "歐洲", 
        "https://flagcdn.com/w320/fr.png", 
        "擁有歐洲較高的生育率，得益於家庭友善政策。"),
        
    createCountry("德國", "DE", 1.53, 83.2, "歐洲", 
        "https://flagcdn.com/w320/de.png", 
        "歐洲最大經濟體，生育率低於更替水平，依賴移民補充人口。"),
        
    createCountry("英國", "GB", 1.63, 67.2, "歐洲", 
        "https://flagcdn.com/w320/gb.png", 
        "生育率低於更替水平，人口增長部分來自移民。"),
        
    createCountry("義大利", "IT", 1.27, 60.5, "歐洲", 
        "https://flagcdn.com/w320/it.png", 
        "面臨嚴重的人口負增長，生育率為歐洲最低之一。"),
        
    createCountry("西班牙", "ES", 1.24, 47.4, "歐洲", 
        "https://flagcdn.com/w320/es.png", 
        "生育率極低，面臨嚴重的人口老化問題。"),
        
    createCountry("瑞典", "SE", 1.67, 10.4, "歐洲", 
        "https://flagcdn.com/w320/se.png", 
        "北歐國家中生育率較高，歸功於完善的福利體系。"),
    
    // 北美洲國家
    createCountry("美國", "US", 1.66, 331.0, "北美洲", 
        "https://flagcdn.com/w320/us.png", 
        "發達國家中生育率相對較高，但仍低於更替水平。"),
        
    createCountry("加拿大", "CA", 1.47, 38.0, "北美洲", 
        "https://flagcdn.com/w320/ca.png", 
        "生育率低於更替水平，人口增長主要依靠移民。"),
        
    createCountry("墨西哥", "MX", 2.1, 129.0, "北美洲", 
        "https://flagcdn.com/w320/mx.png", 
        "生育率處於更替水平，人口結構年輕。"),
    
    // 南美洲國家
    createCountry("巴西", "BR", 1.7, 213.0, "南美洲", 
        "https://flagcdn.com/w320/br.png", 
        "南美最大國家，生育率接近更替水平，正在下降。"),
        
    createCountry("阿根廷", "AR", 2.2, 45.4, "南美洲", 
        "https://flagcdn.com/w320/ar.png", 
        "南美洲生育率較高的國家，接近更替水平以上。"),
    
    // 非洲國家
    createCountry("奈及利亞", "NG", 5.32, 206.0, "非洲", 
        "https://flagcdn.com/w320/ng.png", 
        "非洲人口最多的國家，生育率非常高，人口增長快速。"),
        
    createCountry("埃及", "EG", 3.27, 102.0, "非洲", 
        "https://flagcdn.com/w320/eg.png", 
        "非洲北部最大國家，生育率高於全球平均。"),
        
    createCountry("南非", "ZA", 2.3, 59.3, "非洲", 
        "https://flagcdn.com/w320/za.png", 
        "非洲最發達經濟體之一，生育率高於更替水平。"),
        
    createCountry("尼日", "NE", 6.82, 24.2, "非洲", 
        "https://flagcdn.com/w320/ne.png", 
        "全球生育率最高的國家之一，平均每位女性生育近7個孩子。"),
    
    // 大洋洲國家
    createCountry("澳洲", "AU", 1.58, 25.7, "大洋洲", 
        "https://flagcdn.com/w320/au.png", 
        "大洋洲最大國家，生育率低於更替水平，依靠移民增長人口。"),
        
    createCountry("紐西蘭", "NZ", 1.61, 5.1, "大洋洲", 
        "https://flagcdn.com/w320/nz.png", 
        "生育率低於更替水平，但高於許多發達國家。")
];

/**
 * 洲際數據模型
 * 
 * 採用了組合模式(Composite Pattern)來組織大洲與國家的關係
 * 便於統計各大洲的總體資料
 */
const continentData = {
    "亞洲": { color: "#FF5733", averageFertility: 2.1, totalPopulation: 4600 },
    "歐洲": { color: "#3498DB", averageFertility: 1.5, totalPopulation: 747 },
    "非洲": { color: "#F1C40F", averageFertility: 4.2, totalPopulation: 1370 },
    "北美洲": { color: "#2ECC71", averageFertility: 1.75, totalPopulation: 592 },
    "南美洲": { color: "#9B59B6", averageFertility: 1.9, totalPopulation: 430 },
    "大洋洲": { color: "#1ABC9C", averageFertility: 1.7, totalPopulation: 43 }
};

/**
 * 計算總出生數
 * 實現了里氏替換原則(LSP)：任何新增的國家對象都可以放入計算中，而不影響函數工作
 */
const calculateTotalBirths = () => {
    return countriesData.reduce((sum, country) => {
        return sum + (country.population * country.fertilityRate);
    }, 0);
};

/**
 * 計算一個隨機國家，基於各國的出生機率
 * 遵循依賴倒置原則(DIP)：依賴抽象(getBirthProbability)而非具體實現
 */
const getRandomCountryByBirthRate = () => {
    const totalBirths = calculateTotalBirths();
    let random = Math.random();
    let cumulativeProbability = 0;
    
    for (const country of countriesData) {
        cumulativeProbability += country.getBirthProbability(totalBirths);
        if (random <= cumulativeProbability) {
            return country;
        }
    }
    
    // 以防萬一，返回第一個國家
    return countriesData[0];
};

// 導出所有數據模型供其他模組使用
window.birthSimulation = {
    countries: countriesData,
    continents: continentData,
    getRandomCountry: getRandomCountryByBirthRate,
    calculateTotalBirths
};
