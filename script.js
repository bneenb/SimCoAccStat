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

function showTBDParser1() {
    console.log("TBD Parser 1 functionality goes here.");
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

function handleFileSelect(evt) {
    const file = evt.target.files[0];
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            displayResults(processData(results.data));
        }
    });
}

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
                    let profitString = details && details.profit ? details.profit : "$0";
                    let profit = parseFloat(profitString.replace(/[^0-9.-]+/g,""));

                    if (!profitsByCategoryAndDate[category]) {
                        profitsByCategoryAndDate[category] = {};
                    }
                    if (!profitsByCategoryAndDate[category][date]) {
                        profitsByCategoryAndDate[category][date] = 0;
                    }
                    profitsByCategoryAndDate[category][date] += profit;
                    sums[date] += profit; // Accumulate profit in sums
                }
            } catch (e) {
                console.error(`Error parsing data for row:`, row, `Error:`, e);
            }
        });
    });

    //console.log("Sums: ", sums); // Debugging line to check sums
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
        let totalProfit = 0; // Track total profit for the category
        let row = `<tr><td>${category}</td>`;
        dates.forEach(date => {
            let profit = profitsByCategoryAndDate[category][date] ? profitsByCategoryAndDate[category][date] : 0;
            totalProfit += profit;
            let formattedProfit = profit.toLocaleString(); // Format number with commas
            let className = profit >= 0 ? 'positive' : 'negative';
            row += `<td class="${className}">$${formattedProfit}</td>`;
        });
        row += `</tr>`;
        if (totalProfit !== 0) {
            tableBody.innerHTML += row; // Only add the row if the total profit is not zero
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