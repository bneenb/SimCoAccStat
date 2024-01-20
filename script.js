let globalCsvData = null; // Global variable to store the CSV data

function handleFileSelect(evt) {
    const file = evt.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            globalCsvData = results.data; // Store CSV data globally
            showProfitParser(); // Default to showing 'Profit' parser
        }
    });
}

function showProfitParser() {
    if (globalCsvData) {
        // Call the function that handles the 'Profit' parser
        displayResults(processData(globalCsvData));
    } else {
        alert("Please upload a CSV file first.");
    }
}

function showPriceParser() {
    if (globalCsvData) {
        // Call the function that handles the 'Supplier' parser
        displaySupplierResults(processSupplierData(globalCsvData));
    } else {
        alert("Please upload a CSV file first.");
    }
}

function showTBDParser2() {
    console.log("TBD Parser 2 functionality goes here.");
}

function showTBDParser3() {
    console.log("TBD Parser 3 functionality goes here.");
}

function showTBDParser4() {
    console.log("TBD Parser 4 functionality goes here.");
}

/* function handleFileSelect(evt) {
    const file = evt.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            displayResults(processData(results.data));
        }
    } );
}*/

function processData(data) {
    let profitsByCategoryAndDate = {};
    let currentDate = new Date();
    let dates = [];
    let sums = {}; // Initialize sums for each date

    // Generate dates for the last 7 days in reverse order
    for (let i = 0; i <= 6; i++) {
        let date = new Date();
        date.setDate(currentDate.getDate() - i);
        let dateString = date.toISOString().split('T')[0];
        dates.push(dateString); // YYYY-MM-DD format
        sums[dateString] = 0; // Initialize sums for each date
    }

    dates.forEach(date => {
        data.forEach(row => {
            try {
                let rowDate = new Date(row['Timestamp']).toISOString().split('T')[0];

                if (rowDate === date) {
                    let description = row['Description'];
                    let category = extractCategory(description);
                    let details = JSON.parse(row['Details']);
                    let profitString = details && details.profit ? String(details.profit) : "$0";
                    let profit = parseFloat(profitString.replace(/[^0-9.-]+/g, ""));

                    // Check for both 'amount' and 'quantity' and use whichever is available
                    let quantity = details && (details.amount || details.quantity) ? details.amount || details.quantity : 0;

                    if (!profitsByCategoryAndDate[category]) {
                        profitsByCategoryAndDate[category] = {};
                    }
                    if (!profitsByCategoryAndDate[category][date]) {
                        profitsByCategoryAndDate[category][date] = { totalProfit: 0, totalQuantity: 0 };
                    }
                    profitsByCategoryAndDate[category][date].totalProfit += profit;
                    profitsByCategoryAndDate[category][date].totalQuantity += quantity;

                    sums[date] += profit; // Accumulate total profit in sums
                }
            } catch (e) {
                console.error(`Error parsing data for row:`, row, `Error:`, e);
            }
        });
    });

    // Calculate average profit per piece for each category and date
    for (let category in profitsByCategoryAndDate) {
        for (let date in profitsByCategoryAndDate[category]) {
            let data = profitsByCategoryAndDate[category][date];
            data.profitPerPiece = data.totalQuantity > 0 ? data.totalProfit / data.totalQuantity : 0;
        }
    }

    return { profitsByCategoryAndDate, dates, sums };
}


// Function to extract the category from the description
function extractCategory(description) {
    if (description.includes('contract')) {
        return description.split(' contract')[0];
    } else if (description.includes('market')) {
        return description.split(' market')[0];
    } else if (description.includes('Sales order fulfilled')) {
        return 'Sales Orders';
    }
    return 'Other'; // Default category if no match
}

function displayResults(resultData) {
    let tableHeader = document.querySelector('#profitTable thead');
    let tableBody = document.querySelector('#profitTable tbody');

    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    let { profitsByCategoryAndDate, dates, sums } = resultData;

    // Create and add the header row
    let headerRow = '<tr><th>Profit from</th>';
    dates.forEach(date => {
        headerRow += `<th>${date}</th>`;
    });
    headerRow += '</tr>';
    tableHeader.innerHTML = headerRow;

    // Process data rows
    Object.keys(profitsByCategoryAndDate).forEach(category => {
        let row = `<tr><td>${category}</td>`;
        let totalCategoryProfit = 0; // Track total profit for the category across all dates

        dates.forEach(date => {
            let profitData = profitsByCategoryAndDate[category][date];
            let totalProfit = profitData ? profitData.totalProfit : 0;
            totalCategoryProfit += totalProfit; // Accumulate total profit for the category

            let formattedProfit = totalProfit.toLocaleString();
            let profitPerPieceFormatted = profitData ? profitData.profitPerPiece.toLocaleString() : "0";
            let className = totalProfit >= 0 ? 'positive' : 'negative';

            row += `<td class="${className}">$${formattedProfit}<br><span style='font-size: smaller;'>$${profitPerPieceFormatted} per piece</span></td>`;
        });

        // Only add the row if the total category profit is not zero
        if (totalCategoryProfit !== 0) {
            tableBody.innerHTML += row + `</tr>`;
        }
    });

    // Add the 'Sum' row
    let sumRow = `<tr class="sum-row"><td>Sum</td>`;
    dates.forEach(date => {
        let sum = sums[date] || 0; // Default to 0 if undefined
        let className = sum >= 0 ? 'positive' : 'negative';
        sumRow += `<td class="${className}">$${sum.toLocaleString()}</td>`;
    });
    sumRow += `</tr>`;
    tableBody.innerHTML += sumRow;
}

