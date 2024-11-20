const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBE7eh8wlqzHOo9ncYToD469qPVSQhPPvM",
    authDomain: "ticketsystem-fffc6.firebaseapp.com",
    projectId: "ticketsystem-fffc6",
    storageBucket: "ticketsystem-fffc6.firebasestorage.app",
    messagingSenderId: "185255648993",
    appId: "1:185255648993:web:bc4ef3ca2a1852cc83a1a0",
});
///////////////////////////////////////////////////////////

/* Firebase config */
const db = firebaseApp.firestore();

function loadComments() {
    const ticketId = sessionStorage.getItem("ticketId"); // ID of the ticket
    const ticketOwnerId = sessionStorage.getItem("ticketOwnerId"); // ID of the ticket owner

    console.log("Loading comments for ticketId:", ticketId);
    console.log("Ticket owner ID:", ticketOwnerId);

    const commentsContainer = document.getElementById("comments");

    // Clear the existing comments
    commentsContainer.innerHTML = "";

    // Step 1: Fetch all comments for the ticket and order by timestamp
    db.collection("comments")
        .where("ticketId", "==", ticketId)
        .orderBy("timestamp", "asc")
        .get()
        .then((querySnapshot) => {
            const comments = [];
            const userIds = new Set();

            // Collect comments and user IDs
            querySnapshot.forEach((commentDoc) => {
                const commentData = commentDoc.data();
                commentData.id = commentDoc.id; // Add the document ID
                comments.push(commentData);
                userIds.add(commentData.uid); // Collect unique user IDs
            });

            console.log("Comments fetched:", comments);

            // Step 2: Fetch user data for all unique user IDs and sort 
            const userPromises = Array.from(userIds).map((userId) =>
                db.collection("users").doc(userId).get().then((doc) => {
                    if (doc.exists) {
                        return { userId, ...doc.data() };
                    } else {
                        console.error("User not found:", userId);
                        return null;
                    }
                })
            );

            return Promise.all(userPromises).then((users) => {
                const userMap = new Map();
                users.forEach((user) => {
                    if (user) userMap.set(user.userId, user);
                });

                console.log("Users fetched:", userMap);

                // Step 3: Render comments
                comments.forEach((comment) => {
                    const userData = userMap.get(comment.uid);
                    const commentElement = document.createElement("div");

                    commentElement.classList.add("comment");
                    if (comment.uid === ticketOwnerId) {
                        commentElement.classList.add("ownerComment");
                    } else {
                        commentElement.classList.add("adminComment");
                    }

					// Add comment data to the comment element
                    commentElement.innerHTML = `
                        <p><strong>${userData ? userData.firstname + " " + userData.lastname : "Unknown User"}</strong></p>
                        <p>${comment.comment}</p>
                        <p class="timestamp">${new Date(comment.timestamp?.seconds * 1000).toLocaleString()}</p>
                    `;

                    commentsContainer.appendChild(commentElement);
                });
            });
        })
        .catch((error) => {
            console.error("Error loading comments:", error);
        });

    console.log("Comments loading...");
}


// Show single ticket and load comments using loadComment function
function showTicket() {
    const ticketId = sessionStorage.getItem("ticketId");
    const uid = sessionStorage.getItem("uid");
    sessionStorage.setItem("ticketOwnerId", uid);

    console.log("Showing ticket with ID:", ticketId);

    db.collection("tickets").doc(ticketId).get().then((doc) => {
        if (doc.exists) {
            const ticketData = doc.data();
            console.log("Ticket data:", ticketData);
            document.getElementById("ticketTitle").innerHTML = ticketData.title;
            document.getElementById("ticketDescription").innerHTML = ticketData.description;
        } else {
            console.log("No such ticket!");
        }
        loadComments();
    }).catch((error) => {
        console.error("Error getting ticket:", error);
    });
}


// Add new comment to ticket
function newComment() {
    const ticketId = sessionStorage.getItem("ticketId");
    const uid = sessionStorage.getItem("uid");
    const comment = document.getElementById("comment").value;
	document.getElementById("comment").value = ""; // Clear the comment input field
    if (comment === "") {
        alert("Comment is empty!");
        return;
    }
	// Add comment to the database
    db.collection("comments").add({
        comment: comment,
        ticketId: ticketId,
        uid: uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Add timestamp field
    }).then(() => {
        console.log("Comment Successfully Created!");
        loadComments();
    }).catch((error) => {
        console.error("Error Creating Comment:", error);
    });
}

// Close ticket and move it to closedTickets collection
function closeTicket() {
    const ticketId = sessionStorage.getItem("ticketId");
    db.collection("tickets").doc(ticketId).get().then((doc) => {
        if (doc.exists) {
            const ticketData = doc.data();
            db.collection("closedTickets").doc(ticketId).set(ticketData).then(() => { // Add ticket to closedTickets collection
                db.collection("tickets").doc(ticketId).delete().then(() => { // Delete ticket from tickets collection
                    console.log("Ticket Successfully Moved to Closed Tickets!");
                    window.location.href = "./home.html";
                }).catch((error) => {
                    console.error("Error Deleting Ticket:", error);
                });
            }).catch((error) => {
                console.error("Error Moving Ticket to Closed Tickets:", error);
            });
        } else {
            console.log("No such ticket!");
        }
    }).catch((error) => {
        console.error("Error Getting Ticket:", error);
    });
}

// Go back to home page
function backTicket() {
    window.location.href = "./home.html";
}

const inputFields = document.querySelectorAll("input");
inputFields.forEach(input => {
    input.addEventListener("keyup", event => {
        if (event.key === "Enter") {
			document.querySelector("#submitComment").click();
            event.preventDefault();
        }
    });
});