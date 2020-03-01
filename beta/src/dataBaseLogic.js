

/*global
state:true
replaceState, unpackState, packState, getTimestamp,
firebase
*/

/* eslint-disable no-unused-vars */


var firebaseConfig = {
  apiKey: "AIzaSyDJrv9vt4GjKZQdVoSjaRpWFO2wuwd4TUY",
  authDomain: "test-23d30.firebaseapp.com",
  databaseURL: "https://test-23d30.firebaseio.com",
  projectId: "test-23d30",
  storageBucket: "test-23d30.appspot.com",
  messagingSenderId: "1074984974506",
  appId: "1:1074984974506:web:ab9e25568dfdc0ae9478d3",
  measurementId: "G-XWBNW49NG4"
};

// firebase.initializeApp(firebaseConfig);
// firebase.auth().onAuthStateChanged(authStateChangeHandler);

let loggedInPlayer = null;
let localGameInfo = {};
let lastSaved;

let cacheHandleList = [];
let cacheGameList = [];

function authStateChangeHandler(user) {
  if (user) {
    firebase.firestore().collection("handles").where("uid","==", user.uid).get()
      .then(function(qs) {
        loggedInPlayer = {uid:user.uid, handle:qs.docs[0].id};
        console.log("loggedInPlayer:  ", loggedInPlayer)
        updateHandleList(); updateCacheGameList();

      })
      .catch(function(error) {alert("new logged in handle failed"), console.log("gethandleserror new login",error) });
  } else {console.log("signedout"); loggedInPlayer = null}
}


async function getHandleList(){
  return await firebase.firestore().collection("handles").get()
    .then(function(qs) {
      let handles = [];
      qs.forEach((doc) => { handles.push([handles.length, doc.id, doc.data().uid]) })
      console.log("handles updated", handles);
      return handles;
    })
    .catch(function(error) {alert("handlelisterror"); console.log("gethandleserror"); return "fail getHandleList" });
}

async function updateHandleList(){
  cacheHandleList = await getHandleList();
  console.log("refreshHandleList", cacheHandleList);
}


function loginViaPrompt(){
  let email = prompt("email", localStorage.getItem("lastname") || "MyEmail");
  localStorage.setItem("lastname", email)
  let pass = prompt("Password", "MyPassword");
  handleSignIn(email,pass);
}

function signupViaPrompt(){
  let email = prompt("email", "MyEmail");
  let pass = prompt("Password", "MyPassword");
  let handle = prompt("In Game Handle", "My Prefered Username");

  firebase.firestore().collection("handles").doc(handle).get()
    .then(function(qs) {
      if(qs.exists)alert("handle taken  " + handle) ;
      else(handleSignUp(email, pass, handle))
    })
    .catch(function(error) {alert("please try again gethandleserror"), console.log("gethandleserror") });
}

function setDocData(){
  let docData =  {
    name: state.gameName,
    users: [firebase.auth().currentUser.uid,],
    turnNumber:state.turnNumber,
    playerTurn:state.playerTurn,
    when:getTimestamp(),
  }
  console.log("online  ", state.meta.online);
  if (state.meta.online){
    state.meta.playergrid.forEach((arr) => {
      if(docData.users.indexOf(arr[2]) === -1){
      //    console.log(" 6 playergrid2", docData.users,  );
        docData.users.push(arr[2])
      }
    });
  }
  console.log(docData);
  return docData
}

function saveToServer(){  // Check order (make async await?)
  console.log("5 SavingTOServer", state.gameID);
  firebase.firestore().collection("gamestest").doc(state.gameID).set( setDocData() )
    .then(function(docRef) {
      console.log("7 Document written : ", state.gameID);
      lastSaved = {id:state.gameID, turnNumber:state.turnNumber, playerTurn:state.playerTurn,}
    })
    .catch(function(error) {console.error("Error adding document: ", error)  });

  firebase.firestore().collection("gamestest").doc(state.gameID).collection("state")
    .doc("current")
    .set({currentGame: packState()})
  //  .then(function(docRef) {console.log("State  with ID: ")})
    .catch(function(error) {console.error("Error adding STate: ", error)  });
}



function checkForUpdatedServerGame(gameID = state.gameID){
  return firebase.firestore().collection("gamestest").doc(gameID).get()
    .then(function(doc) {
      if (doc.data()){
        let {name, users, turnNumber, playerTurn, when} = doc.data()

        if(lastSaved.turnNumber < turnNumber || lastSaved.playerTurn <  playerTurn){
          console.log("new game on server");
          return true;
        } else {return false}

      //    if(turnNumber >= localGameInfo )
      }
    })
}


async function makeLocalGameList(){
  let gameList = []
  firebase.firestore().collection("gamestest").where("users", "array-contains", firebase.auth().currentUser.uid)
    .get().then(function(qs) {
      qs.forEach(doc => gameList.push([doc.id, doc.data()]))
    })
  return gameList;
}

async function updateCacheGameList(){
  cacheGameList = await makeLocalGameList();
  console.log("cacheGameList", cacheGameList);
}

async function loadGameFromID(gameID){
  firebase.firestore().collection("gamestest").doc(gameID).collection("state").doc("current").get()
    .then(function(qs) {1
      replaceState( unpackState(JSON.parse(qs.data().currentGame)));
      // localGameInfo = setlocalGameInfo()
      // drawScreen();
    });
}

// async function checkTimestamp(gameID){
//   firebase.firestore().collection("gamestest").doc(gameID).collection("state").doc("current").get()
//     .then(function(qs) {1
//       replaceState( unpackState(JSON.parse(qs.data().currentGame)));
//       // localGameInfo = setlocalGameInfo()
//       // drawScreen();
//     });
// }



// DB methods ------------------------------------------



function generateID(length){
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let autoId = '';
  for (let i = 0; i < length; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  //  console.log(autoId);
  return autoId;
}

function handleSignIn(email, password) {
  console.log("signing in");
  firebase.auth().signInWithEmailAndPassword(email, password).
    catch(function(error) { alert(error.message); console.log(error);}).
    on()
}

function handleSignUp(email, password, handle) {

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(docRef) {
      console.log("User Createdp.... ");
      firebase.firestore().collection("handles").doc(handle)
        .set({uid: firebase.auth().currentUser.uid})
        .catch(function(error) { console.error("Error adding handle: ", error)  })
    })
    .catch(function(error) { alert(error.message); console.log("creation error", error);});
}

function toggleSignIn() {
  if (firebase.auth().currentUser) { firebase.auth().signOut();}
  else {handleSignIn()}
}

function sendResetEmail(email) {
  firebase.auth().sendPasswordResetEmail(email).
    then(function() { alert('Password Reset Email Sent!');}).
    catch(function(error) {    alert(error.message);   console.log(error);  });
}