function processSupplierData(data) {
    let priceByCategoryAndDate = {};
    let currentDate = new Date();
    let dates = [];
    let sums = {}; // Initialize sums for each date

    // Generate dates for the last 7 days in reverse order
    for (let i = 0; i <= 6; i++) {
        let date = new Date();
        date.setDate(currentDate.getDate() - i);
        let dateString = date.toISOString().split('T')[0];
        dates.push(dateString); // YYYY-MM-DD format
        sums[dateString] = 0; // Initialize sums for each date
    }

    dates.forEach(date => {
        data.forEach(row => {
            try {
                let rowDate = new Date(row['Timestamp']).toISOString().split('T')[0];

                if (rowDate === date) {
                    let description = row['Description'];
                    let category = extractCategory(description);
                    let details = JSON.parse(row['Details']);
                    let priceString = details && details.price ? String(details.price) : "$0";
                    let price = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));

                    // Check for both 'amount' and 'quantity' and use whichever is available
                    let quantity = details && (details.amount || details.quantity) ? details.amount || details.quantity : 0;
                    if(details.profit == null){
                        if (!priceByCategoryAndDate[category]) {
                            priceByCategoryAndDate[category] = {};
                        }
                        if (!priceByCategoryAndDate[category][date]) {
                            priceByCategoryAndDate[category][date] = { totalPrice: 0, totalQuantity: 0 };
                        }
                        priceByCategoryAndDate[category][date].totalPrice += price* quantity;
                        priceByCategoryAndDate[category][date].totalQuantity += quantity;
    
                        sums[date] += price; // Accumulate total price in sums
                    }
                    
                }
            } catch (e) {
                console.error(`Error parsing data for row:`, row, `Error:`, e);
            }
        });
    });

    // Calculate average price per piece for each category and date
    for (let category in priceByCategoryAndDate) {
        for (let date in priceByCategoryAndDate[category]) {
            let data = priceByCategoryAndDate[category][date];
            data.pricePerPiece = data.totalQuantity > 0 ? data.totalPrice / data.totalQuantity : 0;
        }
    }

    return { priceByCategoryAndDate, dates, sums };
}

function displaySupplierResults(resultData) {
    let tableHeader = document.querySelector('#profitTable thead');
    let tableBody = document.querySelector('#profitTable tbody');

    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    let { priceByCategoryAndDate, dates, sums } = resultData;

    // Create and add the header row
    let headerRow = '<tr><th>Price from</th>';
    dates.forEach(date => {
        headerRow += `<th>${date}</th>`;
    });
    headerRow += '</tr>';
    tableHeader.innerHTML = headerRow;

    // Process data rows
    Object.keys(priceByCategoryAndDate).forEach(category => {
        let row = `<tr><td>${category}</td>`;
        let totalCategoryPrice = 0; // Track total price for the category across all dates

        dates.forEach(date => {
            let priceData = priceByCategoryAndDate[category][date];
            let totalPrice = priceData ? priceData.totalPrice : 0;
            totalCategoryPrice += totalPrice; // Accumulate total price for the category

            let formattedPrice = totalPrice.toLocaleString();
            let pricePerPieceFormatted = priceData ? priceData.pricePerPiece.toLocaleString() : "0";
            let className = totalPrice >= 0 ? 'positive' : 'negative';
            let totalQuantity = priceData ? priceData.totalQuantity : 0;

            row += `<td class="${className}">$${formattedPrice}<br><span style='font-size: smaller;'>${totalQuantity} at $${pricePerPieceFormatted} per piece</span></td>`;
        });

        // Only add the row if the total category price is not zero
        if (totalCategoryPrice !== 0) {
            tableBody.innerHTML += row + `</tr>`;
        }
    });

    // Add the 'Sum' row
    let sumRow = `<tr class="sum-row"><td>Sum</td>`;
    dates.forEach(date => {
        let sum = sums[date] || 0; // Default to 0 if undefined
        let className = sum >= 0 ? 'positive' : 'negative';
        sumRow += `<td class="${className}">$${sum.toLocaleString()}</td>`;
    });
    sumRow += `</tr>`;
    tableBody.innerHTML += sumRow;
}