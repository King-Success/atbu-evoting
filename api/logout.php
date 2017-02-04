<?php
header('Content-Type: application/json');

$headers = null;
if (isset($_SERVER['Authorization'])) {
    $headers = trim($_SERVER["Authorization"]);
} else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
    $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
} elseif (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
    // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
    $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
    //print_r($requestHeaders);
    if (isset($requestHeaders['Authorization'])) {
        $headers = trim($requestHeaders['Authorization']);
    }
}

if (!empty($headers)) {
    if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        //return $matches[1];
    }
} else {
	header('HTTP/1.0 401 Unauthorized');
	exit(0);
}

$user_id = $_POST['id'];

if(!($username==='')) {
    $servername = "localhost";
    $user = "root";
    $pass = "sadon4me2";
    $dbname = "sugatbu_evoting_kwasu";
    $hash = '';

    $conn = new mysqli($servername, $user, $pass, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $stmt = $conn->prepare("UPDATE users set user_token=null WHERE id=?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    if($stmt->errno) {
        http_response_code(400);
        $response = array("status"=>false, "message"=>$stmt->error);
        echo json_encode($response, JSON_FORCE_OBJECT);
    } else {
        http_response_code(200);
        setCookie("evoting_domain", "", time() - 3600);
        setCookie("evoting_user_id", "", time() - 3600);
        setCookie("evoting_user_role", "", time() - 3600);
        setCookie("evoting_user_token", "", time() - 3600);
        $response = array("status"=>false, "message"=>"You are logged out. Redirecting...");
        echo json_encode($response, JSON_FORCE_OBJECT);
    }
    $stmt->close();
    $conn->close();
} else {
    http_response_code(400);
    $response = array("status"=>false, "message"=>"Username cannot be empty");
    echo json_encode($response, JSON_FORCE_OBJECT);
}
