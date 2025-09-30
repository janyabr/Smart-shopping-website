function greedyOptimization(items, budget, userItem) {
    const MIN_SAVINGS_PERCENT = 0.05;
    let remainingBudget = budget;
    const selectedItems = [];

    const groups = {
        carbs: ["grains", "rice", "bread"],
        proteins: ["lentils", "eggs", "paneer", "dairy", "meat"],
        vegetables: ["vegetables", "leafy", "greens"]
    };

    const hasGroup = (item, group) =>
        groups[group].some(keyword =>
            item.category.toLowerCase().includes(keyword) ||
            item.name.toLowerCase().includes(keyword)
        );

    // Step 1: Try to add the user item first (if it fits in the budget)
    if (userItem && userItem.price <= remainingBudget) {
        selectedItems.push({
            ...userItem,
            quantity: 1,
            totalPrice: userItem.price,
            totalPreference: userItem.preference
        });
        remainingBudget -= userItem.price;
    }

    // Step 2: Ensure one item from each essential group
    const selectGroupItem = (group) => {
        const candidates = items
            .filter(item => item.essential && hasGroup(item, group))
            .sort((a, b) => a.price - b.price); // cheaper first

        for (const item of candidates) {
            const price = item.price;
            const alreadySelected = selectedItems.some(i => i.name === item.name);
            if (!alreadySelected && remainingBudget >= price) {
                selectedItems.push({
                    ...item,
                    quantity: 1,
                    totalPrice: price,
                    totalPreference: item.preference
                });
                remainingBudget -= price;
                return true;
            }
        }
        return false;
    };

    const successCarb = selectGroupItem("carbs");
    const successProtein = selectGroupItem("proteins");
    const successVeg = selectGroupItem("vegetables");

    if (!successCarb || !successProtein || !successVeg) {
        return {
            selectedItems: [],
            totalPreference: 0,
            totalCost: 0,
            efficiency: 0,
            moneySaved: budget,
            message: "Unable to guarantee all nutritional groups within budget."
        };
    }

    // Step 3: Add remaining essential items based on efficiency
    const addedItemNames = new Set(selectedItems.map(i => i.name));
    const remainingEssentials = items
        .filter(item => item.essential && !addedItemNames.has(item.name))
        .map(item => ({
            ...item,
            efficiency: item.preference / item.price
        }))
        .sort((a, b) => b.efficiency - a.efficiency);

    for (const item of remainingEssentials) {
        if (item.divisible) {
            const maxQty = Math.min(
                Math.floor(remainingBudget / item.price),
                item.monthlyNeed || 2
            );

            if (maxQty > 0 && remainingBudget >= item.price * 0.5) {
                const actualQty = Math.min(maxQty, 2);
                const totalPrice = item.price * actualQty;
                if (remainingBudget - totalPrice >= budget * MIN_SAVINGS_PERCENT) {
                    selectedItems.push({
                        ...item,
                        quantity: actualQty,
                        totalPrice,
                        totalPreference: item.preference * actualQty
                    });
                    remainingBudget -= totalPrice;
                }
            }
        } else {
            if (
                remainingBudget >= item.price &&
                remainingBudget - item.price >= budget * MIN_SAVINGS_PERCENT
            ) {
                selectedItems.push({
                    ...item,
                    quantity: 1,
                    totalPrice: item.price,
                    totalPreference: item.preference
                });
                remainingBudget -= item.price;
            }
        }
    }

    const totalCost = budget - remainingBudget;
    const totalPreference = selectedItems.reduce((sum, item) => sum + item.totalPreference, 0);

    return {
        selectedItems,
        totalPreference,
        totalCost,
        efficiency: ((totalCost / budget) * 100).toFixed(1),
        moneySaved: remainingBudget
    };
}
