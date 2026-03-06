let finalResults = JSON.parse(localStorage.getItem("finalResults")) || [];
let selectedIndex = null;

function selectItem(index, li) {
    const list = document.getElementById("finalResultsList");
    // clear previous selection
    list.querySelectorAll("li").forEach(el => el.classList.remove("selected"));
    // mark new selection
    li.classList.add("selected");
    selectedIndex = index;
}


window.onload = () => {
    if (window.FoodFlowState) {
        window.FoodFlowState.trimToStage("final");
    }

    updateListView(finalResults);

    if (window.FoodFlowState) {
        window.FoodFlowState.renderSelectionLabel();
    }
};

function updateListView(items) {
    const list = document.getElementById("finalResultsList");
    list.innerHTML = "";

    if (!items || items.length === 0) {
        list.innerHTML = "<li>No foods match your selection</li>";
    } else {
        items.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = `${item.foodName} (${item.category}, ${item.cuisine}, ${item.calories} cal)`;

            // make selectable
            li.addEventListener("click", () => selectItem(index, li));

            list.appendChild(li);
        });
    }
}


function handleRecipeSearch() {
    if (selectedIndex !== null) {
        const food = finalResults[selectedIndex];
        const query = encodeURIComponent(food.foodName + " recipe");
        window.open("https://www.google.com/search?q=" + query, "_blank");
    } else {
        alert("Please select a food item first.");
    }
}

function handleFindNearMe() {
    if (selectedIndex !== null) {
        const food = finalResults[selectedIndex];
        const query = encodeURIComponent(food.foodName + " near me");
        window.open("https://www.google.com/search?q=" + query, "_blank");
    } else {
        alert("Please select a food item first.");
    }
}


function handleBack() {
    if (window.FoodFlowState) {
        window.FoodFlowState.resetFlow();
    }

    window.location.href = "category.html";
}

// Helper: get selected food from list
function getSelectedFood() {
    const list = document.getElementById("finalResultsList");
    const selectedLi = list.querySelector("li.selected");
    if (!selectedLi) {
        alert("Please select a food item first.");
        return null;
    }
    // You may want to store the index or ID in data attributes
    const index = Array.from(list.children).indexOf(selectedLi);
    return finalResults[index];
}

// Allow clicking list items to select
document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("finalResultsList");
    list.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            list.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
            e.target.classList.add("selected");
        }
    });
});