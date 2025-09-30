let currentBudget = 0;
let selectedProducts = [];
let currentFilter = 'all';
let nextProductId = 26; 

document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateBudgetDisplay();
});

function displayProducts() {
    const grid = document.getElementById('productsGrid');
    const filteredProducts = getFilteredProducts();
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="toggleProduct(${product.id})" id="product-${product.id}">
            <div class="product-name">${product.name}</div>
            <div class="product-details">
                ${product.onSale ? 
                    `<div>
                        <span class="product-price original">₹${product.originalPrice}</span>
                        <span class="product-price sale">₹${product.price}</span>
                    </div>` : 
                    `<span class="product-price">₹${product.price}</span>`
                }
                <span class="product-preference">Score: ${product.preference}</span>
                <span>Unit: ${product.unit}</span>
                <span>Deadline: ${product.deadline}d</span>
            </div>
            <div class="product-tags">
                ${product.perishable ? '<span class="tag perishable">Perishable</span>' : ''}
                ${product.divisible ? '<span class="tag divisible">Divisible</span>' : ''}
                ${product.onSale ? '<span class="tag sale">On Sale</span>' : ''}
                ${product.essential ? '<span class="tag essential">Essential</span>' : ''}
                <span class="tag">${product.category}</span>
            </div>
        </div>
    `).join('');
}


function getFilteredProducts() {
    switch(currentFilter) {
        case 'perishable':
            return products.filter(p => p.perishable);
        case 'divisible':
            return products.filter(p => p.divisible);
        case 'sale':
            return products.filter(p => p.onSale);
        case 'essential':
            return products.filter(p => p.essential);
        default:
            return products;
    }
}

function filterProducts(type) {
    currentFilter = type;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    displayProducts();
}

function toggleProduct(productId) {
    const productCard = document.getElementById(`product-${productId}`);
    const product = products.find(p => p.id === productId);
    
    if (selectedProducts.includes(productId)) {
        selectedProducts = selectedProducts.filter(id => id !== productId);
        productCard.classList.remove('selected');
    } else {
        selectedProducts.push(productId);
        productCard.classList.add('selected');
    }
}

function addCustomItem() {
    const name = document.getElementById('itemName').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const preference = parseInt(document.getElementById('itemPreference').value);
    const category = document.getElementById('itemCategory').value;
    const perishable = document.getElementById('itemPerishable').checked;
    const divisible = document.getElementById('itemDivisible').checked;
    const essential = document.getElementById('itemEssential').checked;
    const onSale = document.getElementById('itemOnSale').checked;
    const salePrice = parseFloat(document.getElementById('itemSalePrice').value);
    
    if (!name || !price || !preference) {
        alert('Please fill in all required fields (Name, Price, Preference)');
        return;
    }
    
    if (preference < 1 || preference > 100) {
        alert('Preference score must be between 1 and 100');
        return;
    }
    
    if (onSale && (!salePrice || salePrice >= price)) {
        alert('Sale price must be less than original price');
        return;
    }
    
    const newProduct = {
        id: nextProductId++,
        name: name,
        price: onSale ? salePrice : price,
        originalPrice: price,
        onSale: onSale,
        preference: preference,
        category: category,
        perishable: perishable,
        divisible: divisible,
        unit: divisible ? "kg" : "packet",
        deadline: perishable ? 7 : 30,
        essential: essential,
        monthlyNeed: essential ? 2 : 1
    };
    
    products.push(newProduct);
    
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemPreference').value = '';
    document.getElementById('itemCategory').value = 'custom';
    document.getElementById('itemPerishable').checked = false;
    document.getElementById('itemDivisible').checked = false;
    document.getElementById('itemEssential').checked = false;
    document.getElementById('itemOnSale').checked = false;
    document.getElementById('itemSalePrice').value = '';
    document.getElementById('itemSalePrice').style.display = 'none';
    
    displayProducts();
    
    alert(`${name} has been added successfully!`);
}

document.getElementById('itemOnSale').addEventListener('change', function() {
    const salePriceInput = document.getElementById('itemSalePrice');
    if (this.checked) {
        salePriceInput.style.display = 'block';
        salePriceInput.required = true;
    } else {
        salePriceInput.style.display = 'none';
        salePriceInput.required = false;
        salePriceInput.value = '';
    }
});

function optimizeShopping() {
    const budgetInput = document.getElementById('budget');
    const budgetValue = budgetInput.value.trim();
    
    if (!budgetValue || isNaN(budgetValue) || parseFloat(budgetValue) <= 0) {
        alert('Please enter a valid budget amount greater than 0');
        budgetInput.focus();
        return;
    }
    
    currentBudget = parseFloat(budgetValue);
    
    if (currentBudget > 100000) {
        alert('Budget seems too high. Please enter a reasonable amount.');
        budgetInput.focus();
        return;
    }
    
    updateBudgetDisplay();
    
    const greedyResult = greedyOptimization(products, currentBudget);
    
    displayFinalRecommendation(greedyResult);
}

function displayFinalRecommendation(result) {
    const recommendationDiv = document.getElementById('finalRecommendation');
    
    if (result.selectedItems.length > 0) {
        
        const essentialItems = result.selectedItems.filter(item => item.essential);
        const nonEssentialItems = result.selectedItems.filter(item => !item.essential);
        
        let displayHTML = '';
        
        if (essentialItems.length > 0) {
            displayHTML += '<h4 style="color: #16a34a; margin-bottom: 10px;">✓ Essential Monthly Groceries</h4>';
            displayHTML += essentialItems.map(item => 
                `<div class="result-item essential">
                    ${item.name} x${item.quantity} ${item.unit} - ₹${item.totalPrice} 
                    <span style="color: #16a34a;">(Essential)</span>
                </div>`
            ).join('');
        }
        
        if (nonEssentialItems.length > 0) {
            displayHTML += '<h4 style="color: #2563eb; margin-top: 15px; margin-bottom: 10px;">+ Additional Items</h4>';
            displayHTML += nonEssentialItems.map(item => 
                `<div class="result-item optional">
                    ${item.name} x${item.quantity} ${item.unit} - ₹${item.totalPrice}
                    <span style="color: #64748b;">(Optional)</span>
                </div>`
            ).join('');
        }
        
        recommendationDiv.innerHTML = result.selectedItems.map(item => 
            `<div class="result-item ${item.essential ? 'essential' : 'optional'}">
                ${item.name} x${item.quantity} ${item.unit} - ₹${item.totalPrice} 
                ${item.essential ? '<span style="color: #16a34a;">(Essential)</span>' : '<span style="color: #64748b;">(Optional)</span>'}
            </div>`
        ).join('');
        
        document.getElementById('totalScore').textContent = result.totalPreference.toFixed(1);
        document.getElementById('efficiency').textContent = result.efficiency + '%';
        
    
        document.getElementById('usedBudget').textContent = result.totalCost;
        document.getElementById('remainingBudget').textContent = currentBudget - result.totalCost;
        
        const usedPercentage = ((result.totalCost / currentBudget) * 100).toFixed(1);
        const remainingPercentage = (100 - usedPercentage).toFixed(1);
        document.getElementById('usedPercentage').textContent = usedPercentage;
        document.getElementById('remainingPercentage').textContent = remainingPercentage;
    } else {
        recommendationDiv.innerHTML = '<div class="result-item">Budget too low for essential monthly groceries. Please increase your budget.</div>';
        document.getElementById('totalScore').textContent = '0';
        document.getElementById('efficiency').textContent = '0%';
        
        
        document.getElementById('usedPercentage').textContent = '0';
        document.getElementById('remainingPercentage').textContent = '100';
    }
}

function updateBudgetDisplay() {
    document.getElementById('totalBudget').textContent = currentBudget.toFixed(0);
    document.getElementById('usedBudget').textContent = '0';
    document.getElementById('remainingBudget').textContent = currentBudget.toFixed(0);
    document.getElementById('usedPercentage').textContent = '0';
    document.getElementById('remainingPercentage').textContent = '100';
}

document.getElementById('budget').addEventListener('input', function() {
    const value = this.value.trim();
    if (value && !isNaN(value) && parseFloat(value) >= 0) {
        currentBudget = parseFloat(value);
        updateBudgetDisplay();
    }
});
document.getElementById('budget').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        optimizeShopping();
    }
});