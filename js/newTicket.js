
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


// Creating a new ticket
function newTicket() {
	const uid = sessionStorage.getItem("uid"); // get the uid of the current user
	const title = document.getElementById("title").value; // get the title of the ticket
	document.getElementById("title").value = ""; // clear the title input
	const description = document.getElementById("description").value; // get the description of the ticket
	document.getElementById("description").value = ""; // clear the description input
	if (title === "" || description === "") { // check if title or description is empty
		alert("Title or Description is empty!");
		return;
	}
	console.log(title, description);
	db.collection("tickets").doc(uid)
	db.collection("tickets").add({ // Add the ticket to the database
		title: title,
		description: description,
		uid: uid
	}, { merge: true }).then(() => {
		console.log("Ticket Successfully Created!");
		loadTickets(); // Reload tickets after creating a new one
	}).catch((error) => {
		console.error("Error Creating Ticket: ", error);
	})
}


function loadTickets() {
	document.getElementById("ticketCollage").innerHTML = ""; // Clear the ticket collage
	const uid = sessionStorage.getItem("uid"); // get the uid of the current user

	db.collection("admins").doc(uid).get().then((doc) => {
		if (doc.exists) {
			db.collection("tickets").get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					const userId = doc.data().uid; // Find Uid of user who created the ticket
					if (userId) {
						db.collection("users").where("userId", "==", userId).get().then((userQuerySnapshot) => { // Find user data of the user who created the ticket
							if (!userQuerySnapshot.empty) {
								userQuerySnapshot.forEach((userDoc) => {
									const userData = userDoc.data();
									const name = userData.firstname + " " + userData.lastname;
									document.getElementById("ticketCollage").innerHTML += "<div class='ticket' id='" + doc.id + "'><h2>" + doc.data().title + "</h2><h3>" + name + "</h3><p>" + doc.data().description + "</p></div>"; // Add ticket to the ticket collage
									attachEventListeners(); // Attach event listeners to the new tickets
								});
							}
						})
					}
				});
				
			});
		} else {
			db.collection("tickets").where("uid", "==", uid).get().then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					document.getElementById("ticketCollage").innerHTML += "<div class='ticket' id='" + doc.id + "'><h2>" + doc.data().title + "</h2><p>" + doc.data().description + "</p></div>"; // Add ticket to the ticket collage
				});
				attachEventListeners(); // Attach event listeners to the new tickets
			});
		}
	}).catch((error) => {
		console.error("Error checking admin status: ", error);
	});
}

function attachEventListeners() {
	const tickets = document.querySelectorAll('.ticket');
	tickets.forEach(ticket => {
		ticket.addEventListener('click', () => {
			sessionStorage.setItem("ticketId", ticket.id);
			window.location.href = "ticket.html";
			
		});
	});
}

const inputFields = document.querySelectorAll("input");
inputFields.forEach(input => {
    input.addEventListener("keyup", event => {
        if (event.key === "Enter") {
				document.querySelector("#submit").click();
            event.preventDefault();
        }
    });
});