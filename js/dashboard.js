var userID = "";
var DBRef = firebase.database().ref();
var userRef;
var profileImageRef = firebase.storage().ref().child("profile-images");
var spinner = document.getElementById("main-spinner");
var mainContainer = document.getElementById("main-container");

var tutors = {};

const subjectKeyMap = {
  "ib-hl-comsci": "IB HL Computer Science",
  "ib-sl-comsci": "IB SL Computer Science",
  "igcse-maths": "IGCSE Mathematics"
};

const sessionTimeKeyMap = {
  "mon-lunch": "Monday Lunch (1:25 - 2:25)",
  "tue-lunch": "Tuesday Lunch (1:25 - 2:25)",
  "wed-lunch": "Wednesday Lunch (1:25 - 2:25)",
  "thu-lunch": "Thursday Lunch (1:25 - 2:25)",
  "fri-lunch": "Friday Lunch (1:25 - 2:25)",
  "mon-aftsch": "Monday After School (3:30 - 4:30)",
  "tue-aftsch": "Tuesday After School (3:30 - 4:30)",
  "wed-aftsch": "Wednesday After School (3:30 - 4:30)",
  "thu-aftsch": "Thursday After School (3:30 - 4:30)",
  "fri-aftsch": "Friday After School (3:30 - 4:30)"
};

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

  // generating and adding all tutor cards
  generateTutorCards();

});

function initProfile(){
  // setting the profile picture
  var image = profileImageRef.child(userID);
  image.getDownloadURL().then(function(url){
    console.log(url);
    var updates = {}
    updates['Users/'+userID+'/profileImgDwldURL'] = url;
    DBRef.update(updates);
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

function toggleTutorModal(event){
  var tutorModal = document.getElementById("tutor-modal");
  if (tutorModal.style.display == "block"){
    tutorModal.style.display = "none";
  } else if (tutorModal.style.display == "none"){
    event.preventDefault();
    var tutorID = event.currentTarget.id;
    console.log(tutorID);
    createTutorModal(tutorID);
  }
}


function generateTutorCards(){
  DBRef.child('Tutors').on('value', function(snapshot){
    tutors = snapshot.val();
    const topTutorsSection = document.getElementById("toptutors-section-container");
    while (topTutorsSection.firstChild) {
      topTutorsSection.removeChild(topTutorsSection.firstChild);
    }
    for (var tutorID in tutors){

      // getting relevant data
      tutorData = tutors[tutorID];
      var languages = tutorData["Languages"].split(",");
      var subjects = tutorData["Subjects"].split(",");
      for (var item in subjects){
        subjects[item] = subjectKeyMap[subjects[item]];
      }
      var rating = tutorData["Rating"];
      var name = tutorData["Name"];
      var description = tutorData["Description"];
      var sessions = tutorData["Sessions"];
      var imgURL = tutorData["profileImgURL"];

      // creating the card
      var tutorCardContainer = document.createElement("div");
      tutorCardContainer.setAttribute("id", tutorID);
      tutorCardContainer.setAttribute("class", "tutor-card-container tutor-card");
      tutorCardContainer.setAttribute("onclick", "toggleTutorModal(event)");

      var tutorCardImage = document.createElement("div");
      tutorCardImage.setAttribute("class", "tutor-image tutor-card");
      //tutorCardImage.setAttribute("id", tutorID+"-image");
      tutorCardImage.style.backgroundImage = "url('"+imgURL+"')";

      var tutorCardMeta = document.createElement("div");
      tutorCardMeta.setAttribute("class", "tutor-card-meta tutor-card");

      tutorCardContainer.appendChild(tutorCardImage);
      tutorCardContainer.appendChild(tutorCardMeta);

      // creating the data to the card
      var nameP = document.createElement("p");
      nameP.setAttribute("class", "tutor-name tutor-text tutor-flex-items");
      nameP.innerHTML = name;
      var subjectsP = document.createElement("p");
      subjectsP.setAttribute("class", "tutor-subjects tutor-text tutor-flex-items");
      subjectsP.innerHTML = "<b>Subjects: </b>" + subjects.join(", ");
      var languagesP = document.createElement("p");
      languagesP.setAttribute("class", "tutor-languages tutor-text tutor-flex-items");
      languagesP.innerHTML = "<b>Languages: </b>" + languages.join(", ");

      // adding data to the card
      tutorCardMeta.appendChild(nameP);
      tutorCardMeta.appendChild(subjectsP);
      tutorCardMeta.appendChild(languagesP);

      // creating ratings div
      var ratingDiv = document.createElement("div");
      ratingDiv.setAttribute("class", "tutor-ratings tutor-flex-items");
      for (var i=0; i<5; i++){
       var star = document.createElement("span");
       //check if star should be coloured or not
       if (i<rating){
         star.setAttribute("class", "fa fa-star checked");
       } else{
         star.setAttribute("class", "fa fa-star");
       }
       ratingDiv.appendChild(star);
      }

      // adding rating div to card
      tutorCardMeta.appendChild(ratingDiv);

      // adding the card to the section container
      topTutorsSection.appendChild(tutorCardContainer);
    }
  });
}

function createTutorModal(tutorID){
  tutor = tutors[tutorID];
  document.getElementById("modal-tutor-image").src = tutor["profileImgURL"];
  console.log(tutor);
  document.getElementById("modal-tutor-name").innerHTML = tutor["Name"];
  var subjects = tutor["Subjects"].split(",");
  var languages = tutor["Languages"].split(",");
  var sessions = tutor["Sessions"];

  // add subjects into dropdown list
  var sessionSubjectSelect = document.getElementById("session-subject-select");
  while (sessionSubjectSelect.firstChild) {
    sessionSubjectSelect.removeChild(sessionSubjectSelect.firstChild);
  }
  for (var index in subjects){
    var subjectOption = document.createElement("option");
    subjectOption.setAttribute("id", subjects[index]);
    subjects[index] = subjectKeyMap[subjects[index]];
    subjectOption.innerHTML = subjects[index];
    sessionSubjectSelect.appendChild(subjectOption);
  }

  // add languages into dropdown list
  var sessionLanguageSelect = document.getElementById("session-language-select");
  while (sessionLanguageSelect.firstChild) {
    sessionLanguageSelect.removeChild(sessionLanguageSelect.firstChild);
  }
  for (var index in languages){
    var languageOption = document.createElement("option");
    languageOption.setAttribute("id", languages[index]);
    languageOption.innerHTML = languages[index];
    sessionLanguageSelect.appendChild(languageOption);
  }

  // add session times into dropdown list
  var sessionTimeSelect = document.getElementById("session-time-select");
  while (sessionTimeSelect.firstChild) {
    sessionTimeSelect.removeChild(sessionTimeSelect.firstChild);
  }
  for (var session in sessions){
    if (sessions[session] == true){
      var option = document.createElement("option");
      option.setAttribute("id", session);
      option.innerHTML = sessionTimeKeyMap[session];
      sessionTimeSelect.appendChild(option);
    }
  }

  document.getElementById("modal-tutor-subjects").innerHTML = subjects.join(", ");
  document.getElementById("modal-tutor-languages").innerHTML = languages.join(", ");
  document.getElementById("modal-tutor-description").innerHTML = tutor["Description"];
  document.getElementById("tutor-modal").style.display = "block";
}
