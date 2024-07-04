const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./connection.js');   //importing neccessary modules

const app = express();

app.listen(8000, function() {
    console.log("The server is running");
});

app.use(session({
    secret: 'Hello World',
    resave: false,
    saveUninitialized: true,
}));
function isAuthenticated(req, res, next) { //function to check if the user is logged in or not
    if (req.session.user) {
        return next();
    } else {
        res.send("You must be logged in to access this route"); 
    }
}

app.get("/all-users", isAuthenticated,function(req, res) {  //route to get info about all the registered users
    db.query('SELECT * FROM users', function(err, results) {
        if (err) {
            console.error("Database error:", err);
            res.send("Database error");
            return;
        } 
        res.json(results);
    });
});

app.get("/register", async function(req, res) {     //route to get register about new account Note:All users start with balance of 1000
    const { username, password } = req.query;
    
    if (!username || !password) {
        res.send("Username and password are required" );
        return;
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);  //hasing the password of the user
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err, results) {
            if (err) {
                console.error("Database error:", err);
                res.send("Failed to register user");
                return;
            }
            res.send("User registered successfully");
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.send("Internal server error");
    }
});

app.get("/login", function(req, res) {  //route to login the registered users
    const { username, password } = req.query;

    if (!username || !password) {
        res.send("Username and password are required");
        return;
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], function(err, results) { //checking for the username in the database
        if (err) {
            console.error("Database error:", err);
            res.send("Database error");
            return;
        }

        if (results.length === 0) {
            res.send("User not found");
            return;
        }

        const user = results[0];

        bcrypt.compare(password, user.Password, function(err, result) { //checking the password
            if (err) {
                console.error("Error comparing passwords:", err);
                res.send("Internal server error");
                return;
            }

            if (result) {
                req.session.user = {                //creating a session
                    id: user.Id,
                    username: user.Username,
                    balance:user.Balance
                };
                res.send("Login successful");
                console.log(user);
                console.log(req.session.user);
            } else {
                res.send("Invalid username or password");
            }
        });
    });
});

app.get("/logout", function(req, res) { //route logout  the registered users

    req.session.destroy(function(err) {
        if (err) {
            console.error("Error destroying session:", err);        //session destroy
            res.send("Failed to logout");
            return;
        }
        res.send("Logout successful");
    });
});

app.get("/update", isAuthenticated, async function(req, res) { //route to update info about all the registered users
    const { username, password } = req.query;

    if (!username || !password) {
        res.send("Username and pass is required for update");
        return;
    }

    let hashedPassword = null; //cant use inside try catch

    try {
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        db.query("UPDATE users SET username=?, password=? WHERE id = ?", [username,hashedPassword,req.session.user.id], function(err, results) {
            if (err) {
                console.error("Database error:", err);
                res.send("Failed to update user details");
                return;
            }
            res.send("User details updated successfully");
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.send("Internal server error");
    }
});

app.get("/send-money", isAuthenticated, function(req, res) { //route to send money from one user to the other
    const { recipientUsername, amount } = req.query;

    if (!recipientUsername || !amount || amount <= 0) {
        res.send("Invalid recipient username or amount");
        return;
    }

    const senderId = req.session.user.id;
    const senderBalance = req.session.user.balance;

    if (senderBalance < amount) {
        res.send("Insufficient balance");
        return;
    }

    db.beginTransaction(function(err) { //begin Transaction function for rollback in case of emergency
        if (err) {
            console.error("Error beginning transaction:", err); 
            res.send("Transaction failed");
            return;
        }

        try {
            const recipientQuery = 'SELECT id, balance FROM users WHERE username = ? ';
            db.query(recipientQuery, [recipientUsername], function(err, recipientResults) { //querying recipient details
                if (err) {
                    console.error("Error querying recipient:", err);
                    db.rollback();
                    res.send("Transaction failed");
                    return;
                }

                if (recipientResults.length === 0) {
                    db.rollback();
                    res.send("Recipient not found");      
                    return;
                }

                const recipientId = recipientResults[0].id;
                const recipientBalance = recipientResults[0].balance;

                    if (senderId === recipientId) {
                         return res.send("Cannot send money to yourself")
                    }


                const updateSenderQuery = 'UPDATE users SET balance = balance - ? WHERE id = ?';
                db.query(updateSenderQuery, [amount, senderId], function(err) {             //updated details sender
                    if (err) {
                        console.error("Error updating sender balance:", err);
                        db.rollback();
                        res.send("Transaction failed");
                        return;
                    }

                    const updateRecipientQuery = 'UPDATE users SET balance = balance + ? WHERE id = ?'; //updated details Recipient
                    db.query(updateRecipientQuery, [amount, recipientId], function(err) {
                        if (err) {
                            console.error("Error updating recipient balance:", err);
                            db.rollback();
                            res.send("Transaction failed");
                            return;
                        }

                        const transactionQuery = 'INSERT INTO transactions (Sender_id, Reciver_id ,Amount) VALUES (?, ?, ?)';
                        db.query(transactionQuery, [senderId, recipientId, amount], function(err) {
                            if (err) {
                                console.error("Error inserting transaction:", err);
                                db.rollback();                                          //adding Transaction History
                                res.send("Transaction failed");
                                return;
                            }


                            db.commit(function(err) {
                                if (err) {
                                    console.error("Error committing transaction:", err); //commiting the changes when everything is ok
                                    db.rollback();
                                    res.send("Transaction failed");
                                    return;
                                }


                                req.session.user.balance -= amount;


                                res.send("Money sent successfully");
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error("Transaction error:", error);
            db.rollback();
            res.send("Transaction failed");
        }
    });
});
app.get("/history", isAuthenticated, function(req, res) {
    const userId = req.session.user.id;


    const historyQuery = ` 
        SELECT 
            t.transaction_id, 
            t.amount, 
            t.time, 
            u1.username AS sender_username, 
            u2.username AS receiver_username
        FROM transactions t
        INNER JOIN users u1 ON t.sender_id = u1.id
        INNER JOIN users u2 ON t.reciver_id = u2.id   
        WHERE t.sender_id = ? OR t.reciver_id = ?
        ORDER BY t.time DESC;
    `;                                                      //query to join two tables and see the desired result

    db.query(historyQuery, [userId, userId], function(err, results) {
        if (err) {
            console.error("Error fetching transaction history:", err);
            res.send("Failed to fetch transaction history");
            return;
        }


        const transactionHistory = results.map(row => ({ 
            id: row.id,
            amount: row.amount,                                                 //looping over the vales of results and formatting them
            timestamp: row.timestamp,
            sender_username: row.sender_username,
            receiver_username: row.receiver_username
        }));

        res.json(transactionHistory);
    });
});



