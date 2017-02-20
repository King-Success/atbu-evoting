$(document).ready(function() {
    $("#page_content").load("pages/index/index.html");

    // Log in
    $("#login").on("click", function(event) {
        event.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();
        loginUser(username, password);
    });

});

function loginUser(username, password) {
    $.ajax({
        beforeSend: function(xhr) {
          $("#login").attr("hidden", true);
          $("#spinner").attr("hidden", false);
        },
        url: window.location+"api/v1/authenticate",
        type: "POST",
        data: {"username":username, "password":password}
    })
    .done(function(response) {
        setCookie("evoting_domain", window.location, 1);
        setCookie("evoting_user_id", response.user.id, 1);
        setCookie("evoting_user_role", response.user.role_id, 1);
        setCookie("evoting_user_token", response.user.token, 1);
        UIkit.notification("<span uk-icon='icon: check'></span> "+response.message, "success", "top-right");
        setTimeout(function(){ window.location = "dashboard"; }, 3000);
    })
    .fail(function(response) {
        UIkit.notification("<span uk-icon='icon: warning'></span> "+response.responseJSON.message, "danger", "top-right");
        $("#login").attr("hidden", false);
        $("#spinner").attr("hidden", true);
    });
}
