
// Using Firestore and Firebase
const firebaseApp = firebase.initializeApp({
	// API is hardcoded in this build due to the lack of a backend server to store the API key securely in.
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
const auth = firebaseApp.auth();

// Hiding and showing labels and input fields for creating a new user for the login page.
function showCreateUserLabels() {
	document.getElementById("fname").style.display = "block";
	document.getElementById("lname").style.display = "block";
	document.getElementById("address").style.display = "block";
	document.getElementById("zip").style.display = "block";
	document.getElementById("city").style.display = "block";
	document.getElementById("fnamelabel").style.display = "block";
	document.getElementById("lnamelabel").style.display = "block";
	document.getElementById("addresslabel").style.display = "block";
	document.getElementById("ziplabel").style.display = "block";
	document.getElementById("citylabel").style.display = "block";
	document.getElementById("createUserButton").style.display = "block";
	document.getElementById("newUserButton").style.display = "none";
}

function hideCreateUserlabels() {
	document.getElementById("fname").style.display = "none";
	document.getElementById("lname").style.display = "none";
	document.getElementById("address").style.display = "none";
	document.getElementById("zip").style.display = "none";
	document.getElementById("city").style.display = "none";
	document.getElementById("fnamelabel").style.display = "none";
	document.getElementById("lnamelabel").style.display = "none";
	document.getElementById("addresslabel").style.display = "none";
	document.getElementById("ziplabel").style.display = "none";
	document.getElementById("citylabel").style.display = "none";
	document.getElementById("createUserButton").style.display = "none";
	document.getElementById("newUserButton").style.display = "block";
}






// Logging in the user with email and password

function logIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password)
        // Checking if the user is logged in
        .then((userCredentials) => {
            // Using sessionStorage to store the user id
            sessionStorage.setItem("uid", userCredentials.user.uid)
            // Redirect to home.html 
            window.location.href = "./home.html"
        })
        .catch((error) => {
            alert("Invalid email or password");
        })
}

// Creating a user in Firebase Authentication and Firestore

function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const address = document.getElementById("address").value;
    const zip = document.getElementById("zip").value;
    const city = document.getElementById("city").value;
	if (email === "" || password === "" || fname === "" || lname === "" || address === "" || zip === "" || city === "") {
		alert("Please fill out all fields!");
		return;
	}

    // Creating the user in the Firebase Authentication app
    auth.createUserWithEmailAndPassword(email, password)
        // Creating the user in the Firestore database
        .then((userCredentials) => {
            sessionStorage.setItem("uid", userCredentials.user.uid)
            db.collection("users").doc(userCredentials.user.uid).set({
                firstname: fname,
                lastname: lname,
                address: address,
                zip: zip,
                city: city,
                email: email,
                userId: userCredentials.user.uid
            })
                .then(function () {
                    window.location.href = "./home.html";
                })
        })

        .catch((err) => {
            alert(err.message)
            console.log(err.code);
            console.log(err.message);
        });
}

// Get the input field
const inputFields = document.querySelectorAll("input");
inputFields.forEach(input => {
    input.addEventListener("keyup", event => {
        if (event.key === "Enter") {
            if (document.getElementById("createUserButton").style.display === "block") {
				document.querySelector("#createUserButton").click();
			} else {
				document.querySelector("#loginButton").click();
			}
            event.preventDefault();
        }
    });
});