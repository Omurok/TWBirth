/**
 * 全球新生兒小瑪莉抽獎機
 * 
 * 本應用遵循SOLID原則和多種設計模式：
 * 1. 單一職責原則(SRP) - 每個模組只負責一個功能
 * 2. 開放封閉原則(OCP) - 擴展功能無需修改現有代碼
 * 3. 依賴反轉原則(DIP) - 高階模組不依賴低階模組的實現細節
 * 4. 介面隔離原則(ISP) - 不同的介面職責分離
 * 5. 里氏替換原則(LSP) - 子類別可以替換父類別使用
 */

document.addEventListener('DOMContentLoaded', function() {
    // 添加調試信息 - 遵循防禦式程式設計原則
    console.log("DOM 完全載入，開始初始化應用...");
    
    /**
     * 模擬引擎 - 負責提供國家數據和概率計算
     * 
     * 實現了適配器模式(Adapter Pattern)，將全局數據模型適配為內部統一接口
     * 採用了單例模式(Singleton Pattern)確保數據一致性
     */
    const SimulationEngine = (function() {
        // 私有變數
        let countriesData = [];
        let initialized = false;
        
        // 初始化引擎
        function initialize() {
            try {
                console.log("初始化模擬引擎...");
                
                // 檢查全局數據是否可用
                if (!window.birthSimulation || !window.birthSimulation.countries) {
                    throw new Error("無法獲取全局出生數據模型");
                }
                
                // 載入國家數據
                countriesData = window.birthSimulation.countries;
                console.log("已載入", countriesData.length, "個國家的數據");
                
                // 標記為已初始化
                initialized = true;
                console.log("模擬引擎初始化完成");
            } catch (e) {
                console.error("初始化模擬引擎時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                
                // 創建一個備用數據集，確保系統不會完全失效
                countriesData = createFallbackData();
                console.log("已使用備用數據集");
                initialized = true;
            }
        }
        
        // 創建備用數據集
        function createFallbackData() {
            console.log("創建備用國家數據集");
            
            // 返回一個最小的數據集確保系統能夠運行
            return [
                { code: "TW", name: "台灣", population: 23570000, fertilityRate: 1.15, continent: "亞洲" },
                { code: "US", name: "美國", population: 331900000, fertilityRate: 1.70, continent: "北美洲" },
                { code: "JP", name: "日本", population: 125700000, fertilityRate: 1.36, continent: "亞洲" },
                { code: "CN", name: "中國", population: 1412000000, fertilityRate: 1.70, continent: "亞洲" },
                { code: "IN", name: "印度", population: 1380000000, fertilityRate: 2.20, continent: "亞洲" },
                { code: "BR", name: "巴西", population: 213990000, fertilityRate: 1.75, continent: "南美洲" },
                { code: "DE", name: "德國", population: 83240000, fertilityRate: 1.54, continent: "歐洲" },
                { code: "GB", name: "英國", population: 67220000, fertilityRate: 1.65, continent: "歐洲" }
            ];
        }
        
        // 獲取隨機國家（基於人口和生育率權重）
        function getRandomCountry() {
            // 檢查是否已初始化
            if (!initialized) {
                console.warn("模擬引擎未初始化，正在嘗試初始化...");
                initialize();
            }
            
            // 確保有數據可用
            if (!countriesData || countriesData.length === 0) {
                throw new Error("無可用國家數據");
            }
            
            // 基於權重選擇國家（權重 = 人口 × 生育率）
            let totalWeight = 0;
            const weightedCountries = countriesData.map(country => {
                // 計算權重 = 人口 × 生育率
                const weight = country.population * (country.fertilityRate || 1);
                totalWeight += weight;
                return {
                    country: country,
                    weight: weight
                };
            });
            
            // 隨機數設定在加權總和範圍內
            const randomValue = Math.random() * totalWeight;
            
            // 找出被選中的國家
            let weightSum = 0;
            for (const item of weightedCountries) {
                weightSum += item.weight;
                if (randomValue <= weightSum) {
                    return item.country;
                }
            }
            
            // 以防萬一，返回最後一個國家
            return weightedCountries[weightedCountries.length - 1].country;
        }
        
        // 根據國家代碼獲取特定國家
        function getSpecificCountry(countryCode) {
            // 檢查是否已初始化
            if (!initialized) {
                console.warn("模擬引擎未初始化，正在嘗試初始化...");
                initialize();
            }
            
            // 確保有數據可用
            if (!countriesData || countriesData.length === 0) {
                throw new Error("無可用國家數據");
            }
            
            // 查找指定代碼的國家
            return countriesData.find(country => country.code === countryCode);
        }
        
        // 返回公共API
        return {
            initialize: initialize,
            getRandomCountry: getRandomCountry,
            getSpecificCountry: getSpecificCountry,
            createFallbackData: createFallbackData // 暴露此方法使其他模組可以創建備用數據
        };
    })();
    
    /**
     * 結果顯示控制器
     * 
     * 負責顯示抽獎結果，封裝DOM操作細節
     * 採用橋接模式(Bridge Pattern)分離抽象和實現
     * 使用裝飾者模式(Decorator Pattern)增強顯示效果
     */
    const ResultDisplay = (function() {
        // 私有元素引用
        let resultContainer;
        let countryFlag;
        let countryName;
        let countryInfo;
        
        // 初始化
        function initialize() {
            try {
                console.log("初始化結果顯示模組...");
                resultContainer = document.getElementById('resultDisplay');
                
                if (!resultContainer) {
                    throw new Error("找不到結果顯示容器(#resultDisplay)");
                }
                
                countryFlag = document.getElementById('countryFlag');
                countryName = document.getElementById('countryName');
                countryInfo = document.getElementById('countryInfo');
                
                if (!countryFlag || !countryName || !countryInfo) {
                    throw new Error("找不到結果顯示的子元素");
                }
                
                console.log("結果顯示模組初始化完成");
            } catch (e) {
                console.error("初始化結果顯示模組時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                
                // 即使出錯，也嘗試使用備用方案
                try {
                    console.log("嘗試使用備用方案初始化");
                    initFallback();
                    console.log("備用初始化完成");
                } catch (fallbackError) {
                    console.error("備用初始化也失敗:", fallbackError.message);
                }
            }
        }
        
        // 顯示抽獎結果
        function showResult(country) {
            try {
                if (!country) {
                    throw new Error("無效的國家數據");
                }
                
                // 設置國旗
                countryFlag.textContent = getFlagEmoji(country.code);
                
                // 設置國家名稱
                countryName.textContent = country.name;
                
                // 設置國家信息
                let infoHTML = `
                    <div>人口：${formatNumber(country.population)}</div>
                    <div>生育率：${country.fertilityRate}</div>
                    <div>洲別：${country.continent || '未知'}</div>
                    ${country.description ? `<div class="country-description">簡介：${country.description}</div>` : ''}
                `;
                
                // 檢查是否有加速抽中台灣的數據
                if (country.speedToTaiwan && country.code === 'TW') {
                    infoHTML += `
                        <div class="speed-to-taiwan-result">
                            ${country.speedToTaiwan.summary}
                        </div>
                    `;
                }
                
                countryInfo.innerHTML = infoHTML;
                
                // 顯示結果容器
                resultContainer.classList.remove('hidden');
                
                // 根據是否為台灣添加特殊效果
                if (country.code === 'TW') {
                    resultContainer.classList.add('taiwan-result');
                    playTaiwanEffect();
                } else {
                    resultContainer.classList.remove('taiwan-result');
                }
                
                console.log("已顯示抽獎結果:", country.name);
            } catch (e) {
                console.error("顯示結果時發生錯誤:", e.message);
                alert("無法顯示結果，請重試");
            }
        }
        
        // 獲取國旗表情符號
        function getFlagEmoji(countryCode) {
            try {
                // 將國家代碼轉換為區域指示符號
                // 區域指示符號是A-Z的Unicode字母+127462的偏移量
                if (!countryCode || countryCode.length !== 2) {
                    return '🏳️'; // 默認白旗
                }
                
                const codePoints = countryCode
                    .toUpperCase()
                    .split('')
                    .map(char => 127397 + char.charCodeAt());
                    
                return String.fromCodePoint(...codePoints);
            } catch (e) {
                console.error("獲取國旗表情符號時發生錯誤:", e.message);
                return '🏳️'; // 出錯時返回白旗
            }
        }
        
        // 數字格式化輔助函數
        function formatNumber(num) {
            if (num >= 1000000000) {
                return (num / 1000000000).toFixed(2) + ' 億';
            } else if (num >= 1000000) {
                return (num / 1000000).toFixed(2) + ' 百萬';
            } else if (num >= 1000) {
                return (num / 1000).toFixed(2) + ' 千';
            }
            return num.toString();
        }
        
        // 播放台灣特殊效果
        function playTaiwanEffect() {
            // 簡單的動畫效果（可以擴展為更複雜的效果）
            const container = document.querySelector('.result-container');
            
            // 添加閃爍類
            container.classList.add('taiwan-winner');
            
            // 播放音效 (如果聲音文件存在)
            const audio = new Audio('taiwan-win.mp3');
            audio.volume = 0.5;
            
            // 嘗試播放，但忽略錯誤（聲音文件可能不存在）
            try {
                audio.play().catch(() => {}); // 忽略未經用戶交互無法播放的錯誤
            } catch (e) {
                // 忽略音頻相關錯誤
            }
            
            // 5秒後移除特效類
            setTimeout(() => {
                container.classList.remove('taiwan-winner');
            }, 5000);
        }
        
        // 返回公共API - 統一方法名稱
        return {
            initialize: initialize,
            show: showResult  // 使用show作為別名，與其他模組調用保持一致
        };
    })();
    
    /**
     * 小瑪莉抽獎機控制器
     * 
     * 採用狀態模式(State Pattern)管理不同狀態的行為差異
     * 實現命令模式(Command Pattern)封裝抽獎操作
     * 使用發布/訂閱模式(Observer Pattern)通知抽獎結果
     */
    const FruitMachine = (function() {
        // 私有狀態
        let isPlaying = false;
        let activeCell = null;
        let animationTimer = null;
        let highlightInterval = 50; // 調整為更快的初始亮燈間隔(毫秒)
        let resultCallback = null;
        let allCells = [];
        let targetCell = null; // 新增：保存目標單元格
        let initialized = false; // 新增初始化狀態標記
        
        // 停止位置策略 - 策略模式(Strategy Pattern)
        const stoppingStrategies = {
            // 標準隨機策略
            random: function() {
                // 根據機率分布獲取隨機國家
                const country = SimulationEngine.getRandomCountry();
                
                console.log("隨機選中國家:", country ? country.name : "無法獲取國家");
                
                // 嘗試找到對應的格子
                const cellIndex = findCellIndexByCountry(country.code);
                console.log("對應格子索引:", cellIndex);
                
                // 如果找不到對應格子，選一個隨機的邊緣格子
                if (cellIndex === -1) {
                    console.warn("找不到匹配的格子，使用第一個格子");
                    cellIndex = 0;
                }
                
                console.log("目標格子索引:", cellIndex);
                
                // 返回目標格子索引和國家
                return {
                    index: cellIndex,
                    country: country
                };
            },
            
            // 台灣特定策略
            taiwan: function() {
                // 先檢查是否有台灣格子
                const taiwanIndex = findCellIndexByCountry('TW');
                console.log("台灣格子索引:", taiwanIndex);
                
                // 獲取台灣國家資料
                const taiwan = window.birthSimulation.countries.find(c => c.code === 'TW');
                console.log("找到台灣資料:", !!taiwan);
                
                // 如果找到台灣格子，返回該索引
                if (taiwanIndex !== -1) {
                    return {
                        index: taiwanIndex,
                        country: taiwan
                    };
                }
                
                // 如果沒有台灣格子，返回中央獎區
                return {
                    index: -1, // 特殊值表示中央區
                    country: taiwan
                };
            }
        };
        
        // 尋找特定國家代碼的格子索引
        function findCellIndexByCountry(countryCode) {
            for (let i = 0; i < allCells.length; i++) {
                if (allCells[i].dataset.country === countryCode) {
                    return i;
                }
            }
            return -1;
        }
        
        // 初始化抽獎機
        function initialize() {
            try {
                console.log("開始初始化抽獎機...");
                
                // 獲取所有格子
                allCells = Array.from(document.querySelectorAll('.grid-cell'));
                
                if (!allCells || allCells.length === 0) {
                    throw new Error("無法找到抽獎格子(.grid-cell)");
                }
                
                console.log("抽獎機初始化完成，共", allCells.length, "個格子");
                
                // 確保 SimulationEngine 已初始化
                if (!window.birthSimulation || !window.birthSimulation.countries) {
                    console.warn("國家數據尚未準備好，等待 SimulationEngine 初始化完成");
                    
                    // 延遲初始化格子內容，等待數據就緒
                    setTimeout(function() {
                        if (window.birthSimulation && window.birthSimulation.countries) {
                            console.log("數據已就緒，初始化格子內容");
                            initGridCells();
                            initialized = true; // 標記初始化完成
                        } else {
                            console.error("等待數據超時，使用備用方案初始化格子");
                            initGridCellsFallback(); // 使用備用函數
                            initialized = true; // 標記初始化完成，即使是使用備用方案
                        }
                    }, 500); // 給予0.5秒等待數據載入
                } else {
                    // 數據已準備好，直接初始化
                    initGridCells();
                    initialized = true; // 標記初始化完成
                }
            } catch (e) {
                console.error("初始化抽獎機時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                
                // 即使出錯，也嘗試使用備用方案
                try {
                    console.log("嘗試使用備用方案初始化");
                    initGridCellsFallback();
                    initialized = true; // 標記初始化完成
                } catch (fallbackError) {
                    console.error("備用初始化也失敗:", fallbackError.message);
                }
            }
        }
        
        // 備用初始化格子內容函數
        function initGridCellsFallback() {
            console.log("使用備用方案初始化格子...");
            
            // 基本國家數據
            const fallbackCountries = [
                { name: "中國", code: "CN", fertilityRate: 1.7, continent: "亞洲" },
                { name: "台灣", code: "TW", fertilityRate: 1.07, continent: "亞洲" },
                { name: "美國", code: "US", fertilityRate: 1.66, continent: "北美洲" },
                { name: "日本", code: "JP", fertilityRate: 1.3, continent: "亞洲" },
                { name: "印度", code: "IN", fertilityRate: 2.1, continent: "亞洲" }
            ];
            
            // 分配到格子
            allCells.forEach((cell, index) => {
                const countryIndex = index % fallbackCountries.length;
                const country = fallbackCountries[countryIndex];
                
                cell.setAttribute('data-country', country.code);
                cell.innerHTML = `
                    <div class="country-name">${country.name}</div>
                    <div class="fertility-rate">${country.fertilityRate}</div>
                `;
            });
            
            console.log("備用初始化完成");
        }
        
        // 初始化格子內容
        function initGridCells() {
            try {
                console.log("初始化格子內容...");
                
                // 確保有數據可用
                if (!window.birthSimulation || !window.birthSimulation.countries) {
                    throw new Error("國家數據不可用");
                }
                
                // 獲取國家數據
                const countries = window.birthSimulation.countries;
                
                // 每個格子分配一個國家
                allCells.forEach((cell, index) => {
                    // 簡單的循環分配
                    const countryIndex = index % countries.length;
                    const country = countries[countryIndex];
                    
                    // 設置數據屬性
                    cell.dataset.country = country.code;
                    cell.dataset.fertility = country.fertilityRate;
                    
                    // 設置內容
                    cell.innerHTML = `
                        <div class="country-flag">${getFlagEmoji(country.code)}</div>
                        <div class="country-name">${country.name}</div>
                    `;
                });
                
                console.log("格子內容初始化完成");
            } catch (e) {
                console.error("初始化格子內容時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
            }
        }
        
        // 獲取國旗表情符號
        function getFlagEmoji(countryCode) {
            try {
                // 特殊處理台灣國旗
                if (countryCode === 'TW') {
                    return '🇹🇼';
                }
                
                // 其他國家通用處理
                const codePoints = countryCode
                    .toUpperCase()
                    .split('')
                    .map(char => 127397 + char.charCodeAt(0));
                    
                return String.fromCodePoint(...codePoints);
            } catch (e) {
                console.error("生成國旗時發生錯誤:", e.message);
                return '🏳️'; // 返回白旗作為備用
            }
        }
        
        // 重置所有格子狀態
        function resetCells() {
            // 先記錄當前操作，便於調試
            console.log("重置所有格子狀態");
            
            try {
                // 檢查格子數組是否存在
                if (!allCells || allCells.length === 0) {
                    console.error("無法重置格子：格子數組為空或未初始化");
                    allCells = Array.from(document.querySelectorAll('.grid-cell'));
                    
                    if (allCells.length === 0) {
                        throw new Error("重新獲取格子失敗，DOM元素可能不存在");
                    } else {
                        console.log("已重新獲取格子數組，共", allCells.length, "個格子");
                    }
                }
                
                // 移除所有格子的活動狀態
                allCells.forEach(cell => {
                    cell.classList.remove('active');
                });
                
                // 重置其他狀態
                isPlaying = false;
                activeCell = null;
                highlightInterval = 50; // 重置為初始速度
                
                console.log("格子狀態重置完成");
            } catch (e) {
                console.error("重置格子狀態時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
            }
        }
        
        // 結束動畫並顯示結果
        function finishAnimation(cellIndex, isCenterJackpot) {
            console.log("結束動畫並顯示結果:", cellIndex, "是否為中央獎區:", isCenterJackpot);
            
            try {
                // 記錄結果國家資訊
                let resultCountry = null;
                
                // 中央獎區特殊處理(台灣)
                if (isCenterJackpot) {
                    console.log("中央獎區(台灣)被選中");
                    // 獲取台灣國家資訊
                    resultCountry = SimulationEngine.getSpecificCountry('TW');
                    
                    if (!resultCountry) {
                        console.error("無法獲取台灣數據，使用備用方案");
                        resultCountry = {
                            name: "台灣",
                            code: "TW",
                            fertilityRate: 1.07,
                            population: 23.6,
                            continent: "亞洲"
                        };
                    }
                } else {
                    // 邊緣格子
                    if (cellIndex === undefined || cellIndex === null || cellIndex < 0) {
                        console.error("無效的格子索引:", cellIndex);
                        // 使用隨機國家作為備用方案
                        resultCountry = SimulationEngine.getRandomCountry();
                        console.log("使用備用國家:", resultCountry ? resultCountry.name : "未知");
                    } else {
                        console.log("獎項格子索引:", cellIndex);
                        const countryCode = allCells[cellIndex].dataset.country;
                        console.log("國家代碼:", countryCode);
                        
                        resultCountry = SimulationEngine.getSpecificCountry(countryCode);
                        console.log("獲取國家數據:", resultCountry ? "成功" : "失敗");
                    }
                }
                
                // 如果沒有找到國家資訊，使用備用方案
                if (!resultCountry) {
                    console.error("無法獲取結果國家資訊");
                    resultCountry = {
                        name: "未知國家",
                        code: "XX",
                        fertilityRate: 0,
                        continent: "未知"
                    };
                }
                
                // 延遲一段時間後顯示結果（模擬滾動停止的效果）
                setTimeout(function() {
                    // 重置抽獎機狀態
                    isPlaying = false;
                    
                    // 顯示結果
                    console.log("顯示抽獎結果:", resultCountry.name);
                    ResultDisplay.show(resultCountry);
                    
                    // 添加到歷史記錄
                    HistoryManager.addRecord(resultCountry);
                    
                    // 清除動畫計時器
                    clearInterval(animationTimer);
                    animationTimer = null;
                }, 500);
            } catch (e) {
                console.error("完成動畫顯示結果時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                
                // 確保即使出錯也重置抽獎機狀態
                isPlaying = false;
                clearInterval(animationTimer);
                animationTimer = null;
            }
        }
        
        // 開始抽獎
        function start(isTaiwanSpecial) {
            try {
                console.log("開始抽獎:", isTaiwanSpecial ? "台灣特別獎" : "普通抽獎");
                
                // 檢查初始化狀態
                if (!initialized) {
                    console.error("抽獎機尚未完成初始化，無法啟動");
                    alert("系統正在準備中，請稍後再試！");
                    return;
                }
                
                // 檢查是否已在進行中
                if (isPlaying) {
                    console.log("抽獎已在進行中，忽略請求");
                    return;
                }
                
                // 標記為正在遊戲中
                isPlaying = true;
                
                // 重置所有格子
                resetCells();
                
                // 決定目標國家
                let targetCountry = null;
                
                if (isTaiwanSpecial) {
                    console.log("特殊模式：台灣");
                    targetCountry = SimulationEngine.getSpecificCountry('TW');
                    
                    if (!targetCountry) {
                        console.error("無法獲取台灣數據，使用備用方案");
                        targetCountry = {
                            name: "台灣",
                            code: "TW",
                            fertilityRate: 1.07,
                            population: 23.6,
                            continent: "亞洲"
                        };
                    }
                } else {
                    console.log("一般抽獎模式");
                    targetCountry = SimulationEngine.getRandomCountry();
                    console.log("隨機選中國家:", targetCountry.name);
                }
                
                // 保存目標信息
                targetCell = {
                    country: targetCountry,
                    isCenterJackpot: isTaiwanSpecial
                };
                
                // 尋找對應的格子索引(非台灣特別獎時)
                let targetIndex = -1;
                
                if (!isTaiwanSpecial) {
                    // 尋找第一個匹配的格子
                    targetIndex = allCells.findIndex(cell => 
                        cell.dataset.country === targetCountry.code
                    );
                    
                    // 如果沒有找到對應格子，選一個隨機的邊緣格子
                    if (targetIndex === -1) {
                        console.warn("找不到匹配的格子，使用第一個格子");
                        targetIndex = 0;
                    }
                    
                    console.log("目標格子索引:", targetIndex);
                }
                
                // 啟動動畫
                startAnimation(targetIndex, isTaiwanSpecial);
            } catch (e) {
                console.error("啟動抽獎時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                
                // 重置狀態
                isPlaying = false;
                
                // 顯示錯誤提示
                alert("抽獎啟動失敗，請重試");
            }
        }
        
        // 開始動畫，接收目標索引和是否為台灣特別獎的參數
        function startAnimation(targetIndex, isTaiwanSpecial) {
            try {
                // 如果已經在播放，不做任何事 (符合單一職責原則)
                if (isPlaying) {
                    console.log("抽獎機已經在運行中，忽略重複啟動請求");
                    return;
                }
                
                console.log("開始抽獎動畫，目標索引:", targetIndex, "台灣特別獎:", isTaiwanSpecial);
                isPlaying = true;
                
                // 清除任何現有計時器 (符合開放封閉原則，擴展動畫行為而不修改核心邏輯)
                if (animationTimer) {
                    console.log("清除現有計時器");
                    clearInterval(animationTimer);
                }
                
                // 重置所有格子的狀態
                resetCells();
                
                // 檢查目標對象是否存在
                if (!targetCell || !targetCell.country) {
                    console.error("目標格子資訊缺失，無法啟動動畫");
                    isPlaying = false;
                    return;
                }
                
                console.log('目標停止位置:', targetIndex, '國家:', targetCell.country.name || '未知');
                
                // 特殊情況：中央獎區(台灣)
                const isCenterJackpot = isTaiwanSpecial;
                
                // 動畫參數
                let currentCellIndex = 0;
                let cycleCount = 0;
                
                // 減少轉動圈數 (確保5秒內完成)
                let maxCycles = isCenterJackpot ? 3 : 2;
                
                const totalCells = allCells.length;
                console.log("總格子數:", totalCells);
                
                // 防禦性編程：檢查總格子數
                if (totalCells === 0) {
                    console.error("沒有有效格子，無法啟動動畫！");
                    isPlaying = false;
                    return;
                }
                
                // 用來標記是否處於減速階段 (狀態模式的簡化實現)
                let decreasing = false;
                
                // 設置最大執行時間為4.5秒 (確保5秒內完成)
                const startTime = Date.now();
                const MAX_DURATION = 4500; // 4.5秒
                
                console.log("啟動抽獎動畫循環...");
                
                // 初始化高亮間隔
                highlightInterval = 100; // 重置為初始值
                
                // 輔助函數：檢查兩個索引是否接近 (符合單一職責原則)
                function isNearTarget(current, target, totalLength) {
                    // 處理特殊情況
                    if (target === -1 || target >= totalLength) {
                        return false;
                    }
                    
                    // 計算距離，考慮環形結構
                    const directDistance = Math.abs(current - target);
                    const wrapDistance = totalLength - directDistance;
                    const minDistance = Math.min(directDistance, wrapDistance);
                    
                    // 定義"接近"的閾值
                    return minDistance <= 5;
                }
                
                // 開始動畫循環 (使用命令模式封裝動畫邏輯)
                animationTimer = setInterval(function animationLoop() {
                    try {
                        // 檢查是否超過最大時間 (時間監控策略)
                        const elapsed = Date.now() - startTime;
                        if (elapsed > MAX_DURATION) {
                            // 立即跳到目標結束
                            console.log("達到最大時間，強制結束動畫");
                            clearInterval(animationTimer);
                            
                            // 先清除所有活動狀態
                            if (activeCell) {
                                activeCell.classList.remove('active');
                            }
                            
                            // 直接跳到目標位置
                            if (isCenterJackpot) {
                                finishAnimation(null, true);
                            } else if (targetIndex >= 0 && targetIndex < totalCells) {
                                // 確保選中目標格子
                                activeCell = allCells[targetIndex];
                                activeCell.classList.add('active');
                                finishAnimation(targetIndex, false);
                            } else {
                                // 處理無效的目標索引
                                console.error("無效的目標索引:", targetIndex);
                                finishAnimation(0, false); // 使用第一個格子作為備用
                            }
                            return;
                        }
                        
                        // 移除前一個活動格子的高亮 (符合單一職責原則)
                        if (activeCell) {
                            activeCell.classList.remove('active');
                        }
                        
                        // 選擇當前要高亮的格子 (使用迭代器模式遍歷格子)
                        currentCellIndex = (currentCellIndex + 1) % totalCells;
                        activeCell = allCells[currentCellIndex];
                        activeCell.classList.add('active');
                        
                        // 如果完成了一圈 (觀察者模式的簡化實現)
                        if (currentCellIndex === 0) {
                            cycleCount++;
                            console.log("完成第", cycleCount, "圈");
                            
                            // 如果達到最大圈數，開始減速
                            if (cycleCount >= maxCycles) {
                                decreasing = true;
                                console.log("達到最大圈數，開始減速");
                            }
                        }
                        
                        // 計算剩餘時間
                        const remaining = MAX_DURATION - (Date.now() - startTime);
                        
                        // 漸進減速 (更自然的停止感) (策略模式的一種實現)
                        if (decreasing) {
                            // 增加減速幅度，確保及時停止
                            highlightInterval += 20;
                            
                            // 如果減速到一定程度，且當前格子接近目標格子或時間所剩不多，準備停止
                            if ((highlightInterval > 200 && isNearTarget(currentCellIndex, targetIndex, totalCells)) || 
                                remaining < 1000) {
                                
                                // 如果目前位置不是目標位置，但時間不多了，強制結束並跳到目標位置
                                if (currentCellIndex !== targetIndex && !isCenterJackpot && remaining < 800) {
                                    console.log("時間不足，強制跳到目標位置");
                                    clearInterval(animationTimer);
                                    
                                    // 先清除當前活動格子
                                    if (activeCell) {
                                        activeCell.classList.remove('active');
                                    }
                                    
                                    // 直接激活目標格子
                                    if (targetIndex >= 0 && targetIndex < totalCells) {
                                        activeCell = allCells[targetIndex];
                                        activeCell.classList.add('active');
                                        
                                        // 結束動畫
                                        finishAnimation(targetIndex, false);
                                    } else {
                                        // 當目標索引無效時使用當前位置
                                        console.warn("目標索引無效，使用當前位置:", currentCellIndex);
                                        finishAnimation(currentCellIndex, false);
                                    }
                                    return;
                                }
                                
                                // 檢查是否到達目標位置
                                if (isCenterJackpot) {
                                    // 停在中央獎區(台灣)
                                    console.log("停在中央獎區(台灣)");
                                    clearInterval(animationTimer);
                                    finishAnimation(null, true);
                                } else if (currentCellIndex === targetIndex) {
                                    // 停在特定格子
                                    console.log("停在目標格子:", targetIndex);
                                    clearInterval(animationTimer);
                                    finishAnimation(currentCellIndex, false);
                                }
                            }
                            
                            // 更新計時器間隔 (動態調整動畫速度)
                            clearInterval(animationTimer);
                            animationTimer = setInterval(animationLoop, highlightInterval);
                        }
                    } catch (e) {
                        console.error("抽獎動畫循環中發生錯誤:", e);
                        clearInterval(animationTimer);
                        isPlaying = false;
                    }
                }, highlightInterval);
            } catch (e) {
                // 添加缺失的錯誤處理區塊
                console.error("啟動動畫時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                isPlaying = false;
            }
        }
        
        // 新增：加速抽中台灣功能
        function speedToTaiwan() {
            try {
                console.log("啟動加速抽中台灣功能");
                
                // 檢查初始化狀態
                if (!initialized) {
                    console.error("抽獎機尚未完成初始化，無法啟動");
                    alert("系統正在準備中，請稍後再試！");
                    return;
                }
                
                // 檢查是否已在進行中
                if (isPlaying) {
                    console.log("抽獎已在進行中，忽略請求");
                    return;
                }
                
                // 標記為正在遊戲中
                isPlaying = true;
                
                // 重置所有格子
                resetCells();
                
                // 準備記錄抽獎歷程
                const attempts = [];
                let attemptCount = 0;
                let foundTaiwan = false;
                
                // 啟動背景動畫
                startSpeedToTaiwanAnimation();
                
                // 創建抽獎函數
                const attemptDraw = function() {
                    // 抽取隨機國家
                    const country = SimulationEngine.getRandomCountry();
                    attemptCount++;
                    
                    // 記錄本次抽取的國家
                    attempts.push({
                        country: country,
                        attempt: attemptCount
                    });
                    
                    console.log(`第${attemptCount}次嘗試: ${country.name}`);
                    
                    // 檢查是否為台灣
                    if (country.code === 'TW') {
                        foundTaiwan = true;
                        // 先停止動畫
                        stopSpeedToTaiwanAnimation();
                        // 顯示結果
                        finishSpeedToTaiwan(attempts);
                    } else {
                        // 繼續嘗試，無嘗試次數上限
                        // 使用遞迴而非無限循環，避免阻塞UI線程
                        setTimeout(attemptDraw, 5); // 降低間隔提高效率
                    }
                };
                
                // 開始首次嘗試
                attemptDraw();
                
            } catch (e) {
                console.error("加速抽中台灣時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                
                // 重置狀態
                isPlaying = false;
                stopSpeedToTaiwanAnimation();
                
                // 顯示錯誤提示
                alert("加速抽中台灣失敗，請重試");
            }
        }
        
        // 新增：啟動加速抽中台灣的動畫效果
        let speedAnimationTimer = null;
        
        function startSpeedToTaiwanAnimation() {
            console.log("啟動加速抽中台灣動畫");
            
            // 停止現有動畫（如果有）
            if (speedAnimationTimer) {
                clearInterval(speedAnimationTimer);
            }
            
            // 初始化動畫參數
            let currentCellIndex = 0;
            
            // 確保有格子可用
            if (!allCells || allCells.length === 0) {
                console.error("無法啟動動畫：沒有可用格子");
                return;
            }
            
            // 啟動動畫循環 - 比正常動畫更快速
            speedAnimationTimer = setInterval(function() {
                try {
                    // 清除之前高亮的格子
                    if (activeCell) {
                        activeCell.classList.remove('active');
                    }
                    
                    // 指向下一個格子
                    currentCellIndex = (currentCellIndex + 1) % allCells.length;
                    
                    // 高亮當前格子
                    activeCell = allCells[currentCellIndex];
                    activeCell.classList.add('active');
                    
                } catch (e) {
                    console.error("加速抽中台灣動畫出錯:", e.message);
                }
            }, 50); // 更快的動畫速度
        }
        
        // 新增：停止加速抽中台灣動畫
        function stopSpeedToTaiwanAnimation() {
            if (speedAnimationTimer) {
                clearInterval(speedAnimationTimer);
                speedAnimationTimer = null;
            }
            
            // 清除格子高亮狀態
            if (activeCell) {
                activeCell.classList.remove('active');
                activeCell = null;
            }
        }
        
        // 完成加速抽中台灣功能並顯示結果
        function finishSpeedToTaiwan(attempts) {
            try {
                console.log("完成加速抽中台灣，共嘗試 " + attempts.length + " 次");
                
                // 統計抽獎歷程
                const countryCounts = {};
                const continentCounts = {};
                let totalAttempts = attempts.length - 1; // 不計算最後的台灣
                
                // 計算每個國家和洲的出現次數
                for (let i = 0; i < totalAttempts; i++) {
                    const country = attempts[i].country;
                    const countryName = country.name;
                    const continent = country.continent || '未知';
                    
                    // 統計國家
                    countryCounts[countryName] = (countryCounts[countryName] || 0) + 1;
                    
                    // 統計洲別
                    continentCounts[continent] = (continentCounts[continent] || 0) + 1;
                }
                
                // 將統計結果轉換為數組並排序
                const countryEntries = Object.entries(countryCounts)
                    .sort((a, b) => b[1] - a[1]); // 按出現次數降序排序
                
                const continentEntries = Object.entries(continentCounts)
                    .sort((a, b) => b[1] - a[1]); // 按出現次數降序排序
                
                // 獲取最後一次抽中的台灣
                const finalResult = attempts[attempts.length - 1].country;
                
                // 建立抽獎歷程摘要 - 使用建造者模式構建複雜UI
                let summary = `<div class="speed-summary">在抽中台灣前，嘗試了 ${totalAttempts} 次:</div>`;
                
                // 統計信息容器 - 使用組合模式組織複雜視圖結構
                summary += `<div class="stats-container">
                    <!-- 左側國家統計 -->
                    <div class="stats-column">
                        <h4 class="stats-title">國家統計</h4>
                        <div class="stats-list">`;
                
                // 添加國家統計數據 - 使用迭代器模式處理集合數據
                countryEntries.slice(0, 10).forEach(([country, count]) => {
                    const percentage = ((count / totalAttempts) * 100).toFixed(1);
                    summary += `<div class="stats-item">
                        <span class="stats-name">${country}</span>
                        <span class="stats-count">${count}次</span>
                        <span class="stats-percentage">${percentage}%</span>
                    </div>`;
                });
                
                summary += `</div></div>
                    
                    <!-- 右側洲別統計 -->
                    <div class="stats-column">
                        <h4 class="stats-title">洲別統計</h4>
                        <div class="stats-list">`;
                
                // 添加洲別統計數據
                continentEntries.forEach(([continent, count]) => {
                    const percentage = ((count / totalAttempts) * 100).toFixed(1);
                    summary += `<div class="stats-item">
                        <span class="stats-name">${continent}</span>
                        <span class="stats-count">${count}次</span>
                        <span class="stats-percentage">${percentage}%</span>
                    </div>`;
                });
                
                summary += `</div></div></div>`;
                
                // 抽獎歷程詳細展示 - 裝飾者模式增強視覺效果
                summary += '<div class="attempts-history">';
                summary += '<h4 class="attempts-title">詳細抽獎歷程</h4>';
                summary += '<div class="attempts-list">';
                
                // 如果抽獎次數過多，只顯示部分記錄
                let displayedAttempts = attempts;
                if (attempts.length > 50) {
                    const firstAttempts = attempts.slice(0, 20);
                    const lastAttempts = attempts.slice(-21, -1); // 不包括最後的台灣
                    displayedAttempts = [
                        ...firstAttempts, 
                        {isEllipsis: true, skipped: attempts.length - 41}, 
                        ...lastAttempts,
                        attempts[attempts.length - 1]
                    ];
                }
                
                displayedAttempts.forEach((attempt, index) => {
                    if (attempt.isEllipsis) {
                        summary += `<div class="attempt-ellipsis">...... 省略 ${attempt.skipped} 次抽獎 ......</div>`;
                    } else {
                        const country = attempt.country;
                        const attemptNumber = attempt.attempt;
                        const isLast = index === displayedAttempts.length - 1;
                        
                        summary += `<div class="attempt-item ${isLast ? 'attempt-taiwan' : ''}">
                            <span class="attempt-number">#${attemptNumber}</span>
                            <span class="attempt-flag">${getFlagEmoji(country.code)}</span>
                            <span class="attempt-name">${country.name}</span>
                            ${isLast ? '<span class="attempt-success">✓</span>' : ''}
                        </div>`;
                    }
                });
                
                summary += '</div></div>';
                
                // 將摘要添加到國家描述中
                finalResult.speedToTaiwan = {
                    attempts: attempts,
                    summary: summary,
                    statistics: {
                        totalAttempts: totalAttempts,
                        countryCounts: countryCounts,
                        continentCounts: continentCounts
                    }
                };
                
                // 顯示結果
                console.log("顯示台灣抽獎結果");
                ResultDisplay.show(finalResult);
                
                // 把所有嘗試過的國家添加到歷史記錄
                attempts.forEach(attempt => {
                    HistoryManager.addRecord(attempt.country, 'speed-to-taiwan'); // 添加參數標記為加速抽中台灣的嘗試
                });
                
                // 重置狀態
                setTimeout(function() {
                    isPlaying = false;
                }, 500);
            } catch (e) {
                console.error("完成加速抽中台灣時發生錯誤:", e.message);
                console.error("錯誤堆疊:", e.stack);
                
                // 重置狀態
                isPlaying = false;
            }
        }
        
        // 公共API
        return {
            initialize: initialize,
            start: start,
            speedToTaiwan: speedToTaiwan // 新增加速抽中台灣API
        };
    }());
    
    /**
     * 應用程序主控制器
     * 
     * 使用外觀模式(Facade Pattern)簡化子系統交互
     * 使用模組模式(Module Pattern)封裝內部實現
     */
    const App = (function() {
        // 應用程序初始化
        function initializeApplication() {
            try {
                console.log("開始初始化應用程序...");
                
                // 檢查必要模組是否已定義
                if (typeof SimulationEngine === 'undefined') {
                    throw new Error("SimulationEngine 模組未定義，請確保所有腳本已正確載入");
                }
                
                // 首先初始化模擬引擎 (因為其他模組可能依賴它)
                SimulationEngine.initialize();
                console.log("模擬引擎初始化完成");
                
                // 檢查並初始化結果顯示模組
                if (typeof ResultDisplay !== 'undefined') {
                    ResultDisplay.initialize();
                    console.log("結果顯示模組初始化完成");
                } else {
                    console.warn("ResultDisplay 模組未定義，跳過初始化");
                }
                
                // 初始化水果機/抽獎機
                if (typeof FruitMachine !== 'undefined') {
                    FruitMachine.initialize();
                    console.log("抽獎機初始化完成");
                } else {
                    console.warn("FruitMachine 模組未定義，跳過初始化");
                }
                
                // 初始化世界地圖 (如果存在)
                if (typeof WorldMap !== 'undefined') {
                    WorldMap.initialize();
                    console.log("世界地圖初始化完成");
                } else {
                    console.warn("WorldMap 模組未定義，跳過初始化");
                }
                
                // 初始化歷史記錄
                if (typeof HistoryManager !== 'undefined') {
                    HistoryManager.initialize();
                    console.log("歷史記錄初始化完成");
                } else {
                    console.warn("HistoryManager 模組未定義，跳過初始化");
                }
                
                // 綁定按鈕事件
                bindEvents();
                console.log("事件綁定完成");
                
                // 初始化全部完成
                console.log("應用程序初始化完成!");
            } catch (error) {
                console.error("應用程序初始化失敗:", error.message);
                console.error("錯誤堆疊:", error.stack);
                alert("初始化失敗，請刷新頁面重試。");
            }
        }
        
        // 綁定所有交互事件
        function bindEvents() {
            try {
                console.log("開始綁定事件...");
                
                // 獲取按鈕元素
                const spinButton = document.getElementById('spinButton'); // 修正ID：spinButton與DOM元素ID匹配
                const taiwanButton = document.getElementById('speedToTaiwanButton'); // 修正ID：應該為speedToTaiwanButton與DOM元素匹配
                
                // 檢查按鈕是否存在
                if (!spinButton) {
                    throw new Error("找不到抽獎啟動按鈕 (#spinButton)"); // 同步更新錯誤訊息
                }
                
                if (!taiwanButton) {
                    throw new Error("找不到前往台灣按鈕 (#speedToTaiwanButton)"); // 更新錯誤消息與正確ID匹配
                }
                
                // 綁定抽獎啟動按鈕
                spinButton.addEventListener('click', function() {
                    console.log("抽獎啟動按鈕被點擊");
                    FruitMachine.start(false); // 一般抽獎模式
                });
                
                // 綁定前往台灣按鈕
                taiwanButton.addEventListener('click', function() {
                    console.log("前往台灣按鈕被點擊");
                    FruitMachine.speedToTaiwan(); // 修改為使用加速抽中台灣功能
                });
                
                // 綁定重置按鈕 (如果存在)
                const resetButton = document.getElementById('resetButton');
                if (resetButton) {
                    resetButton.addEventListener('click', function() {
                        console.log("重置按鈕被點擊");
                        location.reload(); // 簡單刷新頁面
                    });
                }
                
                console.log("所有事件綁定完成");
            } catch (error) {
                console.error("綁定事件時發生錯誤:", error.message);
                console.error("錯誤堆疊:", error.stack);
                alert("綁定交互事件失敗，某些功能可能無法使用。");
            }
        }
        
        // 返回公共API
        return {
            init: initializeApplication
        };
    })();
    
    // 移除這裡對 App.init() 的直接調用
    // App.init();
    
    /**
     * 歷史記錄管理器
     * 
     * 採用代理模式(Proxy Pattern)實現延遲加載
     * 使用訪問者模式(Visitor Pattern)處理不同類型的歷史資料分析
     */
    const HistoryManager = (function() {
        // 私有變數
        const MAX_HISTORY = 100;
        let historyList = [];
        let historyContainer;
        let historyListElement;
        let historyCountElement;
        
        // 初始化
        function initialize() {
            historyContainer = document.querySelector('.history-container');
            historyListElement = document.getElementById('historyList');
            historyCountElement = document.getElementById('historyCount');
            
            // 嘗試從本地存儲加載歷史記錄
            loadHistory();
            
            // 初始顯示
            updateHistoryDisplay();
        }
        
        // 加載歷史記錄
        function loadHistory() {
            try {
                const savedHistory = localStorage.getItem('birthLotteryHistory');
                if (savedHistory) {
                    historyList = JSON.parse(savedHistory);
                    console.log('從本地存儲中加載了', historyList.length, '條歷史記錄');
                }
            } catch (error) {
                console.error('加載歷史記錄失敗:', error);
                historyList = [];
            }
        }
        
        // 保存歷史記錄到本地存儲
        function saveHistory() {
            try {
                localStorage.setItem('birthLotteryHistory', JSON.stringify(historyList));
            } catch (error) {
                console.error('保存歷史記錄失敗:', error);
            }
        }
        
        // 添加記錄
        function addRecord(country, isSpeedToTaiwan) {
            if (!country) return;
            
            // 創建新記錄
            const record = {
                countryCode: country.code,
                countryName: country.name,
                fertilityRate: country.fertilityRate,
                continent: country.continent,
                timestamp: new Date().toISOString(),
                isSpeedToTaiwan: isSpeedToTaiwan // 新增標記是否為加速抽中台灣的嘗試
            };
            
            // 添加到歷史列表的前面 (最新的在最前面)
            historyList.unshift(record);
            
            // 限制記錄數量
            if (historyList.length > MAX_HISTORY) {
                historyList = historyList.slice(0, MAX_HISTORY);
            }
            
            // 更新顯示
            updateHistoryDisplay();
            
            // 保存到本地存儲
            saveHistory();
        }
        
        // 更新歷史顯示
        function updateHistoryDisplay() {
            // 更新計數器
            historyCountElement.textContent = `(${historyList.length}/${MAX_HISTORY})`;
            
            // 清空列表
            historyListElement.innerHTML = '';
            
            // 如果沒有記錄
            if (historyList.length === 0) {
                historyListElement.innerHTML = '<div class="empty-history">尚無抽獎記錄</div>';
                return;
            }
            
            // 添加每條記錄
            historyList.forEach((record, index) => {
                const item = document.createElement('div');
                item.className = 'history-item';
                
                // 設置資料屬性，用於統計功能 - 遵循數據與展示分離原則
                item.setAttribute('data-country', record.countryCode);
                item.setAttribute('data-continent', record.continent);
                
                // 格式化時間
                const date = new Date(record.timestamp);
                const formattedTime = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
                
                // 獲取國旗表情符號
                const flagEmoji = getFlagEmoji(record.countryCode);
                
                item.innerHTML = `
                    <div class="history-flag">${flagEmoji}</div>
                    <div class="history-details">
                        <div class="history-country">${record.countryName}</div>
                        <div class="history-info">生育率: ${record.fertilityRate} | 洲份: ${record.continent}</div>
                    </div>
                    <div class="history-time">${formattedTime}</div>
                    ${record.isSpeedToTaiwan ? '<div class="history-speed-to-taiwan">加速抽中台灣</div>' : ''}
                `;
                
                historyListElement.appendChild(item);
            });
            
            // 更新統計信息
            updateStatistics();
        }
        
        // 更新統計資訊
        function updateStatistics() {
            // 獲取抽獎歷史記錄
            const historyItems = document.querySelectorAll('.history-item');
            
            // 如果沒有抽獎記錄，則不更新統計
            if (historyItems.length === 0) {
                return;
            }
            
            // 收集洲別數據 - 策略模式：將數據收集邏輯與展示邏輯分離
            const continentStats = {};
            const countryStats = {};
            
            historyItems.forEach(item => {
                const countryCode = item.getAttribute('data-country');
                const country = SimulationEngine.getSpecificCountry(countryCode);
                
                if (country) {
                    // 統計洲別
                    if (!continentStats[country.continent]) {
                        continentStats[country.continent] = 0;
                    }
                    continentStats[country.continent]++;
                    
                    // 統計國家
                    if (!countryStats[countryCode]) {
                        countryStats[countryCode] = {
                            count: 0,
                            name: country.name,
                            code: countryCode
                        };
                    }
                    countryStats[countryCode].count++;
                }
            });
            
            // 更新圓餅圖 - 觀察者模式：圖表響應數據變化自動更新
            updateContinentChart(continentStats);
            
            // 更新國家排名 - 使用裝飾者模式展示排名數據
            updateCountryRanking(countryStats);
            
            // 更新世界地圖 - 橋接模式：將地圖抽象與實現分離
            updateWorldMap(countryStats);
        }
        
        /**
         * 更新洲別統計圓餅圖
         * @param {Object} continentStats - 各洲統計數據
         * 遵循單一職責原則(SRP)：該函數只負責圓餅圖的更新
         */
        function updateContinentChart(continentStats) {
            try {
                // 檢查元素是否存在
                const chartContainer = document.getElementById('continentChart');
                if (!chartContainer) {
                    console.error("找不到圓餅圖容器元素(#continentChart)");
                    return;
                }
                
                // 確保Chart.js已載入
                if (typeof Chart === 'undefined') {
                    console.error("Chart.js 未正確載入");
                    return;
                }
                
                // 清空內部內容，重新創建canvas
                chartContainer.innerHTML = '';
                const canvas = document.createElement('canvas');
                chartContainer.appendChild(canvas);

                // 準備數據 - 使用原始中文洲別名稱作為標籤
                const labels = Object.keys(continentStats);
                const data = Object.values(continentStats);

                // 使用更適合深色主題的顏色配置 - 策略模式(Strategy Pattern)的應用
                const colorMap = {
                    '亞洲': 'rgba(255, 99, 132, 0.8)', // 粉紅色
                    '歐洲': 'rgba(54, 162, 235, 0.8)', // 藍色
                    '北美洲': 'rgba(255, 206, 86, 0.8)', // 黃色
                    '南美洲': 'rgba(75, 192, 192, 0.8)', // 青色
                    '非洲': 'rgba(153, 102, 255, 0.8)', // 紫色
                    '大洋洲': 'rgba(255, 159, 64, 0.8)', // 橙色
                    '南極洲': 'rgba(199, 199, 199, 0.8)' // 灰色
                };

                // 為每個洲別分配顏色，未定義的洲別使用隨機顏色
                const backgroundColor = labels.map(continent => {
                    return colorMap[continent] || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`;
                });

                // 創建深色主題適用的圓餅圖
                new Chart(canvas, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: backgroundColor,
                            borderColor: 'rgba(30, 41, 59, 1)', // 深色邊框
                            borderWidth: 2,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    // 深色主題下的文字顏色
                                    font: {
                                        family: "'Noto Sans TC', sans-serif",
                                        size: 14
                                    },
                                    color: '#e2e8f0' // 淺色文字
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const value = context.raw;
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return `${context.label}: ${value}次 (${percentage}%)`;
                                    }
                                },
                                backgroundColor: 'rgba(30, 41, 59, 0.9)', // 深色提示框背景
                                titleColor: '#e2e8f0', // 淺色標題
                                bodyColor: '#e2e8f0', // 淺色內容
                                borderColor: 'rgba(74, 85, 104, 1)',
                                borderWidth: 1
                            },
                            title: {
                                display: true,
                                text: '各洲抽獎分佈',
                                font: {
                                    family: "'Noto Sans TC', sans-serif",
                                    size: 16,
                                    weight: 'bold'
                                },
                                color: '#e2e8f0', // 淺色標題
                                padding: {
                                    top: 10,
                                    bottom: 15
                                }
                            }
                        }
                    }
                });
                
                console.log("圓餅圖繪製完成");
            } catch (error) {
                console.error("更新洲別圖表時發生錯誤:", error.message);
                console.error("錯誤堆疊:", error.stack);
                
                // 錯誤回退顯示 - 裝飾者模式(Decorator Pattern)應用
                const chartContainer = document.getElementById('continentChart');
                if (chartContainer) {
                    chartContainer.innerHTML = `<div class="error-message">無法載入圖表：${error.message}</div>`;
                }
            }
        }
        
        /**
         * 更新國家排名
         * @param {Object} countryStats - 各國統計數據
         * 遵循開放封閉原則(OCP)：易於擴展排名展示方式而無需修改既有邏輯
         */
        function updateCountryRanking(countryStats) {
            const topCountriesContainer = document.getElementById('topCountries');
            topCountriesContainer.innerHTML = '<h4>抽獎次數排名</h4>';
            
            // 轉換為數組並排序
            const countriesArray = Object.values(countryStats).sort((a, b) => b.count - a.count);
            
            // 取前5名國家
            const topCountries = countriesArray.slice(0, 5);
            
            // 創建排名表格
            const table = document.createElement('table');
            table.className = 'ranking-table';
            
            // 添加表頭
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>排名</th>
                    <th>國家</th>
                    <th>次數</th>
                    <th>佔比</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // 添加表體
            const tbody = document.createElement('tbody');
            
            // 計算總次數
            const totalDraws = Object.values(countryStats).reduce((sum, country) => sum + country.count, 0);
            
            topCountries.forEach((country, index) => {
                const percentage = ((country.count / totalDraws) * 100).toFixed(1);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${getFlagEmoji(country.code)} ${country.name}</td>
                    <td>${country.count}</td>
                    <td>${percentage}%</td>
                `;
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            topCountriesContainer.appendChild(table);
        }
        
        /**
         * 更新世界地圖
         * @param {Object} countryStats - 各國統計數據
         */
        function updateWorldMap(countryStats) {
            try {
                // 檢查是否已有世界地圖容器，如果沒有則創建
                let worldMapContainer = document.getElementById('worldMapContainer');
                let resultsContainer = document.getElementById('resultsContainer');
                
                // 安全檢查：確認結果容器存在
                if (!resultsContainer) {
                    console.warn("無法找到結果容器(#resultsContainer)，跳過世界地圖更新");
                    return;
                }
                
                if (!worldMapContainer) {
                    // 創建地圖容器
                    worldMapContainer = document.createElement('div');
                    worldMapContainer.id = 'worldMapContainer';
                    worldMapContainer.className = 'world-map-container';
                    worldMapContainer.innerHTML = '<h4>全球抽獎分布</h4>';
                    
                    // 創建地圖元素
                    const worldMapElement = document.createElement('div');
                    worldMapElement.id = 'worldMap';
                    worldMapElement.className = 'world-map';
                    
                    worldMapContainer.appendChild(worldMapElement);
                    
                    // 將容器添加到結果區域
                    resultsContainer.appendChild(worldMapContainer);
                }
                
                // 這裡應該有更新地圖的邏輯，未來可以添加實際的地圖視覺化
                console.log("地圖已更新，顯示 " + Object.keys(countryStats).length + " 個國家");
            } catch (error) {
                console.error("更新地圖時發生錯誤:", error.message);
                console.error("錯誤堆疊:", error.stack);
            }
        }

        /**
         * WorldMap 模組 - 用於世界地圖相關功能
         * 使用外觀模式(Facade Pattern)簡化地圖界面操作
         */
        const WorldMap = (function() {
            let initialized = false;
            
            /**
             * 初始化世界地圖
             */
            function initialize() {
                if (initialized) {
                    console.log("世界地圖已經初始化過");
                    return;
                }
                
                try {
                    // 創建地圖容器，但暫時不顯示數據
                    let worldMapContainer = document.getElementById('worldMapContainer');
                    
                    if (!worldMapContainer) {
                        // 創建地圖容器
                        worldMapContainer = document.createElement('div');
                        worldMapContainer.id = 'worldMapContainer';
                        worldMapContainer.className = 'world-map-container';
                        worldMapContainer.innerHTML = '<h4>全球抽獎分布</h4>';
                        
                        // 創建地圖元素
                        const worldMapElement = document.createElement('div');
                        worldMapElement.id = 'worldMap';
                        worldMapElement.className = 'world-map';
                        
                        // 將地圖元素添加到容器
                        worldMapContainer.appendChild(worldMapElement);
                        
                        // 將容器添加到結果區域
                        const resultsContainer = document.getElementById('resultsContainer');
                        if (resultsContainer) {
                            resultsContainer.appendChild(worldMapContainer);
                        } else {
                            console.warn("找不到結果容器，無法添加世界地圖");
                        }
                    }
                    
                    initialized = true;
                    console.log("世界地圖初始化成功");
                } catch (error) {
                    console.error("世界地圖初始化失敗:", error.message);
                    throw error;
                }
            }
            
            /**
             * 更新世界地圖數據
             * @param {Object} countryStats - 各國統計數據
             */
            function updateMap(countryStats) {
                if (!initialized) {
                    console.warn("世界地圖尚未初始化，無法更新數據");
                    return;
                }
                
                // 調用已有的更新函數
                updateWorldMap(countryStats);
            }
            
            // 返回公共API
            return {
                initialize: initialize,
                updateMap: updateMap
            };
        })();
        
        // 獲取國旗表情符號 (與ResultDisplay共享的輔助函數)
        function getFlagEmoji(countryCode) {
            // 特殊處理台灣國旗
            if (countryCode === 'TW') {
                return '🇹🇼';
            }
            
            // 其他國家通用處理
            const codePoints = countryCode
                .toUpperCase()
                .split('')
                .map(char => 127397 + char.charCodeAt());
                
            return String.fromCodePoint(...codePoints);
        }
        
        // 返回公共API
        return {
            initialize: initialize,
            addRecord: addRecord
        };
    })();
    
});

// 添加DOM內容加載完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 確保所有模組都已定義後再初始化應用程序
    console.log("頁面已加載完成，開始初始化應用...");
    
    // 使用延遲執行確保DOM完全渲染
    setTimeout(function() {
        // 使用 try-catch 包裝初始化過程，避免出錯時頁面無法使用
        try {
            App.init();
            console.log("應用程序初始化成功！");
        } catch (error) {
            console.error("應用程序初始化時發生錯誤:", error.message);
            console.error("錯誤堆疊:", error.stack);
            alert("初始化過程中出現錯誤，部分功能可能無法使用。");
        }
    }, 50); // 短延遲確保DOM完全就緒
});

// 添加DOM內容加載完成後的初始化 - 替換原有的初始化邏輯
document.addEventListener('DOMContentLoaded', function() {
    // 確保所有模組都已定義後再初始化應用程序
    console.log("頁面已加載完成，開始初始化應用...");
    
    // 檢查必要的外部資源是否已載入 - 遵循單一職責原則(SRP)，專門負責資源檢查
    function checkResourcesLoaded() {
        // 檢查數據模型是否已載入
        if (!window.birthSimulation || !window.birthSimulation.countries) {
            console.warn("數據模型尚未載入，等待500ms後重試...");
            setTimeout(checkResourcesLoaded, 500);
            return;
        }
        
        // 檢查 Chart.js 是否已載入
        if (typeof Chart === 'undefined') {
            console.warn("Chart.js 尚未載入，等待500ms後重試...");
            setTimeout(checkResourcesLoaded, 500);
            return;
        }
        
        // 檢查 D3.js 是否已載入 (如果需要)
        if (typeof d3 === 'undefined') {
            console.warn("D3.js 尚未載入，等待500ms後重試...");
            setTimeout(checkResourcesLoaded, 500);
            return;
        }
        
        // 所有資源都已載入，可以初始化應用 - 符合依賴倒置原則(DIP)，減少對具體實現的依賴
        console.log("所有必要資源已載入，開始初始化應用...");
        initializeApp();
    }
    
    // 初始化應用的函數 - 遵循單一職責原則(SRP)，專門負責初始化邏輯
    function initializeApp() {
        // 使用 try-catch 包裝初始化過程，避免出錯時頁面無法使用 - 實現防禦性程式設計模式
        try {
            App.init();
            console.log("應用程序初始化成功！");
        } catch (error) {
            console.error("應用程序初始化時發生錯誤:", error.message);
            console.error("錯誤堆疊:", error.stack);
            alert("初始化過程中出現錯誤，部分功能可能無法使用。");
        }
    }
    
    // 開始檢查資源載入狀態 - 採用延遲加載模式(Lazy Loading Pattern)，確保資源就緒
    // 給予一點延遲，讓外部資源有更多時間載入
    setTimeout(checkResourcesLoaded, 100);
});
