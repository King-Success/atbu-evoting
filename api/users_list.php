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

$role_id = $_POST['role_id'];

if(!($role_id==='')) {
    $servername = "localhost";
    $user = "root";
    $pass = "sadon4me2";
    $dbname = "sugatbu_evoting_kwasu";
    $hash = '';

    $conn = new mysqli($servername, $user, $pass, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $stmt = $conn->prepare('SELECT * FROM users WHERE role_id = ?');
    $stmt->bind_param('s', $role_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0) {
        http_response_code(200);
        # code...
        $arr = [];
        $inc = 0;
        while ($row = $result->fetch_assoc()) {
            # code...
            $jsonArrayObject = (array('id' => $row["id"], 'username' => $row["username"], 'fullname' => $row["name"], "email"=>$row["email"]));
            $arr[$inc] = $jsonArrayObject;
            $inc++;
        }
        echo json_encode($arr);
        /*
        $response = array("message"=>"Users list fetched", "users"=>$arr);
        echo json_encode($response, JSON_FORCE_OBJECT);
        */
    } else {
        http_response_code(400);
        $response = array("status"=>false, "message"=>"No users found");
        echo json_encode($response, JSON_FORCE_OBJECT);
    }

    $stmt->close();
    $conn->close();

} else {
    http_response_code(400);
    $response = array("status"=>false, "message"=>"User type not specified");
    echo json_encode($response, JSON_FORCE_OBJECT);
}
