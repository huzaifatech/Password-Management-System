var express = require("express");
var router = express.Router();
var userModule = require("../modules/user");
var passcatModel = require("../modules/password_category");
var passwordModel = require("../modules/add_password");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
var getpasscat = passcatModel.find({});
var getallpass = passwordModel.find({});

function checkLoginUser(req, res, next) {
    var userToken = localStorage.getItem("userToken");
    try {
        var decoded = jwt.verify(userToken, "loginToken");
    } catch (err) {
        res.redirect("/");
    }
    next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require("node-localstorage").LocalStorage;
    localStorage = new LocalStorage("./scratch");
}

function checkEmail(req, res, next) {
    var email = req.body.email;
    var checkexitemail = userModule.findOne({ email: email });
    checkexitemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render("signup", { title: "Password Management System", msg: "This Email is Taken!" });
        }
        next();
    });
}
function checkUsername(req, res, next) {
    var username = req.body.username;
    var checkexituname = userModule.findOne({ username: username });
    checkexituname.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render("signup", { title: "Password Management System", msg: "This Username is Taken!" });
        }
        next();
    });
}

/* Index */
router.get("/", function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    if (loginUser) {
        res.redirect("./dashboard");
    } else {
        res.render("index", { title: "Password Management System", msg: "" });
    }
});
router.post("/", function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var checkUser = userModule.findOne({ username: username });
    checkUser.exec((err, data) => {
        if (err) throw err;
        var getuserid = data._id;
        var getpassword = data.password;
        if (bcrypt.compareSync(password, getpassword)) {
            var token = jwt.sign({ userID: getuserid }, "loginToken");
            localStorage.setItem("userToken", token);
            localStorage.setItem("loginUser", username);

            res.redirect("/dashboard");
        } else {
            res.render("index", { title: "Password Management System", msg: "Invalid Username/Password" });
        }
    });
});
/* Signup */
router.get("/signup", function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    if (loginUser) {
        res.redirect("./dashboard");
    } else {
        res.render("signup", { title: "Password Management System", msg: "" });
    }
});
router.post("/signup", checkUsername, checkEmail, function (req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var confpassword = req.body.confpassword;

    if (password != confpassword) {
        res.render("signup", { title: "Password Management System", msg: " Passwords Didn`t Matched " });
    } else {
        password = bcrypt.hashSync(password, 10);
        var userDetails = new userModule({
            username: username,
            email: email,
            password: password,
        });
        userDetails.save((err, doc) => {
            if (err) throw err;
            res.render("signup", { title: "Password Management System", msg: "User signed Successfully" });
        });
    }
});

//       logout
router.get("/logout", function (req, res, next) {
    localStorage.removeItem("userToken");
    localStorage.removeItem("loginUser");
    res.redirect("/");
});
module.exports = router;
