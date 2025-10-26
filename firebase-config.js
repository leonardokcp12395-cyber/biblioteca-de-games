// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAl9WKGSopL1kRwiVjfSQqDM2rm8ziHXnY",
  authDomain: "game-midia-blibioteca-brasil.firebaseapp.com",
  projectId: "game-midia-blibioteca-brasil",
  storageBucket: "game-midia-blibioteca-brasil.appspot.com",
  messagingSenderId: "740260572455",
  appId: "1:740260572455:web:b34b203be5e72f5d01cd02",
  measurementId: "G-52QB086TS9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);