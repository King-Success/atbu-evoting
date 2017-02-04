<?php
header('Content-Type: application/json');

$username = $_POST['username'];
$password = $_POST['password'];

if(!($username==='' || $password==='')) {
    $servername = "localhost";
    $user = "root";
    $pass = "sadon4me2";
    $dbname = "sugatbu_evoting_kwasu";
    $hash = '';

    $conn = new mysqli($servername, $user, $pass, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $stmt = $conn->prepare('SELECT * FROM users WHERE username = ?');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    if($result->num_rows > 0) {
        require 'bcrypt.php';
        $bcrypt = new Bcrypt(10);
        //$hash = $bcrypt->hash($password);
        while ($row = $result->fetch_assoc()) {
            $isGood = $bcrypt->verify($password, $row['password']);
            if ($isGood) {
                $secretKey = "#hassan".date(hms)."[/\]!@";
                $data = time()."_".$username."-".$row["role_id"];
                /* Create a part of token using secretKey and other stuff */
                $tokenGeneric = $secretKey.$_SERVER["SERVER_NAME"]; // It can be 'stronger' of course
                /* Encoding token */
                $user_token = hash('sha256', $tokenGeneric.$data);
                $stmt = $conn->prepare("UPDATE users set user_token = ? WHERE username = ?");
                $stmt->bind_param("ss", $user_token, $username);
                $stmt->execute();
                if($stmt->errno) {
                    http_response_code(400);
                    $response = array("status"=>false, "message"=>$stmt->error);
                    echo json_encode($response, JSON_FORCE_OBJECT);
                } else {
                    http_response_code(200);
                    $response = array("status"=>false, "message"=>"User authenticated. Logging in...", "user"=>array("id"=>$row['id'], "username"=>$row["username"], "fullname"=>$row["name"], "role_id"=>$row["role_id"], "token"=>$user_token));
                    echo json_encode($response, JSON_FORCE_OBJECT);
                }
            } else {
                http_response_code(400);
                $response = array("status"=>false, "message"=>"Username or password is incorrect");
                echo json_encode($response, JSON_FORCE_OBJECT);
            }
        }
    } else {
        http_response_code(400);
        $response = array("status"=>false, "message"=>"Username or password is incorrect");
        echo json_encode($response, JSON_FORCE_OBJECT);
    }
    $stmt->close();
    $conn->close();
} else {
    http_response_code(400);
    $response = array("status"=>false, "message"=>"Username or password cannot be empty");
    echo json_encode($response, JSON_FORCE_OBJECT);
}
