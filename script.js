// Load counts from localStorage
function loadCounts() {
    const data = localStorage.getItem('positionCounts');
    return data ? JSON.parse(data) : {};
}

// Save counts to localStorage
function saveCounts(counts) {
    localStorage.setItem('positionCounts', JSON.stringify(counts));
}

// Parse names from pasted input
function parseNames(inputText) {
    const lines = inputText.split('\n');
    const names = [];
    for (const line of lines) {
        const cleaned = line.trim().replace(/^[\d\W]+\s*/, '');
        if (cleaned) names.push(cleaned);
    }
    return names;
}

// Assign positions
function assignPositions(names) {
    const counts = loadCounts();
    names.forEach(name => {
        if (!counts[name]) counts[name] = { first: 0, second: 0 };
    });
    const sortedNames = names.sort((a, b) => (counts[a].first + counts[a].second) - (counts[b].first + counts[b].second));
    
    const positions = {};
    sortedNames.forEach((name, index) => {
        positions[index + 1] = name;
    });
    
    if (sortedNames.length >= 1) counts[sortedNames[0]].first++;
    if (sortedNames.length >= 2) counts[sortedNames[1]].second++;
    
    saveCounts(counts);
    return positions;
}

// Display results with styling
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

// Event listener for Assign button
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

// Event listener for Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.removeItem('positionCounts');
        document.getElementById('output').classList.remove('show');
        document.getElementById('output').textContent = '';
        alert('Data has been reset!');
    }
});