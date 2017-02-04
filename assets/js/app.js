if(document.cookie.indexOf("evoting_user")===-1 || document.cookie.indexOf("evoting_user_role")===-1 || document.cookie.indexOf("evoting_user_token")===-1) {
    window.location = "./";
}

$(document).ready(function() {
    // Log out
    $("#logout, #logout_2").on("click", function(event) {
        logoutUser();
    });

    $("#user").html(getCookie("evoting_user_name"));

});

function logoutUser(email) {
    deleteCookie("evoting_domain");
    deleteCookie("evoting_user");
    deleteCookie("evoting_user_name");
    deleteCookie("evoting_user_role");
    deleteCookie("evoting_user_token");
    UIkit.notification("<span uk-icon='icon: check'></span> You're logged out. Redirecting...", "success", "top-right");
    setTimeout(function(){ window.location = "./"; }, 2000);
    /*
    $.ajax({
        url: domain+"api/user/logout",
        type: 'POST',
        data: {"email":email}
    })
    .done(function (response) {
        $('#message_wrapper').html('<div class="ui icon success message"><i class="notched circle loading icon"></i><div class="content"><div class="header">'+response.message+'</div><p>Redirecting...</p></div></div><br>');
        deleteCookie("nitp_domain");
        deleteCookie("nitp_user_email");
        deleteCookie("nitp_user_permission");
        setTimeout(function(){ window.location = "../"; }, 2000);
    })
    .fail(function(response) {
        $('#message_wrapper').html('<div class="ui icon error message"><i class="remove icon"></i><div class="content"><div class="header">Oops!</div><p>Something went wrong.</p></div></div>');
        $('#message_wrapper').transition('tada');
    });
    */
}
