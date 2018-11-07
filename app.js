document.addEventListener('DOMContentLoaded', function(){
  var db = firebase.database().ref();

  const loginBox = document.getElementById("user-login");
  const signupBox = document.getElementById("user-signup");

  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");

  const loginSignupBtn = document.getElementById("login-signup-btn");
  const signupLoginBtn = document.getElementById("signup-login-btn");

  const loginEmailField = document.getElementById("login-email");
  const loginPwdField = document.getElementById("login-pwd");

  const signupName = document.getElementById("signup-name");
  const signupEmailField = document.getElementById("signup-email");
  const signupPwdField = document.getElementById("signup-pwd");

  loginSignupBtn.onclick = function(){
    loginBox.style.display = "none";
    signupBox.style.display = "block";
  }

  signupLoginBtn.onclick = function(){
    signupBox.style.display = "none";
    loginBox.style.display = "block";
  }

  loginBtn.onclick = function(){
    var login = firebase.auth().signInWithEmailAndPassword(loginEmailField.value, loginPwdField.value);
    login.catch(function(err){
      console.log("error");
    });
    login.then(function(user){
      window.location = "html/dashboard.html";
    });
  }

  signupBtn.onclick = function(){
    var signup = firebase.auth().createUserWithEmailAndPassword(signupEmailField.value, signupPwdField.value);
    signup.catch(function(err){
      console.log("error");
    });
    signup.then(function(user){
      var id = user.user.uid;

      db.child('Users').child(id).set({
        'name': signupName.value,
        'userID': id,
        'email': signupEmailField.value,
        'pwd': signupPwdField.value,
      });

      window.location = "html/dashboard.html";
    });
  }
});
