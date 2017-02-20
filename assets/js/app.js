if(document.cookie.indexOf("evoting_domain")===-1 || document.cookie.indexOf("evoting_user_id")===-1 || document.cookie.indexOf("evoting_user_role")===-1 || document.cookie.indexOf("evoting_user_token")===-1) {
    window.location = "./";
}

var domain = getCookie("evoting_domain");
var user_id = getCookie("evoting_user_id");
var user_token = getCookie("evoting_user_token");
var user_role = getCookie("evoting_user_role");

loadProfile();

$(document).ready(function() {
    loadDashboard();

    $("#logout, #logout_2").on("click", function(event) {
        logoutUser();
    });

    $("#page_content").on("click", "#backToDash", function(event) {
        $("#page_content").removeClass("uk-animation-slide-right");
        $("#page_content").html("");
        loadDashboard();
    });

    $("#page_content").on("click", "#change_password", function(event) {
        $("#page_content").removeClass("uk-animation-slide-right");
        $("#page_content").html("");
        $("#page_content").addClass("uk-animation-slide-right");
        $("#page_content").load("pages/dash/password.html");
    });

    $("#page_content").on("click", "#admins", function(event) {
        $("#page_content").removeClass("uk-animation-slide-right");
        $("#page_content").html("");
        $("#page_content").addClass("uk-animation-slide-right");
        $("#page_content").load("pages/dash/admins.html");
        getAdmins();
    });

    $("#page_content").on("click", "#add_admin", function(event) {
        event.preventDefault();
        var username = $("#admin_username").val();
        var fullname = $("#admin_fullname").val();
        var email = $("#admin_email").val();
        addAdmin(username, fullname, email);
    })

});

function loadProfile() {
    $.ajax({
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer "+getCookie("evoting_user_token"));
        },
        url: domain+"api/v1/users/"+user_id,
        type: "GET",
    })
    .done(function(response) {
        $("#user").html(response.name);
    })
    .fail(function(response) {
        UIkit.notification("<span uk-icon='icon: warning'></span> Error loading profile. Please refresh page", "warning", "top-right");
    });
}

function loadDashboard() {
    if(user_role==="0") {
        $("#page_content").addClass("uk-animation-scale-up");
        $("#page_content").load("pages/dash/dashboard_links.html #super_user");
    }
}

function getAdmins() {
    var adminUsers = [];
    $.ajax({
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer "+user_token);
        },
        url: domain+"api/v1/userlist",
        type: "POST",
        dataType: "json",
        data: {"role_id":"1"}
    })
    .done(function(response) {
        populateUsers(response);
    })
    .fail(function(response) {
        console.log(response);
    });
}

function populateUsers(users) {
    var count = 1;
    var table = document.createElement("table");
    table.id = "admin_list_table";
    table.className = "uk-table";

    var thead = document.createElement("thead");
    var tr_h = document.createElement("tr");
    var th_sno = document.createElement("th");
    th_sno.innerHTML = "S/No";
    var th_username = document.createElement("th");
    th_username.innerHTML = "Username";
    var th_fullname = document.createElement("th");
    th_fullname.innerHTML = "Full Name";
    var th_email = document.createElement("th");
    th_email.innerHTML = "Email Address";

    tr_h.appendChild(th_sno);
    tr_h.appendChild(th_username);
    tr_h.appendChild(th_fullname);
    tr_h.appendChild(th_email);
    thead.appendChild(tr_h);

    var tbody = document.createElement("tbody");
    tbody.id = "admin_list_tbody";
    tbody.innerHTML = "";

    if (users) {
        users.forEach(function(users) {
            var id = users.id;
            var username = users.username;
            var fullname = users.fullname;
            var email = users.email;

            var tr = document.createElement("tr");
            tr.id = username;

            var countTd = document.createElement("td");
            countTd.innerHTML = count++;

            var usernameTd = document.createElement("td");
            usernameTd.id = username + "-username";
            usernameTd.innerHTML = username;

            var fullnameTd = document.createElement("td");
            fullnameTd.id = username + "-fullname";
            fullnameTd.innerHTML = fullname;

            var emailTd = document.createElement("td");
            emailTd.id = username + "-email";
            emailTd.innerHTML = email;

            var deleteLink = document.createElement("a");
            deleteLink.id = username + "-id";
            deleteLink.setAttribute("onclick", "deleteUser('" + id + "')");
            deleteLink.setAttribute("uk-icon", "icon: trash");

            var actionTd = document.createElement("td");
            actionTd.appendChild(deleteLink);

            tr.appendChild(countTd);
            tr.appendChild(usernameTd);
            tr.appendChild(fullnameTd);
            tr.appendChild(emailTd);
            tr.appendChild(actionTd);

            tbody.appendChild(tr);
        });
    } else {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.innerHTML = "No users";
        td.className = "center";
        td.setAttribute("colspan", "5");
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    table.appendChild(thead);
    table.appendChild(tbody);

    $("#admin_list_div").html(table);
}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function addAdmin(username, fullname, email) {
    var password = generatePassword();
    $.ajax({
        beforeSend: function(xhr) {
            $("#add_admin").attr("hidden", true);
            $("#admin_spinner").attr("hidden", false);
            xhr.setRequestHeader("Authorization", "Bearer "+user_token);
        },
        url: domain+"api/v1/password",
        type: "POST",
        dataType: "json",
        data: {"password":password}
    })
    .done(function(response) {
        var hashed_password = response.hashed_password;
        $.ajax({
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", "Bearer "+user_token);
            },
            url: domain+"api/v1/users",
            type: "POST",
            data: {"name":fullname, "username":username, "email":email, "password":hashed_password, "role_id":"1"}
        })
        .done(function(response) {
            UIkit.notification("<span uk-icon='icon: check'></span> Administrator added", "success", "top-right");
            $("#add_admin").attr("hidden", false);
            $("#admin_spinner").attr("hidden", true);
            getAdmins();
        })
        .fail(function(response) {
            UIkit.notification("<span uk-icon='icon: warning'></span> "+response.responseJSON.message, "danger", "top-right");
            $("#add_admin").attr("hidden", false);
            $("#admin_spinner").attr("hidden", true);
        });
    })
    .fail(function(response) {
        $("#add_admin").attr("hidden", false);
        $("#admin_spinner").attr("hidden", true);
    });
}

function logoutUser() {
    $.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization", "Bearer "+user_token);
        },
        url: domain+"api/v1/logout",
        type: 'POST',
        data: {"id":user_id}
    })
    .done(function (response) {
        UIkit.notification("<span uk-icon='icon: check'></span> "+response.message, "success", "top-right");
        deleteCookie("evoting_domain");
        deleteCookie("evoting_user_id");
        deleteCookie("evoting_user_role");
        deleteCookie("evoting_user_token");
        setTimeout(function(){ window.location = "./"; }, 2000);
    })
    .fail(function(response) {
        UIkit.notification("<span uk-icon='icon: danger'></span> "+response.responseJSON.message, "danger", "top-right");
    });
}
