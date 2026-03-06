let proteinFilteredList = JSON.parse(localStorage.getItem("proteinFilteredList")) || [];
let excludedAllergies = [];

const ALLERGY_ID_TO_NAME = {
    1: "Tree Nuts",
    2: "Peanuts",
    3: "Dairy",
    4: "Eggs",
    5: "Fish",
    6: "Shellfish",
    7: "Gluten",
    8: "Berries",
    9: "Soy",
    10: "Pork",
};

window.onload = () => {
    if (window.FoodFlowState) {
        window.FoodFlowState.trimToStage("allergies");

        const savedAllergies = window.FoodFlowState.getState().allergies || [];
        excludedAllergies = savedAllergies
            .map((allergy) => Number.isInteger(allergy.id) ? allergy.id : getAllergyIdByName(allergy.name))
            .filter((id) => Number.isInteger(id));

        syncAllergyButtons(excludedAllergies);
        syncAllergySummary();
    }

    const filtered = filterByAllergy(proteinFilteredList, excludedAllergies);
    updateListView(filtered);
    localStorage.setItem("allergyFilteredList", JSON.stringify(filtered));
};

function getAllergyIdByName(name) {
    const match = Object.entries(ALLERGY_ID_TO_NAME).find((entry) => entry[1] === name);
    return match ? parseInt(match[0], 10) : null;
}

function syncAllergyButtons(selectedIds) {
    const selectedSet = new Set(selectedIds);
    const buttons = document.querySelectorAll(".allergy-grid .button");

    buttons.forEach((button) => {
        const buttonName = button.textContent.trim();
        const buttonId = getAllergyIdByName(buttonName);
        button.classList.toggle("selected", selectedSet.has(buttonId));
    });
}

function syncAllergySummary() {
    if (!window.FoodFlowState) return;

    const allergySelections = excludedAllergies
        .map((id) => ({ id, name: ALLERGY_ID_TO_NAME[id] }))
        .filter((allergy) => allergy.name);

    window.FoodFlowState.setAllergies(allergySelections);
    window.FoodFlowState.renderSelectionLabel();
}

function handleAllergyToggle(allergyID, allergyName, button) {
    if (excludedAllergies.includes(allergyID)) {
        excludedAllergies = excludedAllergies.filter(id => id !== allergyID);
        button.classList.remove("selected");
    } else {
        excludedAllergies.push(allergyID);
        button.classList.add("selected");
    }

    const filtered = filterByAllergy(proteinFilteredList, excludedAllergies);
    updateListView(filtered);

    localStorage.setItem("allergyFilteredList", JSON.stringify(filtered));
    syncAllergySummary();
}

function filterByAllergy(inputList, excludedAllergies) {
    return inputList.filter(food => {
        const foodAids = food.allergyIDs;
        return !foodAids || excludedAllergies.every(id => !foodAids.includes(id));
    });
}

function updateListView(items) {
    const list = document.getElementById("allergyResultsList");
    list.innerHTML = "";

    if (!items || items.length === 0) {
        list.innerHTML = "<li>No foods match your selection</li>";
    } else {
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.foodName} (${item.category}, ${item.cuisine}, ${item.calories} cal)`;
            li.dataset.foodName = item.foodName;
            list.appendChild(li);
        });
    }

    if (window.FoodListInteractions) {
        window.FoodListInteractions.attachInteractiveList("allergyResultsList");
    }
}

function handleFinish() {
    const finalFilteredList = filterByAllergy(proteinFilteredList, excludedAllergies);
    localStorage.setItem("finalResults", JSON.stringify(finalFilteredList));
    window.location.href = "Final_Page.html";

}