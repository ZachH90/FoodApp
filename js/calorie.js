// Load state passed from Cuisine page
let cuisineFilteredList = JSON.parse(localStorage.getItem("recommendations")) || [];

// Initialize display
window.addEventListener("load", () => {
    if (window.FoodFlowState) {
        window.FoodFlowState.trimToStage("calories");
        window.FoodFlowState.renderSelectionLabel();
    }

    updateListView(cuisineFilteredList);
});

function handleCalorieSelection(label) {
    console.log("Calorie selection:", label);

    let filtered;
    if (label === "<=400 kcal") {
        filtered = cuisineFilteredList.filter(item => item.calories <= 400);
    } else if (label === "400+ kcal") {
        filtered = cuisineFilteredList.filter(item => item.calories > 400);
    } else {
        filtered = cuisineFilteredList;
    }

    if (window.FoodFlowState) {
        window.FoodFlowState.setCalories(label);
    }

    // Update results list
    updateListView(filtered);

    // Pass filtered list forward
    localStorage.setItem("calorieFilteredList", JSON.stringify(filtered));

    // Navigate to Protein page
    window.location.href = "Protein_Page.html";

}

function updateListView(items) {
    const list = document.getElementById("calorieResultsList");
    list.innerHTML = "";

    if (!items || items.length === 0) {
        list.innerHTML = "<li>No foods match your selection</li>";
    } else {
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.foodName} (${item.category}, ${item.cuisine}, ${item.calories} kcal)`;
            li.dataset.foodName = item.foodName;
            list.appendChild(li);
        });
    }

    if (window.FoodListInteractions) {
        window.FoodListInteractions.attachInteractiveList("calorieResultsList");
    }


}