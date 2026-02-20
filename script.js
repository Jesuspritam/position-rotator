// ===== PREFIXES AND SUFFIXES TO REMOVE =====
const PREFIXES = [
    'brother', 'bro', 'sister', 'sis', 'bhai', 'bahan',
    'mr', 'mrs', 'ms', 'dr', 'pt', 'pt.', 'shri', 'shrimati', 'sri', 'smt', 'prof',
    'pandit', 'guruji', 'mahant', 'swami', 'sant',
    'mother', 'father', 'mataji', 'pitaji',
    'র', 'ব্রাদার', 'সিস্টার', 'ভাই', 'বোন',
    'भाई', 'बहन', 'भ्राता', 'सहोदर',
];

const SUFFIXES = [
    'bhai', 'bahan', 'brother', 'sister', 'ji',
    'dada', 'didi', 'da', 'di', 'ba', 'bi',
    'g', 'ji', 'jee',
    'র', 'ভাই', 'বোন',
    'भाई', 'बहन',
];

// ===== LOAD COUNTS =====
function loadCounts() {
    const data = localStorage.getItem('positionCounts');
    return data ? JSON.parse(data) : {};
}

// ===== SAVE COUNTS =====
function saveCounts(counts) {
    localStorage.setItem('positionCounts', JSON.stringify(counts));
}

// ===== CLEAN NAME =====
function cleanName(name) {
    let cleaned = name.toLowerCase().trim();
    
    PREFIXES.forEach(prefix => {
        const regex = new RegExp(`^${prefix}\\s+`, 'i');
        cleaned = cleaned.replace(regex, '');
    });
    
    SUFFIXES.forEach(suffix => {
        const regex = new RegExp(`\\s+${suffix}$`, 'i');
        cleaned = cleaned.replace(regex, '');
    });
    
    cleaned = cleaned.replace(/\b\w/g, letter => letter.toUpperCase());
    return cleaned.trim();
}

// ===== PARSE NAMES =====
function parseNames(inputText) {
    const lines = inputText.split('\n');
    const names = [];
    const seen = new Set();
    
    for (const line of lines) {
        let cleaned = cleanName(line);
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
    
    names.forEach(name => {
        if (!counts[name]) {
            counts[name] = { first: 0, second: 0 };
        }
    });
    
    const sortedNames = names.sort((a, b) => {
        const totalA = counts[a].first + counts[a].second;
        const totalB = counts[b].first + counts[b].second;
        if (totalA === totalB) {
            return a.localeCompare(b);
        }
        return totalA - totalB;
    });
    
    const positions = {};
    sortedNames.forEach((name, index) => {
        positions[index + 1] = name;
    });
    
    if (sortedNames.length >= 1) counts[sortedNames[0]].first++;
    if (sortedNames.length >= 2) counts[sortedNames[1]].second++;
    
    saveCounts(counts);
    return positions;
}

// ===== DISPLAY RESULTS =====
function displayResults(positions, counts) {
    const outputDiv = document.getElementById('output');
    let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '       ASSIGNED POSITIONS\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    for (const [pos, name] of Object.entries(positions)) {
        const suffix = pos == 1 ? 'st' : pos == 2 ? 'nd' : pos == 3 ? 'rd' : 'th';
        output += `  ${pos}${suffix}  ➤  ${name}\n`;
    }
    
    output += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '         STATISTICS\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    for (const [name, data] of Object.entries(counts)) {
        output += `${name}\n`;
        output += `   🥇 1st: ${data.first} | 🥈 2nd: ${data.second}\n\n`;
    }
    
    outputDiv.textContent = output;
    outputDiv.classList.add('show');
}

// ===== LEADERBOARD (Sorted by 1st, then 2nd) =====
function viewLeaderboard() {
    const counts = loadCounts();
    const outputDiv = document.getElementById('output');
    
    if (Object.keys(counts).length === 0) {
        outputDiv.textContent = 'No data available yet.\nAssign positions first to see the leaderboard.';
        outputDiv.classList.add('show');
        return;
    }
    
    // Sort by: 1st positions (desc), then 2nd positions (desc)
    const sorted = Object.entries(counts).sort((a, b) => {
        const firstA = a[1].first;
        const firstB = b[1].first;
        const secondA = a[1].second;
        const secondB = b[1].second;
        
        if (firstB !== firstA) return firstB - firstA;
        if (secondB !== secondA) return secondB - secondA;
        return a[0].localeCompare(b[0]);
    });
    
    let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '    🏆 LEADERBOARD 🏆\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    sorted.forEach(([name, data], index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `  ${rank}.`;
        output += `${medal} ${name}\n`;
        output += `      1st: ${data.first} | 2nd: ${data.second}\n\n`;
    });
    
    outputDiv.textContent = output;
    outputDiv.classList.add('show');
}

// ===== EVENT LISTENERS =====
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

document.getElementById('leaderboardBtn').addEventListener('click', () => {
    viewLeaderboard();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('positionCounts');
        document.getElementById('output').classList.remove('show');
        document.getElementById('output').textContent = '';
        alert('Data has been reset!');
    }
});
