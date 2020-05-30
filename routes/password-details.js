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


//       view all password
router.get("/", checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    var options = {
        offset: 1,
        limit: 3,
    };
    passwordModel.paginate({}, options).then(function (result) {
        console.log(result);
        res.render("view-all-password", { title: "Password Management System", loginUser: loginUser, records: result.docs, current: result.offset, pages: Math.ceil(result.total / result.limit) });
    });
});

//       view all password
router.get("/:page", checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");

    var perPage = 3;
    var page = req.params.page || 1;

    getallpass
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec(function (err, data) {
            if (err) throw err;
            passwordModel.countDocuments({}).exec((err, count) => {
                res.render("view-all-password", { title: "Password Management System", loginUser: loginUser, records: data, current: page, pages: Math.ceil(count / perPage) });
            });
        });
});



router.get("/", checkLoginUser, function (req, res, next) {
    res.redirect("/dashboard");
});
router.get("/edit/:id", checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    var id = req.params.id;
    var getpassdetail = passwordModel.findById({ _id: id });
    getpassdetail.exec(function (err, data) {
        if (err) throw err;
        getpasscat.exec(function (err, data1) {
            res.render("edit_pass_details", { title: "Password Management System", loginUser: loginUser, record: data, records: data1, success: "" });
        });
    });
});
router.post("/edit/:id", checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    var id = req.params.id;
    var passcat = req.body.pass_cat;
    var project_name = req.body.project_name;
    var pass_details = req.body.pass_details;
    passwordModel.findByIdAndUpdate(id, { password_category: passcat, project_name: project_name, password_details: pass_details }).exec(function (err) {
        if (err) throw err;
        var getpassdetail = passwordModel.findById({ _id: id });
        getpassdetail.exec(function (err, data) {
            if (err) throw err;
            getpasscat.exec(function (err, data1) {
                res.render("edit_pass_details", { title: "Password Management System", loginUser: loginUser, record: data, records: data1, success: "Password Updated Successfully" });
            });
        });
    });
});
//    delete
router.get("/delete/:id", checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
    var id = req.params.id;
    var passdelete = passwordModel.findByIdAndDelete(id);
    passdelete.exec(function (err) {
        if (err) throw err;
        res.redirect("/view-all-password");
    });
});

module.exports = router;