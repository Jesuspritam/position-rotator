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

// ===== POINTS SYSTEM =====
const POINTS_SYSTEM = {
    1: 12,
    2: 10,
    3: 9,
    4: 8,
    5: 7,
    6: 6,
    7: 5,
    8: 4,
    9: 3,
    10: 2,
};

function getPoints(position) {
    if (POINTS_SYSTEM[position]) {
        return POINTS_SYSTEM[position];
    }
    return 1;
}

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

// ===== PARSE NAMES (Preserve Exact Order) =====
function parseNames(inputText) {
    const lines = inputText.split('\n');
    const names = [];
    const seen = new Set();
    
    for (const line of lines) {
        let cleaned = cleanName(line);
        cleaned = cleaned.replace(/^[\d\W]+\s*/, '').trim();
        
        if (cleaned && !seen.has(cleaned)) {
            seen.add(cleaned);
            names.push(cleaned); // Push in exact order
        }
    }
    return names;
}

// ===== ASSIGN POSITIONS (Exact Input Order) =====
function assignPositions(names) {
    const counts = loadCounts();
    
    // Initialize missing names
    names.forEach(name => {
        if (!counts[name]) {
            counts[name] = { first: 0, second: 0, points: 0 };
        }
    });
    
    // Create array to store positions in exact input order
    const orderedNames = [...names];
    
    // Update points and counts
    orderedNames.forEach((name, index) => {
        const position = index + 1;
        
        // Update points
        const points = getPoints(position);
        counts[name].points = (counts[name].points || 0) + points;
        
        // Update 1st and 2nd counts
        if (position === 1) counts[name].first++;
        if (position === 2) counts[name].second++;
    });
    
    saveCounts(counts);
    
    // Return as array (not object) to preserve order
    return orderedNames;
}

// ===== DISPLAY RESULTS =====
function displayResults(orderedNames, counts) {
    const outputDiv = document.getElementById('output');
    let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '       SUNDAY RESULTS\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    // Display in exact input order
    orderedNames.forEach((name, index) => {
        const position = index + 1;
        const suffix = position == 1 ? 'st' : position == 2 ? 'nd' : position == 3 ? 'rd' : 'th';
        const points = getPoints(position);
        output += `  ${position}${suffix}  ➤  ${name} (+${points} pts)\n`;
    });
    
    output += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '    OVERALL STANDINGS\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    // Sort by points (desc), then by firsts, then seconds
    const sorted = Object.entries(counts).sort((a, b) => {
        const pointsB = b[1].points || 0;
        const pointsA = a[1].points || 0;
        if (pointsB !== pointsA) return pointsB - pointsA;
        
        const firstB = b[1].first;
        const firstA = a[1].first;
        if (firstB !== firstA) return firstB - firstA;
        
        return (b[1].second || 0) - (a[1].second || 0);
    });
    
    sorted.forEach(([name, data]) => {
        output += `${name}: ${data.points || 0} pts\n`;
        output += `   🥇 1st: ${data.first} | 🥈 2nd: ${data.second}\n\n`;
    });
    
    outputDiv.textContent = output;
    outputDiv.classList.add('show');
}

// ===== LEADERBOARD (Based on Points) =====
function viewLeaderboard() {
    const counts = loadCounts();
    const outputDiv = document.getElementById('output');
    
    if (Object.keys(counts).length === 0) {
        outputDiv.textContent = 'No data available yet.\nAssign positions first to see the leaderboard.';
        outputDiv.classList.add('show');
        return;
    }
    
    // Sort by: Points (desc), then 1st positions (desc), then 2nd positions (desc)
    const sorted = Object.entries(counts).sort((a, b) => {
        const pointsB = b[1].points || 0;
        const pointsA = a[1].points || 0;
        if (pointsB !== pointsA) return pointsB - pointsA;
        
        const firstB = b[1].first;
        const firstA = a[1].first;
        if (firstB !== firstA) return firstB - firstA;
        
        return (b[1].second || 0) - (a[1].second || 0);
    });
    
    let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '    🏆 FINAL LEADERBOARD 🏆\n';
    output += '    (Based on Total Points)\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    sorted.forEach(([name, data], index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `  ${rank}.`;
        output += `${medal} ${name}\n`;
        output += `      ⭐ ${data.points || 0} pts\n`;
        output += `      🥇 1st: ${data.first} | 🥈 2nd: ${data.second}\n\n`;
    });
    
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '    🏅 PRIZE WINNERS 🏅\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    if (sorted.length >= 1) {
        output += `🥇 1st Prize: ${sorted[0][0]}\n`;
    }
    if (sorted.length >= 2) {
        output += `🥈 2nd Prize: ${sorted[1][0]}\n`;
    }
    if (sorted.length >= 3) {
        output += `🥉 3rd Prize: ${sorted[2][0]}\n`;
    }
    
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
    
    const orderedNames = assignPositions(names);
    const counts = loadCounts();
    displayResults(orderedNames, counts);
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
