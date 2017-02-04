if(document.cookie.indexOf("evoting_domain")===-1 || document.cookie.indexOf("evoting_user_id")===-1 || document.cookie.indexOf("evoting_user_role")===-1 || document.cookie.indexOf("evoting_user_token")===-1) {
    window.location = "./";
}

var domain = getCookie("evoting_domain");
var user_id = getCookie("evoting_user_id");
var user_token = getCookie("evoting_user_token");
var user_role = getCookie("evoting_user_role");

loadProfile();

$(document).ready(function() {
    // Log out
    $("#logout, #logout_2").on("click", function(event) {
        logoutUser();
    });

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

function logoutUser() {
    $.ajax({
        beforeSend: function(xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + user_token);
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
        console.log(response);
        UIkit.notification("<span uk-icon='icon: danger'></span> "+response.responseJSON.message, "danger", "top-right");
    });
}
