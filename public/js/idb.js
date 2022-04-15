
// create variable to hold connection
let db;
let budgetVersion;

const request= indexedDB.open("BudgetDB", budgetVersion || 10)

// event if database changes
request.onupgradeneeded = (event) => {
    console.log("Need to upgrade IndexedDB")
    const {oldVersion} = event;
    const newVersion = event.newVersion || db.version
    db = event.target.result;
    db.createObjectStore("budgetStore", { autoIncrement: true });

}

// if unsuccesfull 
request.onerror = function(event) {
    console.log("Shoot! " + event.target.errorCode);
  };
// if successfull 
  request.onsuccess = ({ target }) => {
    db = target.result;
  
    if (navigator.onLine) {
      checkDatabase();
    }
  };

  async function getFromDb() {
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const store = transaction.objectStore("budgetStore");
    const getAll = await store.getAll()
    let dbData;
    getAll.onsuccess = () => {
        dbData = getAll.result
    }
    return dbData
}

function checkDatabase() {
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const store = transaction.objectStore("budgetStore");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => {        
          return response.json();
        })
        .then(() => {
          // delete records if successful
          const transaction = db.transaction(["budgetStore"], "readwrite");
          const store = transaction.objectStore("budgetStore");
          store.clear();
        });
      }
    };
  }
// offline record saving 
const saveRecord = (record) => {
    console.log("Record has been saved!")
    const transaction = db.transaction(["budgetStore"], "readwrite");
    const store = transaction.objectStore("budgetStore");
  
    store.add(record);
}

window.addEventListener("online", checkDatabase)
