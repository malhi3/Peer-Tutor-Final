var userID = "";
var DBRef = firebase.database().ref();
var userRef;
var profileImageRef = firebase.storage().ref().child("profile-images");
var spinner = document.getElementsByClassName("spinner")[0];
var mainContainer = document.getElementById("main-container");

document.addEventListener('DOMContentLoaded', function(){
  spinner.style.display = "block";
  firebase.auth().onAuthStateChanged(function(user){
    if (user){
      userID = user.uid;
      userRef = DBRef.child("Users").child(userID);
      initProfile();
    } else {
      alert("Not logged in");
    }
  });
  document.getElementById("profile-popup").addEventListener('click', function(){
    var profilePopup = document.getElementById("profile-popup-content");
    if (profilePopup.style.display == "none"){
      profilePopup.style.display = "block";
    } else if (profilePopup.style.display == "block"){
      profilePopup.style.display = "none";
    }
  });

  var profileImageDiv = document.getElementById("profile-image-div");

  profileImageDiv.addEventListener('click', function(){
    uploadProfileImage();
  });

  var previousProfileImageCSS;

  profileImageDiv.addEventListener('mouseover', function(){
    previousProfileImageCSS = profileImageDiv.style.backgroundImage;
    profileImageDiv.style.backgroundImage = 'url("../assets/edit-placeholder.png")';
    profileImageDiv.style.backgroundColor = "#F0F0F0";
  });

  profileImageDiv.addEventListener('mouseout', function(){
    profileImageDiv.style.backgroundImage = previousProfileImageCSS;
  });

});

function initProfile(){
  // setting the profile picture
  var image = profileImageRef.child(userID);
  image.getDownloadURL().then(function(url){
    var profileImages = document.getElementsByClassName("profile-images");
    for(var index in profileImages){
      var element = profileImages[index];
      element.style.backgroundImage = "url("+url+")";
    }
  }, function(error){
    switch (error.code){
      case 'storage/object-not-found':
        console.log("not found");
        break;
    }
  });

  // setting the name in profile content
  userRef.child("name").once('value').then(function(snapshot){
    var name = snapshot.val();
    var nameText = document.getElementById("name");
    nameText.innerHTML = name;
  });

  // setting the email in profile content
  userRef.child("email").once('value').then(function(snapshot){
    var email = snapshot.val();
    var emailText = document.getElementById("email");
    emailText.innerHTML = email;
    spinner.style.display = "none";
    mainContainer.style.display = "block";
  });
}

function uploadProfileImage(){
  var userImageRef = profileImageRef.child(userID);
  console.log(userID);
  var inputfile = document.getElementById("upload-profile-image");
  inputfile.click();
  inputfile.addEventListener('change', function(){
    var image = inputfile.files[0];
    userImageRef.put(image).then(function(snapshot){
      spinner.style.display = "block";
      console.log("uploaded");
      initProfile();
    });
  });
}
