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
//      add new category
router.get("/", checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    res.render("addnewcategory", { title: "Password Management System",success:'', loginUser: loginUser, errors: "" });
});

router.post("/", checkLoginUser, [check("passwordCategory", "Enter Password Category Name").isLength({ min: 1 })], function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render("addnewcategory", { title: "Password Management System", loginUser: loginUser, errors: errors.mapped() });
    } else {
        var passCatName = req.body.passwordCategory;
        var passCatDetails = new passcatModel({
            password_category: passCatName,
        });
        passCatDetails.save(function (err, doc) {
            if (err) throw err;
            res.render("addnewcategory", { title: "Password Management System", loginUser: loginUser, errors: "", success: "Password Category Inserted" });
        });
    }
});


module.exports = router;
