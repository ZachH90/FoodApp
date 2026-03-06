// Run initialize on page load
window.onload = initialize;

// Utility: load CSV from project data directory
async function loadCSV(path) {
    const response = await fetch(path);
    const text = await response.text();
    return text.trim().split("\n").map(line => line.split(","));
}

// Maps and food list
let allFoods = {};
let proteinMap = {};
let allergyMap = {};

async function initialize() {
    if (window.FoodFlowState) {
        window.FoodFlowState.trimToStage("category");
    }

    try {
        const foodsCSV = await loadCSV("data/FoodItemFinal.csv");
        const proteinCSV = await loadCSV("data/ProteinID.csv");
        const allergyCSV = await loadCSV("data/AllergyID.csv");

        proteinMap = buildProteinMap(proteinCSV);
        allergyMap = buildAllergyMap(allergyCSV);
        allFoods = buildFoods(foodsCSV, proteinMap, allergyMap);

        localStorage.setItem("allFoods", JSON.stringify(allFoods));

        document.getElementById("resultsList").innerHTML =
            "<li>Your food choices will appear here</li>";

        // Wire the Anything button to pass a real null
        const anyBtn = document.getElementById("anyCategory");
        if (anyBtn) {
            anyBtn.addEventListener("click", () => handleCategorySelection(null));
        }
    } catch (err) {
        console.error("Error loading resources:", err);
    }
}

function buildProteinMap(csv) {
    const map = {};
    csv.forEach(row => {
        if (row[0]) map[row[0]] = row[1];
    });
    return map;
}

function buildAllergyMap(csv) {
    const map = {};
    csv.forEach(row => {
        if (row[0]) map[row[0]] = row[1];
    });
    return map;
}

function buildFoods(csv, proteinMap, allergyMap) {
    const foods = {};
    csv.slice(1).forEach(row => {   // skip header line
        const id = parseInt(row[0]);
        const calories = row[4] ? parseInt(row[4].trim()) : 0;
// Split proteinID column into array of integers
        const proteinIDs = row[5] ? row[5].split(";").map(x => parseInt(x.trim())) : [];

        foods[id] = {
            id,
            foodName: row[1],
            category: row[2],
            cuisine: row[3],
            calories: parseInt(row[4].trim()),
            proteinIDs,                    // ✅ array of IDs
            allergyIDs: row[6] ? row[6].split(";").map(x => parseInt(x.trim())) : []
        };

    });
    return foods;
}

// Handle category button clicks
function handleCategorySelection(category) {
    // Log exactly what you received
    console.log("Selected category (raw):", category);

    const categoryChoice = category === null ? "Anything" : category;

    if (window.FoodFlowState) {
        window.FoodFlowState.setCategory(categoryChoice);
    }

    // Compute recommendations with wildcard-safe filter
    const recommendations = filterFoods(allFoods, category);

    // Update display
    updateDisplay(recommendations);

    // Persist state
    localStorage.setItem("selectedCategory", categoryChoice);
    localStorage.setItem("recommendations", JSON.stringify(recommendations));

    // Navigate
    window.location.href = "Cuisine_Page.html";

}

// Filtering logic
function filterFoods(allFoods, category) {
    return Object.values(allFoods).filter(food =>
        category ? food.category === category : true
    );
}

// Update results list
function updateDisplay(recommendations) {
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";

    if (recommendations.length === 0) {
        resultsList.innerHTML = "<li>No foods match your selection</li>";
    } else {
        recommendations.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.foodName} (${item.category}, ${item.cuisine}, ${item.calories} kcal)`;
            li.dataset.foodName = item.foodName;
            resultsList.appendChild(li);
        });
    }

    if (window.FoodListInteractions) {
        window.FoodListInteractions.attachInteractiveList("resultsList");
    }


}