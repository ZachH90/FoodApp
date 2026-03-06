(function () {
    const STORAGE_KEY = "foodFlowState";
    const DEFAULT_STATE = {
        category: null,
        cuisine: null,
        calories: null,
        protein: null,
        allergies: [],
    };

    const STAGE_ORDER = {
        category: 0,
        cuisine: 1,
        calories: 2,
        protein: 3,
        allergies: 4,
        final: 5,
    };

    function safeParse(jsonValue, fallbackValue) {
        try {
            return JSON.parse(jsonValue);
        } catch (_err) {
            return fallbackValue;
        }
    }

    function normalizeAllergyEntry(entry) {
        if (!entry) return null;

        if (typeof entry === "string") {
            const name = entry.trim();
            return name ? { id: null, name } : null;
        }

        if (typeof entry === "object") {
            const id = Number.isInteger(entry.id) ? entry.id : null;
            const name = typeof entry.name === "string" ? entry.name.trim() : "";
            return name ? { id, name } : null;
        }

        return null;
    }

    function normalizeState(rawState) {
        const state = {
            category: typeof rawState?.category === "string" ? rawState.category : null,
            cuisine: typeof rawState?.cuisine === "string" ? rawState.cuisine : null,
            calories: typeof rawState?.calories === "string" ? rawState.calories : null,
            protein: typeof rawState?.protein === "string" ? rawState.protein : null,
            allergies: Array.isArray(rawState?.allergies)
                ? rawState.allergies.map(normalizeAllergyEntry).filter(Boolean)
                : [],
        };

        return state;
    }

    function buildStateFromLegacy() {
        const state = { ...DEFAULT_STATE };

        const selectedCategory = localStorage.getItem("selectedCategory");
        if (selectedCategory) {
            state.category = selectedCategory;
        }

        const selectedCuisine = localStorage.getItem("cuisine");
        if (selectedCuisine && selectedCuisine !== "null") {
            state.cuisine = selectedCuisine;
        }

        const legacySelections = safeParse(localStorage.getItem("selections"), []);
        if (!Array.isArray(legacySelections)) {
            return state;
        }

        legacySelections.forEach((entry) => {
            if (typeof entry !== "string") return;
            const text = entry.trim();

            if (text.startsWith("Category:")) {
                state.category = text.replace("Category:", "").trim() || state.category;
            } else if (text.startsWith("Cuisine:")) {
                state.cuisine = text.replace("Cuisine:", "").trim() || state.cuisine;
            } else if (text.startsWith("Calories:")) {
                state.calories = text.replace("Calories:", "").trim() || state.calories;
            } else if (text.startsWith("Protein:")) {
                state.protein = text.replace("Protein:", "").trim() || state.protein;
            } else if (text.startsWith("Allergies:")) {
                const allergyNames = text
                    .replace("Allergies:", "")
                    .split(",")
                    .map((name) => name.trim())
                    .filter(Boolean);

                state.allergies = allergyNames.map((name) => ({ id: null, name }));
            }
        });

        return state;
    }

    function loadState() {
        const savedState = safeParse(localStorage.getItem(STORAGE_KEY), null);

        if (!savedState) {
            const legacyState = normalizeState(buildStateFromLegacy());
            saveState(legacyState);
            return legacyState;
        }

        return normalizeState(savedState);
    }

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
    }

    function clearDownstreamState(state, stage) {
        const currentStage = STAGE_ORDER[stage];
        if (typeof currentStage !== "number") return state;

        if (currentStage < STAGE_ORDER.cuisine) state.cuisine = null;
        if (currentStage < STAGE_ORDER.calories) state.calories = null;
        if (currentStage < STAGE_ORDER.protein) state.protein = null;
        if (currentStage < STAGE_ORDER.allergies) state.allergies = [];

        return state;
    }

    function clearDownstreamStorage(stage) {
        const currentStage = STAGE_ORDER[stage];
        if (typeof currentStage !== "number") return;

        if (currentStage < STAGE_ORDER.cuisine) {
            localStorage.removeItem("cuisine");
            localStorage.removeItem("recommendations");
        }

        if (currentStage < STAGE_ORDER.calories) {
            localStorage.removeItem("calorieFilteredList");
        }

        if (currentStage < STAGE_ORDER.protein) {
            localStorage.removeItem("proteinFilteredList");
        }

        if (currentStage < STAGE_ORDER.allergies) {
            localStorage.removeItem("allergyFilteredList");
        }

        if (currentStage < STAGE_ORDER.final) {
            localStorage.removeItem("finalResults");
        }
    }

    function toLegacySelectionArray(state) {
        const selections = [];

        if (state.category) selections.push(`Category: ${state.category}`);
        if (state.cuisine) selections.push(`Cuisine: ${state.cuisine}`);
        if (state.calories) selections.push(`Calories: ${state.calories}`);
        if (state.protein) selections.push(`Protein: ${state.protein}`);

        if (state.allergies.length > 0) {
            const names = state.allergies.map((allergy) => allergy.name);
            selections.push(`Allergies: ${names.join(", ")}`);
        }

        return selections;
    }

    function syncLegacyKeys(state) {
        localStorage.setItem("selections", JSON.stringify(toLegacySelectionArray(state)));

        if (state.category) {
            localStorage.setItem("selectedCategory", state.category);
        } else {
            localStorage.removeItem("selectedCategory");
        }

        if (state.cuisine) {
            localStorage.setItem("cuisine", state.cuisine);
        } else {
            localStorage.removeItem("cuisine");
        }
    }

    function saveAndSync(state) {
        const normalizedState = normalizeState(state);
        saveState(normalizedState);
        syncLegacyKeys(normalizedState);
    }

    function getSummaryText() {
        return toLegacySelectionArray(loadState()).join(" | ");
    }

    function renderSelectionLabel(elementId = "selectionLabel", fallbackText = "Selections will appear here") {
        const label = document.getElementById(elementId);
        if (!label) return;

        label.textContent = getSummaryText() || fallbackText;
    }

    function setCategory(category) {
        const state = loadState();
        state.category = category;
        clearDownstreamState(state, "category");
        saveAndSync(state);
        clearDownstreamStorage("category");
    }

    function setCuisine(cuisine) {
        const state = loadState();
        state.cuisine = cuisine;
        clearDownstreamState(state, "cuisine");
        saveAndSync(state);
        clearDownstreamStorage("cuisine");
    }

    function setCalories(calories) {
        const state = loadState();
        state.calories = calories;
        clearDownstreamState(state, "calories");
        saveAndSync(state);
        clearDownstreamStorage("calories");
    }

    function setProtein(protein) {
        const state = loadState();
        state.protein = protein;
        clearDownstreamState(state, "protein");
        saveAndSync(state);
        clearDownstreamStorage("protein");
    }

    function setAllergies(allergies) {
        const state = loadState();
        state.allergies = Array.isArray(allergies)
            ? allergies.map(normalizeAllergyEntry).filter(Boolean)
            : [];
        saveAndSync(state);
    }

    function trimToStage(stage) {
        const state = loadState();
        clearDownstreamState(state, stage);
        saveAndSync(state);
        clearDownstreamStorage(stage);
    }

    function resetFlow() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("selections");
        localStorage.removeItem("selectedCategory");
        localStorage.removeItem("cuisine");
        localStorage.removeItem("recommendations");
        localStorage.removeItem("calorieFilteredList");
        localStorage.removeItem("proteinFilteredList");
        localStorage.removeItem("allergyFilteredList");
        localStorage.removeItem("finalResults");
    }

    function getState() {
        return loadState();
    }

    window.FoodFlowState = {
        getState,
        trimToStage,
        renderSelectionLabel,
        setCategory,
        setCuisine,
        setCalories,
        setProtein,
        setAllergies,
        resetFlow,
        getSummaryText,
    };
})();
