var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    displayItems();
});

function displayItems () {
    connection.query(
        "SELECT * FROM products", function(err, results) {
            if (err) throw err;
            for (i = 0; i < results.length; i++) {
                console.log("----------------------------------\n");
                console.log("Item Id: " + results[i].item_id + "\nProduct: " + results[i].product_name + "\nDepartment: " + results[i].department_name + "\nPrice: $" + results[i].price + "\nQuantity: " + results[i].stock_quantity +"\n");
            }
        
            inquirer.prompt([
                {
                    name: "idNumber",
                    type: "input",
                    message: "Enter the id of the product you would like to buy.",
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How much stock would you like to buy?",
                }
            ]).then(function(answers) {
                connection.query(
                    "SELECT * FROM products WHERE ?",
                [
                    {
                        item_id: answers.idNumber
                    }
                ]
            , function(err, results) {
                var stock = results[0].stock_quantity;
                var price = results[0].price;
                var quantity = stock - answers.quantity;
                var cost = price * answers.quantity;
                if(quantity >= 0) {
                    connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: quantity
                        },
                        {
                            item_id: answers.idNumber
                        }
                    ],function(err, results) {
                        if (err) throw err;
                        console.log("Your order has been placed. You have been charged $" + cost);
                        connection.end();
                    })
                } 
                else {
                    console.log("Sorry for the inconvience but we do not have enough stock for your order. Please try again later or order a different item.");
                    displayItems();
                }
            })
        })
        
    })
}