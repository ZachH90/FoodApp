// Load state passed from Calorie page
let calorieFilteredList = JSON.parse(localStorage.getItem("calorieFilteredList")) || [];

// Initialize display
window.onload = () => {
    if (window.FoodFlowState) {
        window.FoodFlowState.trimToStage("protein");
        window.FoodFlowState.renderSelectionLabel();
    }

    updateListView(calorieFilteredList);
};

function handleProteinSelection(proteinID, proteinChoice) {
    console.log("Protein selected:", proteinChoice);

    let filteredList;
    if (proteinID === -1) {
        filteredList = calorieFilteredList; // No Preference
    } else if (proteinID === 9) {
        // Only dishes that have *exactly* the vegetable ID
        filteredList = calorieFilteredList.filter(food =>
            food.proteinIDs && food.proteinIDs.length === 1 && food.proteinIDs.includes(9)
        );
    } else {
        // Normal case: include dishes that contain this protein
        filteredList = calorieFilteredList.filter(food =>
            food.proteinIDs && food.proteinIDs.includes(proteinID)
        );
    }

    if (window.FoodFlowState) {
        window.FoodFlowState.setProtein(proteinChoice);
    }

    // Update results list
    updateListView(filteredList);

    // Pass filtered list forward
    localStorage.setItem("proteinFilteredList", JSON.stringify(filteredList));

    // Navigate to Allergy page
    window.location.href = "Allergy_Page.html";
}

function updateListView(items) {
    const list = document.getElementById("proteinResultsList");
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
        window.FoodListInteractions.attachInteractiveList("proteinResultsList");
    }


}