// Load state passed from Category page
let allFoods = JSON.parse(localStorage.getItem("allFoods")) || {};
let recommendations = JSON.parse(localStorage.getItem("recommendations")) || [];
let selectedCategory = localStorage.getItem("selectedCategory") || null;

console.log("Sample recommendation object:", recommendations[0]);
console.log("AllFoods sample:", Object.values(allFoods)[0]);

// Initialize display
window.onload = () => {
    if (window.FoodFlowState) {
        window.FoodFlowState.trimToStage("cuisine");
        const flowState = window.FoodFlowState.getState();
        selectedCategory = flowState.category || selectedCategory;
        window.FoodFlowState.renderSelectionLabel();
    }

    updateDisplay(recommendations);
};
// Filter foods by category + cuisine
function norm(str) {
    return (str ?? "").trim().toLowerCase();
}

function filterFoods(allFoods, category, cuisine = null) {
    const cat = category === "Anything" ? null : category;   // turn "Anything" into wildcard
    const catNorm = norm(cat);
    const cuiNorm = norm(cuisine);

    return Object.values(allFoods).filter(food => {
        const foodCat = norm(food.category);
        const foodCui = norm(food.cuisine);

        const categoryMatch = (!catNorm || foodCat === catNorm);
        const cuisineMatch  = (!cuiNorm || foodCui === cuiNorm);

        return categoryMatch && cuisineMatch;
    });
}

// Handle cuisine selection
function handleCuisineSelection(cuisine) {
    console.log("Cuisine selected:", cuisine);

    const cuisineChoice = cuisine === null ? "No Preference" : cuisine;

    if (window.FoodFlowState) {
        window.FoodFlowState.setCuisine(cuisineChoice);
    }

    const filtered = filterFoods(allFoods, selectedCategory, cuisine);

    // Sort alphabetically by food name
    const sorted = filtered.sort((a, b) => a.foodName.localeCompare(b.foodName));

    updateDisplay(sorted);

    // Save state
    localStorage.setItem("cuisine", cuisineChoice);
    localStorage.setItem("recommendations", JSON.stringify(sorted));

    // Navigate to Calorie page
    window.location.href = "Calorie_Page.html";

}



// Update results list
function updateDisplay(list) {
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";

    if (!list || list.length === 0) {
        resultsList.innerHTML = "<li>No foods match your selection</li>";
    } else {
        list.forEach(item => {
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