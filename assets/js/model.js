var idbSupported = false;
var database = "Personal Expenses";
var db;
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

    var transaction = db.transaction(["Expenses"],"readwrite");
    var store = transaction.objectStore("Expenses");

    //Define an expense
    var expense = {
        value:value,
        currency:currency,
        category:category,
        created:new Date()
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

// helper to generate a table with the expenses
function displayExpensesOverview(e) {

    var expansesTable = "";

    db.transaction(["Expenses"], "readonly").objectStore("Expenses").openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor) {
            expansesTable += "<tr>";
            expansesTable += "<td>"+cursor.key+"</td>";
            for(var field in cursor.value) {
                expansesTable += "<td>" + cursor.value[field] + "<td/>";
            }
            expansesTable += "</tr>";
            cursor.continue();
        }
        document.querySelector("tbody").innerHTML = expansesTable;
    }
}


/* 
* Helper to return a json object with all expenses
* @return object json object with all expenses
*/
function getAllExpenses(storage){
    this.storage = storage;
    db.transaction([storage], "readonly").objectStore(storage).openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        
        if(cursor) {
                // console.log(cursor.value.primaryKey);
                // var expensesJSON = {
                //     "cursor.value.primaryKey" : {
                //         value:cursor.value.value,
                //         currency:cursor.value.currency,
                //         category:cursor.value.category,
                //         created:cursor.value.created
                //     },
                // };
                for(var field in cursor.value) {
                    // expensesJSON.expenseKey[cursor.value.field] = cursor.value.field;
            }
            cursor.continue();
        }
    }
}

function backupExpenses(e) {

}

function deleteExpense(storage,index){

}