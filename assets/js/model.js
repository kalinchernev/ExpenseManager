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
            // console.log("running onupgradeneeded");
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
                document.addEventListener("DOMContentLoaded", getExpenses());
            }

            if( URL.indexOf('export') >= 0){
                document.querySelector("#send-backup").addEventListener("click", backupExpenses, false);
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
function getExpenses(e,storage) {

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
        var expensesJSON = {
            5:{
                value:4,
                currency:"BGN",
                category:"pets",
                created:"12-12-2012"
            },
            6:{
                value:5,
                currency:"BGN",
                category:"Car",
                created:"12-12-2012"
            },
        };
        if(cursor) {
                for(var field in cursor.value) {
                // make a expensesJSON object, key:value from one to another
            }
            cursor.continue();
        } else {
            // console.log(expensesJSON);
        }
    return expensesJSON;
    }
}

function backupExpenses(e) {
    var email = document.querySelector("#email").value;

    if (email.indexOf('@') <= 1) {
        alert("Please enter a valid e-mail address");
    } else {
        var allExpenses = getAllExpenses("Expenses");
        console.log(allExpenses);
        
        // var ajax = new XMLHttpRequest();

        // ajax.open("GET","backup.php",true);
        
        // ajax.send();

        // ajax.onreadystatechange = function() {
        //     if (ajax.readyState==4 && ajax.status==200) {
        //         document.getElementById("ajax-response").innerHTML=ajax.responseText;
        //     }
        // }
    }
}

