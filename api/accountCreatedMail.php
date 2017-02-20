<?php
header('Content-Type: application/json');

/**
 * Get hearder Authorization
 * */
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

$password = $_POST['password'];

if(!($password==='')) {
    require 'bcrypt.php';
    $bcrypt = new Bcrypt(10);
    $hash = $bcrypt->hash($password);
    http_response_code(200);
    $response = array("status"=>true, "message"=>"Successful", "hashed_password"=>$hash);
    echo json_encode($response, JSON_FORCE_OBJECT);
} else {
    http_response_code(400);
    $response = array("status"=>false, "message"=>"Password to be hashed cannot be empty");
    echo json_encode($response, JSON_FORCE_OBJECT);
}
