# position-rotator
Shaanti Mandir Satsang Pondicherry Presents, Position Rotator app records the names of the attendees and position them in order method. 

Below, I'll guide you through the process of adapting your position-rotator app for mobile. Since the original is a Python script (which doesn't run natively on mobile), the easiest and most flexible way is to convert it into a web app using HTML, CSS, and JavaScript. This can be accessed via any mobile browser (Android or iOS) and even "installed" as a Progressive Web App (PWA) for a more app-like experience (e.g., add to home screen, works offline).
Why a Web App?
•	Cross-Platform: Works on any phone with a browser (no need for app stores or native development).
•	Simple: No coding tools needed beyond a text editor. You can host it locally or online.
•	Features: Same logic as the Python version (parse names from WhatsApp paste, track counts, assign positions). Uses browser storage (localStorage) for persistence.
•	Limitations: Relies on browser; if you need full native features (e.g., camera access), we'd need something else like React Native.
Step-by-Step Process to Create and Use on Mobile
1.	Create the Files:
•	On your computer, create a folder (e.g., mobile-position-app).
•	Inside it, create three files: index.html, styles.css, and script.js.
•	Copy the code below into each file.
2.	Code for the Web App:
•	index.html (The main page):
html
Copy code
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Position Rotator</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json"> <!-- For PWA -->
</head>
<body>
    <h1>Position Rotator</h1>
    <p>Paste the list of names from WhatsApp below (newline-separated, e.g., from a group message).</p>
    <textarea id="nameInput" placeholder="Paste names here..."></textarea>
    <button id="assignBtn">Assign Positions</button>
    <div id="output"></div>
    <script src="script.js"></script>
</body>
</html>
•	styles.css (Makes it mobile-friendly):
css
Copy code
body {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f4f4;
}
textarea {
    width: 100%;
    height: 150px;
    margin-bottom: 10px;
    padding: 10px;
    font-size: 16px; /* Prevents zoom on iOS */
}
button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}
button:hover {
    background-color: #0056b3;
}
#output {
    margin-top: 20px;
    white-space: pre-wrap; /* Preserves formatting */
}
•	script.js (The logic, equivalent to the Python script):
javascript
Copy code
// Load counts from localStorage
function loadCounts() {
    const data = localStorage.getItem('positionCounts');
    return data ? JSON.parse(data) : {};
}

// Save counts to localStorage
function saveCounts(counts) {
    localStorage.setItem('positionCounts', JSON.stringify(counts));
}

// Parse names from pasted input (similar to Python version)
function parseNames(inputText) {
    const lines = inputText.split('\n');
    const names = [];
    for (const line of lines) {
        const cleaned = line.trim().replace(/^[\d\W]+\s*/, ''); // Remove numbers/emojis
        if (cleaned) names.push(cleaned);
    }
    return names;
}

// Assign positions
function assignPositions(names) {
    const counts = loadCounts();
    // Initialize missing names
    names.forEach(name => {
        if (!counts[name]) counts[name] = { first: 0, second: 0 };
    });
    // Sort by total top positions (first + second), ascending
    const sortedNames = names.sort((a, b) => (counts[a].first + counts[a].second) - (counts[b].first + counts[b].second));
    
    const positions = {};
    sortedNames.forEach((name, index) => {
        positions[index + 1] = name;
    });
    
    // Update counts
    if (sortedNames.length >= 1) counts[sortedNames[0]].first++;
    if (sortedNames.length >= 2) counts[sortedNames[1]].second++;
    
    saveCounts(counts);
    return positions;
}

// Display results
function displayResults(positions, counts) {
    let output = 'Assigned Positions:\n';
    for (const [pos, name] of Object.entries(positions)) {
        const suffix = pos == 1 ? 'st' : pos == 2 ? 'nd' : pos == 3 ? 'rd' : 'th';
        output += `${pos}${suffix}: ${name}\n`;
    }
    output += '\nCurrent Counts:\n';
    for (const [name, data] of Object.entries(counts)) {
        output += `${name}: 1st=${data.first}, 2nd=${data.second}\n`;
    }
    document.getElementById('output').textContent = output;
}

