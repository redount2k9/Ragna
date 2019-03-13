let modal = document.getElementById('loginForm');

// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
});

$(document).ready(() => populateList());

let query = firebase.database().ref('urls/').orderByKey();

let count = 0;

const populateList = () => {
  let photoArray = new Array();

  let r = query.once("value").then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      photoArray.push(childSnapshot);
    });
    return photoArray.reverse();
  }).then((photoArray) => {
    count = 0;
    photoArray.forEach((elem) => {
      $("#mainDiv" + count).remove();
      let src = elem.val();
      console.log(src);
      let img = document.createElement("img");
      let btn = document.createElement("button");
      btn.appendChild(document.createTextNode('Remove'));
      img.src = src;
      img.classList.add('image');
      btn.classList.add('btn');
      btn.classList.add('rmBtn');
      if (!loggedIn)
        btn.classList.add('hidden');
      let div = document.createElement("div");
      div.setAttribute("id", "mainDiv" + count);
      document.getElementById("element").appendChild(div);
      document.getElementById("mainDiv" + count).appendChild(img);
      document.getElementById("mainDiv" + count).appendChild(btn);
      count++;
    })
    $("#mainDiv" + count).remove();
  });

};

let browseInput = document.getElementById('browseInput');
let uploadButton = document.getElementById('uploadButton');
let authButton = document.getElementById('authButton');
let modeSwitchButton = document.getElementById('modeSwitchButton');
let databaseRef = firebase.database().ref('urls/');
var file = undefined;
var loggedIn = false;
let nightMode = false;

let mainLoginButton = document.getElementById('mainLoginButton');

$('#element').click((e) => {
  e.stopPropagation();
  var target = $(e.target);
  if (target.hasClass("rmBtn")) {
    let ans = confirm("Are you sure you want to remove the selected photo?");
    if ( ans == false )
      return;
    let src = target.prev()[0].src;
    let r = query.once("value").then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot['node_']['value_'] == src)
        databaseRef.child(childSnapshot.key).remove();
      });
    populateList();
    });
  }
});

mainLoginButton.addEventListener("click", (event) => {
    if ( loggedIn == false ) {
      modal.style.display = 'flex';
    }
    else {
      firebase.auth().signOut();
      populateList();
    }
});

saveUrl = (snap) => {
  snap.ref.getDownloadURL().then((url) => {
    databaseRef.push(url);
    alert('Uploaded successfully!');
    populateList();
  });
}

browseInput.addEventListener('change', (e) => {
  file = e.target.files[0];
});

uploadButton.addEventListener('click', (e) => {
  if ( file != undefined && loggedIn ) {
    alert('Uploading, please wait...');
    let storageRef = firebase.storage().ref('ragna_pics/' + file.name);
    storageRef.put(file).then(saveUrl);
    return;
  }
  alert('No picture of Ragna selected!')
});

authButton.addEventListener('click', (e) => {
  let email = document.getElementById('uname').value;
  let password = document.getElementById('psw').value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch((err) => {
    alert(err.message);
  });
});

modeSwitchButton.addEventListener('click', (e) => {
  nightMode = !nightMode;
  document.body.style.backgroundColor = (nightMode == true ? "#243447" : "#ffffff");
});

firebase.auth().onAuthStateChanged((user) => {
if (user) {
  loggedIn = true;
  document.getElementById('mainLoginButton').innerText = 'Sign out';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('uploadForm').style.visibility = 'visible';
  populateList();
} else {
  loggedIn = false;
  document.getElementById('mainLoginButton').innerText = 'Login';
  document.getElementById('uploadForm').style.visibility = 'hidden';
  populateList();
}
});
