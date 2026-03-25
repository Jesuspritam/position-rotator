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

// ===== LOAD WEEKLY RECORDS =====
function loadWeeklyRecords() {
    const data = localStorage.getItem('weeklyRecords');
    return data ? JSON.parse(data) : [];
}

// ===== SAVE WEEKLY RECORDS =====
function saveWeeklyRecords(records) {
    localStorage.setItem('weeklyRecords', JSON.stringify(records));
}

// ===== GET MONDAY OF CURRENT WEEK =====
function getMondayOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    return monday;
}

// ===== FORMAT DATE AS YYYY-MM-DD =====
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

// ===== GET DAY NAME =====
function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
}

// ===== GET CURRENT WEEK RECORD =====
function getCurrentWeekRecord() {
    const records = loadWeeklyRecords();
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // If it's Sunday (0), there should be no active week
    if (dayOfWeek === 0) {
        return null;
    }
    
    const mondayDate = getMondayOfWeek(today);
    const mondayStr = formatDate(mondayDate);
    
    let currentWeekIndex = records.findIndex(r => r.weekStartDate === mondayStr);
    let currentWeek;
    
    if (currentWeekIndex === -1) {
        // Create new week
        const saturdayDate = new Date(mondayDate);
        saturdayDate.setDate(saturdayDate.getDate() + 5); // Monday + 5 days = Saturday
        
        currentWeek = {
            weekStartDate: mondayStr,
            weekEndDate: formatDate(saturdayDate),
            participants: {},
            created: formatDate(today)
        };
        
        records.push(currentWeek);
        saveWeeklyRecords(records);
    } else {
        currentWeek = records[currentWeekIndex];
    }
    
    return currentWeek;
}

// ===== CURRENT 6-DAY WEEKLY POINTS MAP =====
function getCurrentWeekPoints() {
    const currentWeek = getCurrentWeekRecord();
    if (!currentWeek || !currentWeek.participants) {
        return {};
    }
    return Object.fromEntries(
        Object.entries(currentWeek.participants).map(([name, participantData]) => [
            name,
            participantData.totalWeeklyPoints || 0
        ])
    );
}

// ===== UPDATE WEEKLY POINTS FOR TODAY =====
function updateWeeklyPoints(orderedNames) {
    try {
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        // If it's Sunday, skip weekly tracking (Sunday is not included)
        if (dayOfWeek === 0) {
            console.log('Sunday - skipping weekly tracking');
            return;
        }
        
        const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[dayOfWeek];
        
        // Get all records
        const records = loadWeeklyRecords();
        const mondayDate = getMondayOfWeek(today);
        const mondayStr = formatDate(mondayDate);
        
        // Find existing week or create new one
        let weekIndex = records.findIndex(r => r.weekStartDate === mondayStr);
        
        if (weekIndex === -1) {
            // Create new week
            const saturdayDate = new Date(mondayDate);
            saturdayDate.setDate(saturdayDate.getDate() + 5);
            
            records.push({
                weekStartDate: mondayStr,
                weekEndDate: formatDate(saturdayDate),
                participants: {},
                created: formatDate(today)
            });
            weekIndex = records.length - 1;
        }
        
        // Update participants for this week
        const currentWeek = records[weekIndex];
        
        orderedNames.forEach((name, index) => {
            const position = index + 1;
            const points = getPoints(position);
            
            if (!currentWeek.participants[name]) {
                currentWeek.participants[name] = {
                    dailyPoints: {
                        Monday: 0,
                        Tuesday: 0,
                        Wednesday: 0,
                        Thursday: 0,
                        Friday: 0,
                        Saturday: 0
                    },
                    totalWeeklyPoints: 0
                };
            }
            
            // Add points for today
            currentWeek.participants[name].dailyPoints[dayName] += points;
            
            // Recalculate total for this participant
            currentWeek.participants[name].totalWeeklyPoints = Object.values(currentWeek.participants[name].dailyPoints).reduce((sum, dayPoints) => sum + dayPoints, 0);
        });
        
        // Save updated records
        records[weekIndex] = currentWeek;
        saveWeeklyRecords(records);
        
        console.log('Weekly points updated for', orderedNames.length, 'participants on', dayName);
    } catch (error) {
        console.error('Error updating weekly points:', error);
    }
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
    
    // Update weekly points for each participant
    updateWeeklyPoints(orderedNames);
    
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
    
    const currentWeekPoints = getCurrentWeekPoints();

    sorted.forEach(([name, data], index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `  ${rank}.`;
        const weeklyScore = currentWeekPoints[name] || 0;

        output += `${medal} ${name}\n`;
        output += `      ⭐ All-time: ${data.points || 0} pts | Weekly (6-day): ${weeklyScore} pts\n`;
        output += `      🥇 1st: ${data.first} | 🥈 2nd: ${data.second}\n\n`;
    });
    
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    output += '    🏅 PRIZE WINNERS 🏅\n';
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
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

// ===== VIEW WEEKLY RECORDS =====
function viewWeeklyRecords() {
    try {
        const records = loadWeeklyRecords();
        const outputDiv = document.getElementById('output');
        
        console.log('Loaded records:', records);
        
        if (!records || records.length === 0) {
            outputDiv.textContent = 'No weekly records available yet.\nAssign positions to start tracking weekly points.';
            outputDiv.classList.add('show');
            return;
        }
        
        let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '     📊 WEEKLY POINTS SUMMARY 📊\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        // Display records in reverse order (newest first)
        const sortedRecords = [...records].reverse();
        
        sortedRecords.forEach((week, weekIndex) => {
            const weekNumber = sortedRecords.length - weekIndex;
            output += `📅 WEEK ${weekNumber}: ${week.weekStartDate} to ${week.weekEndDate}\n`;
            output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
            
            // Check if participants exist
            if (!week.participants || Object.keys(week.participants).length === 0) {
                output += 'No participants recorded for this week.\n\n';
            } else {
                // Sort participants by their weekly total points (descending)
                const sortedParticipants = Object.entries(week.participants)
                    .sort(([, a], [, b]) => (b.totalWeeklyPoints || 0) - (a.totalWeeklyPoints || 0));
                
                // Display each participant with their points
                sortedParticipants.forEach(([participantName, participantData], participantIndex) => {
                    const rank = participantIndex + 1;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `  ${rank}.`;
                    output += `${medal} ${participantName}: ⭐ ${participantData.totalWeeklyPoints || 0} pts\n`;
                    
                    // Show daily breakdown
                    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    dayOrder.forEach(day => {
                        const dayPoints = participantData.dailyPoints && participantData.dailyPoints[day] ? participantData.dailyPoints[day] : 0;
                        if (dayPoints > 0) {
                            output += `     ${day}: ${dayPoints} pts\n`;
                        }
                    });
                    output += '\n';
                });
            }
            
            output += '\n';
        });
        
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        
        outputDiv.textContent = output;
        outputDiv.classList.add('show');
    } catch (error) {
        console.error('Error displaying weekly records:', error);
        const outputDiv = document.getElementById('output');
        outputDiv.textContent = 'Error loading weekly records. Please try again.\n\nError: ' + error.message;
        outputDiv.classList.add('show');
    }
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

document.getElementById('weeklyBtn').addEventListener('click', () => {
    viewWeeklyRecords();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('positionCounts');
        localStorage.removeItem('weeklyRecords');
        document.getElementById('output').classList.remove('show');
        document.getElementById('output').textContent = '';
        alert('Data has been reset!');
    }
});
