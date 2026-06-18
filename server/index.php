<?php



header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

header("Content-Type: application/json; charset=UTF-8");



// Si es una petición OPTIONS (Preflight), respondemos con un 200 limpio y salimos

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

http_response_code(200);

exit();

}



// 2. CONFIGURACIÓN DE CONEXIÓN A AIVEN

$host = 'mysql-aee151-tienda-api-ramirez.j.aivencloud.com';

$db = 'defaultdb';

$user = 'avnadmin';

$pass = 'AVNS_TFN4BJdcEpy2mKAGTNH';

$port = '25380';



try {

$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [

PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,

PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC

]);

} catch (PDOException $e) {

echo json_encode(["status" => "error", "message" => "Error de conexión: " . $e->getMessage()]);

exit;

}



// --- BLOQUE PARA CREAR LAS TABLAS AUTOMÁTICAMENTE EN AIVEN SI NO EXISTEN ---

try {

// 1. Crear tabla de usuarios

$pdo->exec("CREATE TABLE IF NOT EXISTS usuarios (

id INT AUTO_INCREMENT PRIMARY KEY,

nombre VARCHAR(100) NOT NULL,

correo VARCHAR(100) NOT NULL UNIQUE,

password VARCHAR(255) NOT NULL,

rol VARCHAR(20) DEFAULT 'cliente'

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");



// 2. Crear tabla de productos (Se añade columna marca y descripcion)

$pdo->exec("CREATE TABLE IF NOT EXISTS productos (

id INT AUTO_INCREMENT PRIMARY KEY,

nombre VARCHAR(100) NOT NULL,

marca VARCHAR(50) NULL,

descripcion TEXT NULL,

precio DECIMAL(10,2) NOT NULL,

stock INT NOT NULL,

imagen VARCHAR(500) NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");



// 3. Crear tabla de ventas

$pdo->exec("CREATE TABLE IF NOT EXISTS ventas (

id INT AUTO_INCREMENT PRIMARY KEY,

cliente VARCHAR(100) NOT NULL,

dispositivo VARCHAR(100) NOT NULL,

cantidad INT NOT NULL,

total DECIMAL(10,2) NOT NULL,

fecha DATETIME NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");



// 4. Inyectar administradores base si no existen

$checkAdmin = $pdo->query("SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1");

if (!$checkAdmin->fetch()) {

$pdo->exec("INSERT INTO usuarios (nombre, correo, password, rol) VALUES

('Oscar Ramirez', 'oscar@tienda.com', 'admin123', 'admin'),

('Admin General', 'admin2@tienda.com', 'admin456', 'admin');");

}



// 5. Insertar tus tres dispositivos con las imágenes reales y stock de 100 si está vacía

$checkProd = $pdo->query("SELECT id FROM productos LIMIT 1");

if (!$checkProd->fetch()) {

$pdo->exec("INSERT INTO productos (nombre, marca, descripcion, precio, stock, imagen) VALUES

('iPhone 15 Pro Max', 'Apple', 'Chip A17 Pro, titanio y cámara de 5x.', 25999.00, 100, 'https://www.thestreet.com/.image/MjAwOTA4NzI4MTg5MzMwNjM2/2-apple-iphone-15-pro-and-iphone-15-pro-max-review.jpg?profile=w828&ar=4-3'),

('Samsung Galaxy S24 Ultra', 'Samsung', 'Galaxy AI, S-Pen integrado y Snapdragon 8 Gen 3.', 22499.00, 100, 'https://fdn.gsmarena.com/imgroot/reviews/24/samsung-galaxy-s24-ultra/lifestyle/-1024w2/gsmarena_009.jpg'),

('Xiaomi 14 Ultra', 'Xiaomi', 'Lentes Leica, sensor de 1 pulgada y carga ultrarrápida.', 18999.00, 100, 'https://www.movilzona.es/app/uploads-movilzona.es/2024/02/xiaomi-14-ultra-diseno-blanco.jpg');");

}

} catch (PDOException $e) {

// Manejo de errores silencioso para mantener la API activa

}

// --------------------------------------------------------------------------



// 3. Leer el JSON enviado por React

$json_input = file_get_contents("php://input");

$data = json_decode($json_input, true);

$action = $_GET['action'] ?? '';





switch ($action) {

case 'login':

$correo = $data['correo'] ?? '';

$password = $data['password'] ?? '';



if (empty($correo) || empty($password)) {

echo json_encode(["status" => "error", "message" => "Faltan datos."]);

break;

}



$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");

$stmt->execute([$correo]);

$usuario = $stmt->fetch();



if ($usuario && $usuario['password'] === $password) {

echo json_encode([

"status" => "success",

"usuario" => [

"id" => $usuario['id'],

"nombre" => $usuario['nombre'],

"correo" => $usuario['correo'],

"rol" => $usuario['rol'] ?? 'cliente'

]

]);

} else {

echo json_encode(["status" => "error", "message" => "Correo o contraseña incorrectos."]);

}

break;



case 'registro':

$nombre = $data['nombre'] ?? '';

$correo = $data['correo'] ?? '';

$password = $data['password'] ?? '';



if (empty($nombre) || empty($correo) || empty($password)) {

echo json_encode(["status" => "error", "message" => "Por favor llena todos los campos."]);

break;

}



try {

$check = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");

$check->execute([$correo]);

if ($check->fetch()) {

echo json_encode(["status" => "error", "message" => "El correo ya está registrado."]);

break;

}



$stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, 'cliente')");

$stmt->execute([$nombre, $correo, $password]);



echo json_encode(["status" => "success", "message" => "Usuario registrado correctamente."]);

} catch (PDOException $e) {

echo json_encode(["status" => "error", "message" => "Error al registrar: " . $e->getMessage()]);

}

break;



case 'obtener_productos':

try {

$stmt = $pdo->query("SELECT * FROM productos ORDER BY id DESC");

$productos = $stmt->fetchAll();

echo json_encode($productos);

} catch (PDOException $e) {

echo json_encode(["status" => "error", "message" => $e->getMessage()]);

}

break;



case 'obtener_ventas':

try {

$stmt = $pdo->query("SELECT * FROM ventas ORDER BY id DESC");

$ventas = $stmt->fetchAll();

echo json_encode($ventas);

} catch (PDOException $e) {

echo json_encode(["status" => "error", "message" => $e->getMessage()]);

}

break;



case 'registrar_venta':

$total = floatval($data['total'] ?? 0);

$carrito = $data['carrito'] ?? [];

$fecha = date('Y-m-d H:i:s');



$usuarioId = $data['usuario_id'] ?? null;

$clienteNombre = 'Cliente General';

if ($usuarioId) {

$stmtU = $pdo->prepare("SELECT nombre FROM usuarios WHERE id = ?");

$stmtU->execute([$usuarioId]);

$resU = $stmtU->fetch();

if ($resU) $clienteNombre = $resU['nombre'];

}



if (empty($carrito) || $total <= 0) {

echo json_encode(["status" => "error", "message" => "El carrito está vacío o el total es cero."]);

break;

}



try {

$pdo->beginTransaction();



foreach ($carrito as $item) {

$nombreDisp = $item['nombre'];

$precioDisp = floatval($item['precio']);



$stmtVenta = $pdo->prepare("INSERT INTO ventas (cliente, dispositivo, cantidad, total, fecha) VALUES (?, ?, 1, ?, ?)");

$stmtVenta->execute([$clienteNombre, $nombreDisp, $precioDisp, $fecha]);



$stmtStock = $pdo->prepare("UPDATE productos SET stock = stock - 1 WHERE nombre = ? AND stock >= 1");

$stmtStock->execute([$nombreDisp]);

}



$pdo->commit();

echo json_encode(["status" => "success", "message" => "¡Venta registrada con éxito en Aiven!"]);

} catch (PDOException $e) {

$pdo->rollBack();

echo json_encode(["status" => "error", "message" => "Error al impactar base de datos: " . $e->getMessage()]);

}

break;



case 'crear_producto':

$nombre = $data['nombre'] ?? '';

$marca = $data['marca'] ?? '';

$descripcion = $data['descripcion'] ?? '';

$precio = floatval($data['precio'] ?? 0);

$stock = intval($data['stock'] ?? 0);

$imagen = !empty($data['imagen']) ? $data['imagen'] : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';



if (empty($nombre) || empty($marca) || $precio <= 0 || $stock < 0) {

echo json_encode(["status" => "error", "message" => "Campos obligatorios inválidos o incompletos."]);

break;

}



try {

$stmt = $pdo->prepare("INSERT INTO productos (nombre, marca, descripcion, precio, stock, imagen) VALUES (?, ?, ?, ?, ?, ?)");

$stmt->execute([$nombre, $marca, $descripcion, $precio, $stock, $imagen]);

echo json_encode(["status" => "success", "message" => "¡Producto insertado en el inventario de Aiven con éxito!"]);

} catch (PDOException $e) {

echo json_encode(["status" => "error", "message" => "Error al insertar producto: " . $e->getMessage()]);

}

break;



default:

echo json_encode(["status" => "error", "message" => "Acción no válida."]);

break;

}

