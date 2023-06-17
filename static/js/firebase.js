// Import the necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getDatabase, ref } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNM1HWrQsWeJoYNHTE0o4VKy1fHqWy1iM",
  authDomain: "horsetranq.firebaseapp.com",
  databaseURL: "https://horsetranq-default-rtdb.firebaseio.com",
  projectId: "horsetranq",
  storageBucket: "horsetranq.appspot.com",
  messagingSenderId: "11521680190",
  appId: "1:11521680190:web:e7b4b4e567ce51b8cac26f",
  measurementId: "G-XBX6P6CLHR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

export function getUserDataRef(auth0UserId) {
  return ref(database, 'users/' + auth0UserId);
}

// export the auth and database instances to use them in other parts of your application
export { auth, database };