// Event listener for button
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
    document.getElementById('nameInput').value = ''; // Clear input
});
•	manifest.json (For PWA - optional, but allows "installation"):
json
Copy code
{
    "name": "Position Rotator",
    "short_name": "PosRotator",
    "start_url": "/index.html",
    "display": "standalone",
    "background_color": "#f4f4f4",
    "theme_color": "#007bff",
    "icons": []  // Add icons if you want (e.g., a PNG file)
}
3.	Run It Locally on Your Computer (Test First):
•	Open a terminal/command prompt.
•	Navigate to the folder (e.g., cd mobile-position-app).
•	Run a local server: If you have Python, use python -m http.server 8000. Or install Node.js and use npx http-server.
•	Open a browser and go to http://localhost:8000. Test by pasting names and clicking "Assign Positions".
4.	Access on Mobile:
•	Via Browser:
•	Host the files online (e.g., upload to GitHub Pages, Netlify, or a free host like Vercel). Search for "host static site free" for tutorials.
•	On your phone, open the browser (Chrome/Safari), go to the URL (e.g., https://yourusername.github.io/mobile-position-app), and use it.
•	As a PWA (Install on Home Screen):
•	Once hosted, visit the URL on your phone's browser.
•	On Android (Chrome): Tap the menu (three dots) > "Add to Home screen".
•	On iOS (Safari): Tap the share icon > "Add to Home Screen".
•	It will appear as an app icon. Tap it to open (works offline for basic use).
•	Offline Use: The PWA caches the app, so it works without internet after the first load.
5.	Testing and Usage:
•	Paste a WhatsApp list (e.g., copy from a group and paste into the textarea).
•	Click "Assign Positions" – it will show the ordered list and update counts.
•	Data persists across sessions via localStorage (clears if you clear browser data).
•	Example: Paste "Alice\nBob\nCharlie" → Output: "1st: Alice\n2nd: Bob\n3rd: Charlie" (with counts).
If you run into issues (e.g., hosting), provide your phone type (Android/iOS) for more specific tips. For a native app (e.g., via Google Play), we'd need to rewrite in Kotlin/Java, which is more complex—let me know if you prefer that!

 
How to upload it to GitHub and create shareable link to add home screen ?
Step-by-Step Process to Upload to GitHub
Step 1: Create a GitHub Account
1.	Go to github.com.
2.	Click Sign up (top right).
3.	Enter your email, password, and username.
4.	Verify your email and complete the setup.
Step 2: Create a New Repository
1.	After logging in, click the + icon (top right) → New repository.
2.	Repository name: Enter position-rotator (or any name).
3.	Description: Optional (e.g., "Position Rotator for Shaanti Mandir Satsang").
4.	Select Public (required for free hosting).
5.	Check Add a README file.
6.	Click Create repository.
Step 3: Upload Your Files
1.	On your repository page, click uploading an existing file.
2.	Drag and drop your 4 files:
•	index.html
•	styles.css
•	script.js
•	manifest.json
3.	Click Commit changes (green button).
Step 4: Enable GitHub Pages (To Access via Link)
1.	Go to your repository Settings.
2.	On the left sidebar, click Pages.
3.	Under Branch, select main (or master).
4.	Click Save.
5.	Wait 1-2 minutes. Refresh the page. You'll see a link like:
Copy code
https://yourusername.github.io/position-rotator/
6.	Open this link on your phone browser!
Step 5: Add to Home Screen (Like an App)
1.	Open the link on your phone (Chrome for Android, Safari for iOS).
2.	Android: Tap the three dots (top right) → Add to Home screen.
3.	iOS: Tap the Share button (bottom) → Add to Home Screen.
4.	It will appear as an app icon. Tap to open!
	The app will be assigning the positions to the people based on their joining and will be assigning points based on that. 
	The person who joins the 1st position will get 12 points. The person who joins 2nd position will get 10 points. 
	After from 3rd to 10th position will be getting points decreasingly, e.g., 9,8,7,6….
	The 11th position and onwards will be getting 1 point each. 

