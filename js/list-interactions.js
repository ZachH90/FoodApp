(function () {
    let quickMenu = null;
    let activeFoodName = "";
    const LONG_PRESS_DELAY_MS = 450;
    const TOUCH_MOVE_CANCEL_PX = 12;
    let longPressTimerId = null;
    let longPressTouchPoint = null;
    let suppressClickUntil = 0;

    function clearLongPressTimer() {
        if (longPressTimerId !== null) {
            window.clearTimeout(longPressTimerId);
            longPressTimerId = null;
        }
    }

    function cancelLongPressTracking() {
        clearLongPressTimer();
        longPressTouchPoint = null;
    }

    function ensureQuickMenu() {
        if (quickMenu) return quickMenu;

        quickMenu = document.createElement("div");
        quickMenu.className = "quick-action-menu";
        quickMenu.innerHTML = `
            <button type="button" data-action="recipe">Recipe</button>
            <button type="button" data-action="near">Near Me</button>
        `;

        quickMenu.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-action]");
            if (!button || !activeFoodName) return;

            const action = button.dataset.action;
            const searchSuffix = action === "recipe" ? "recipe" : "near me";
            const query = encodeURIComponent(`${activeFoodName} ${searchSuffix}`);
            window.open(`https://www.google.com/search?q=${query}`, "_blank");
            hideQuickMenu();
        });

        document.body.appendChild(quickMenu);
        return quickMenu;
    }

    function hideQuickMenu() {
        if (!quickMenu) return;
        quickMenu.classList.remove("open");
    }

    function selectListItem(list, listItem) {
        list.querySelectorAll("li").forEach((li) => li.classList.remove("selected"));
        listItem.classList.add("selected");
    }

    function showQuickMenu(clientX, clientY) {
        const menu = ensureQuickMenu();
        menu.classList.add("open");

        const margin = 8;
        const rect = menu.getBoundingClientRect();

        let x = clientX + 6;
        let y = clientY + 6;

        if (x + rect.width > window.innerWidth - margin) {
            x = window.innerWidth - rect.width - margin;
        }
        if (y + rect.height > window.innerHeight - margin) {
            y = window.innerHeight - rect.height - margin;
        }

        menu.style.left = `${Math.max(margin, x)}px`;
        menu.style.top = `${Math.max(margin, y)}px`;
    }

    function getFoodListItem(list, eventTarget) {
        const listItem = eventTarget.closest("li");
        if (!listItem || !list.contains(listItem)) return null;
        if (!listItem.dataset.foodName) return null;
        return listItem;
    }

    function attachInteractiveList(listId) {
        const list = document.getElementById(listId);
        if (!list || list.dataset.quickActionsBound === "true") return;

        list.dataset.quickActionsBound = "true";
        list.classList.add("interactive-list");

        list.addEventListener("click", (event) => {
            if (Date.now() < suppressClickUntil) {
                event.preventDefault();
                return;
            }

            const listItem = getFoodListItem(list, event.target);
            if (!listItem) return;

            activeFoodName = listItem.dataset.foodName;
            selectListItem(list, listItem);
            hideQuickMenu();
        });

        list.addEventListener("dblclick", (event) => {
            const listItem = getFoodListItem(list, event.target);
            if (!listItem) return;

            activeFoodName = listItem.dataset.foodName;
            selectListItem(list, listItem);
            showQuickMenu(event.clientX, event.clientY);
            event.preventDefault();
        });

        list.addEventListener("touchstart", (event) => {
            const listItem = getFoodListItem(list, event.target);
            if (!listItem || event.touches.length !== 1) {
                cancelLongPressTracking();
                return;
            }

            const touch = event.touches[0];
            longPressTouchPoint = {
                x: touch.clientX,
                y: touch.clientY,
                list,
                listItem,
            };

            clearLongPressTimer();
            longPressTimerId = window.setTimeout(() => {
                if (!longPressTouchPoint) return;

                activeFoodName = longPressTouchPoint.listItem.dataset.foodName;
                selectListItem(longPressTouchPoint.list, longPressTouchPoint.listItem);
                showQuickMenu(longPressTouchPoint.x, longPressTouchPoint.y);
                suppressClickUntil = Date.now() + 650;
                cancelLongPressTracking();
            }, LONG_PRESS_DELAY_MS);
        }, { passive: true });

        list.addEventListener("touchmove", (event) => {
            if (!longPressTouchPoint || event.touches.length !== 1) return;

            const touch = event.touches[0];
            const movedX = Math.abs(touch.clientX - longPressTouchPoint.x);
            const movedY = Math.abs(touch.clientY - longPressTouchPoint.y);

            if (movedX > TOUCH_MOVE_CANCEL_PX || movedY > TOUCH_MOVE_CANCEL_PX) {
                cancelLongPressTracking();
            }
        }, { passive: true });

        list.addEventListener("touchend", (event) => {
            if (Date.now() < suppressClickUntil) {
                event.preventDefault();
            }
            cancelLongPressTracking();
        }, { passive: false });

        list.addEventListener("touchcancel", () => {
            cancelLongPressTracking();
        });
    }

    document.addEventListener("click", (event) => {
        if (!quickMenu || !quickMenu.classList.contains("open")) return;
        if (quickMenu.contains(event.target)) return;
        hideQuickMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideQuickMenu();
        }
    });

    window.FoodListInteractions = {
        attachInteractiveList,
    };
})();
