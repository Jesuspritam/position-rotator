// ===== PREFIXES AND SUFFIXES TO REMOVE =====
const PREFIXES = [
    'brother', 'bro', 'sister', 'sis', 'bhai', 'bahan',
    'mr', 'mrs', 'ms', 'dr', 'pt', 'pt.', 'shri', 'shrimati', 'sri', 'smt', 'prof',
    'pandit', 'guruji', 'mahant', 'swami', 'sant',
    'mother', 'father', 'mataji', 'pitaji',
    'র', 'ব্রাদার', 'সিস্টার', 'ভাই', 'বোন', // Bengali
    'भाई', 'बहन', 'भ्राता', 'सहोदर', // Hindi
];

const SUFFIXES = [
    'bhai', 'bahan', 'brother', 'sister', 'ji', 'ji',
    'dada', 'didi', 'da', 'di', 'ba', 'bi',
    'g', 'ji', 'jee',
    'র', 'ভাই', 'বোন', // Bengali
    'भाई', 'बहन', // Hindi
];

// ===== LOAD COUNTS FROM STORAGE =====
function loadCounts() {
    const data = localStorage.getItem('positionCounts');
    return data ? JSON.parse(data) : {};
}

// ===== SAVE COUNTS TO STORAGE =====
function saveCounts(counts) {
    localStorage.setItem('positionCounts', JSON.stringify(counts));
}

// ===== CLEAN NAME: Remove prefix/suffix and convert to CamelCase =====
function cleanName(name) {
    // Convert to lowercase for processing
    let cleaned = name.toLowerCase().trim();
    
    // Remove common prefixes
    PREFIXES.forEach(prefix => {
        const regex = new RegExp(`^${prefix}\\s+`, 'i');
        cleaned = cleaned.replace(regex, '');
    });
    
    // Remove common suffixes
    SUFFIXES.forEach(suffix => {
        const regex = new RegExp(`\\s+${suffix}$`, 'i');
        cleaned = cleaned.replace(regex, '');
    });
    
    // Convert to CamelCase
    cleaned = cleaned.replace(/\b\w/g, letter => letter.toUpperCase());
    
    return cleaned.trim();
}

// ===== PARSE NAMES FROM PASTED INPUT =====
function parseNames(inputText) {
    const lines = inputText.split('\n');
    const names = [];
    const seen = new Set();
    
    for (const line of lines) {
        let cleaned = cleanName(line);
        // Remove numbers and emojis from beginning
        cleaned = cleaned.replace(/^[\d\W]+\s*/, '').trim();
        
        if (cleaned && !seen.has(cleaned)) {
            seen.add(cleaned);
            names.push(cleaned);
        }
    }
    return names;
}

// ===== ASSIGN POSITIONS =====
function assignPositions(names) {
    const counts = loadCounts();
    
    // Initialize missing names
    names.forEach(name => {
        if (!counts[name]) {
            counts[name] = { first: 0, second: 0 };
        }
    });
    
    // Sort by total top positions (ascending - those with fewer get priority)
    const sortedNames = names.sort((a, b) => {
        const totalA = counts[a].first + counts[a].second;
        const totalB = counts[b].first + counts[b].second;
        if (totalA === totalB) {
            return a.localeCompare(b); // Alphabetical if tied
        }
        return totalA - totalB;
    });
    
    // Assign positions
    const positions = {};
    sortedNames.forEach((name, index) => {
        positions[index + 1] = name;
    });
    
    // Update counts
    if (sortedNames.length >= 1) {
        counts[sortedNames[0]].first++;
    }
    if (sortedNames.length >= 2) {
        counts[sortedNames[1]].second++;
    }
    
    saveCounts(counts);
    return positions;
}

// ===== DISPLAY RESULTS =====
function displayResults(positions, counts) {
    const outputDiv = document.getElementById('output');
    let output = '━━━━━━━━━━━━━\n';
    output += '       ASSIGNED POSITIONS\n';
    output += '━━━━━━━━━━━━━\n\n';
    
    for (const [pos, name] of Object.entries(positions)) {
        const suffix = pos == 1 ? 'st' : pos == 2 ? 'nd' : pos == 3 ? 'rd' : 'th';
        output += `  ${pos}${suffix}  ➤  ${name}\n`;
    }
    
    output += '\n━━━━━━━━━━━━━\n';
    output += '         STATISTICS\n';
    output += '━━━━━━━━━━━━━\n\n';
    
    for (const [name, data] of Object.entries(counts)) {
        output += `${name}\n`;
        output += `   🥇 1st: ${data.first} | 🥈 2nd: ${data.second}\n\n`;
    }
    
    outputDiv.textContent = output;
    outputDiv.classList.add('show');
}

// ===== VIEW LEADERBOARD =====
function viewLeaderboard() {
    const counts = loadCounts();
    const outputDiv = document.getElementById('output');
    
    if (Object.keys(counts).length === 0) {
        outputDiv.textContent = 'No data available yet.\nAssign positions first to see the leaderboard.';
        outputDiv.classList.add('show');
        return;
    }
    
    // Sort by first positions (descending)
    const sorted = Object.entries(counts).sort((a, b) => b[1].first - a[1].first);
    
    let output = '━━━━━━━━━━━━━━\n';
    output += '    🏆 LEADERBOARD 🏆\n';
    output += '    (Based on 1st Positions)\n';
    output += '━━━━━━━━━━━━━━\n\n';
    
    sorted.forEach(([name, data], index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        output += `${medal} ${index + 1}. ${name}\n`;
        output += `      1st: ${data.first} | 2nd: ${data.second}\n\n`;
    });
    
    output += '━━━━━━━━━━━━━━\n';
    output += '   TOP WINNER FOR PRIZE:\n';
    output += '━━━━━━━━━━━━━━\n\n';
    output += `   🎉 ${sorted[0][0]} 🎉\n`;
    output += `   With ${sorted[0][1].first} first positions!\n`;
    
    outputDiv.textContent = output;
    outputDiv.classList.add('show');
}

// ===== EVENT LISTENERS =====

// Assign Positions Button
document.getElementById('assignBtn').addEventListener('click', () => {
    const inputText = document.getElementById('nameInput').value;
    const names = parseNames(inputText);
    
    if (names.length === 0) {
        alert('No valid names found. Please paste a list.');
        return;
    }
    
    const positions = assignPositions(names);
    const counts = loadCounts();
    displayResults(positions, counts);
    document.getElementById('nameInput').value = '';
});

// Leaderboard Button
document.getElementById('leaderboardBtn').addEventListener('click', () => {
    viewLeaderboard();
});

// Reset Button
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('positionCounts');
        document.getElementById('output').classList.remove('show');
        document.getElementById('output').textContent = '';
        alert('Data has been reset!');
    }
});

