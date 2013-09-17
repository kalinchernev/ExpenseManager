var idbSupported = false;
var database = "Personal Expenses";
var URL = window.location.href;
 
document.addEventListener("DOMContentLoaded", function(){
 
    if("indexedDB" in window) {
        idbSupported = true;
    }
 
    if(idbSupported) {
        var openRequest = indexedDB.open(database,1);

        openRequest.onupgradeneeded = function(e) {
            var thisDB = e.target.result;
         
            if(!thisDB.objectStoreNames.contains("Expenses")) {
                thisDB.createObjectStore("Expenses", {autoIncrement:true});
            }
         
            if(!thisDB.objectStoreNames.contains("Settings")) {
                thisDB.createObjectStore("Settings");
            }
        }
 
        openRequest.onsuccess = function(e) {
            // console.log("Success!");
            // Assuming db is a database variable opened successfully earlier
            db = e.target.result;
            
            if (document.querySelector("#save-button")){
                document.querySelector("#save-button").addEventListener("click", addExpense, false);    
            }

            if( URL.indexOf('overview') >= 0){
                document.addEventListener("DOMContentLoaded", displayExpensesOverview());
            }

            if( URL.indexOf('export') >= 0){
                document.querySelector("#save-backup").addEventListener("click", backupExpenses, false);
            }
            
        }
        
        openRequest.onerror = function(e) {
            console.log("Error");
            console.dir(e);
        }
 
    }
 
},false);


function addExpense(e){
    var category = document.querySelector("#category-value").value;
    var currency = document.querySelector("#currency").value;
    var value = document.querySelector("#input-value").value;
    var date = document.querySelector("#entry-date").value;

    var transaction = db.transaction(["Expenses"],"readwrite");
    var store = transaction.objectStore("Expenses");

    //Define an expense
    var expense = {
        value:value,
        currency:currency,
        category:category,
        created:date
    }

    //Perform the add operation to the store
    var request = store.add(expense);

    request.onerror = function(e) {
        console.log("Error",e.target.error.name);
    }
 
    request.onsuccess = function(e) {
        // console.log("Expense has been added");
        location.reload();
    }
}

// Helper to generate a table with the expenses
function displayExpensesOverview(e) {

    var expansesTable = "";

    db.transaction(["Expenses"], "readonly").objectStore("Expenses").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor) {
            expansesTable += "<tr>";
            expansesTable += "<td>"+cursor.key+"</td>";
            for(var key in cursor.value) {
                expansesTable += "<td>" + cursor.value[key] + "</td>";
            }
            expansesTable += "</tr>";
            cursor.continue();
        }
        document.querySelector("tbody").innerHTML = expansesTable;
    }
}

function backupExpenses(e) {
    var expensesDump = new Array();
    db.transaction(["Expenses"], "readonly").objectStore("Expenses").openCursor().onsuccess = function(e) {
        var db = e.target.result;

        if(db) {
            var expenseID = db.primaryKey;
                expenseValue = db.value.value;
                expenseCurrency = db.value.currency;
                expenseCategory = db.value.category;
                expenseDate = db.value.created;

            var expensesJSON = {
                expenseID:expenseID,
                expenseValue:expenseValue,
                expenseCurrency:expenseCurrency,
                expenseCategory:expenseCategory,
                expenseDate:expenseDate,
            }
            db.continue();
        } else {
            JSON2CSV(expensesDump);
        }
        var expenseItem = JSON.stringify(expensesJSON);
        if ((expenseItem != undefined) && (db.direction === "next") ) {
            expensesDump.push(expenseItem);
        }
    }
}

/* Helper to convert JSON object to CSV file and dump it from the browser
* @param object JSON object to be converted to CSV file
* @return browser dump of a CSV file containing the JSON object data re-ordered in a proper way
*/
function JSON2CSV(expensesDump){
    var expenseID = new Array();
        expenseValue = new Array();
        expenseCurrency = new Array();
        expenseCategory = new Array();
        expenseDate = new Array();
    var CSV = new Array();
    var header = "expenseID,expenseValue,expenseCurrency,expenseCategory,expenseDate" + "\n";
    for (var i = 0; i < expensesDump.length; i++) {
        var expenseJSON = JSON.parse(expensesDump[i]);
        var item = expenseJSON.expenseID + "," + expenseJSON.expenseValue + "," + expenseJSON.expenseCurrency + "," + expenseJSON.expenseCategory + "," + expenseJSON.expenseDate;
        item = item + "\n";
        CSV.push(item);
    }
    file = header + CSV;
    window.open("data:text/csv;charset=utf-8," + escape(file));
}