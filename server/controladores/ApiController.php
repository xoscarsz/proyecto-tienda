<?php


class ApiController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }


    public function obtenerProductos() {
        $stmt = $this->db->prepare("SELECT id, nombre, marca, precio, descripcion, imagen, stock FROM productos");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

 
    public function obtenerVentas() {
        $query = "SELECT v.id, u.nombre AS cliente, p.nombre AS dispositivo, v.cantidad, v.total, v.fecha 
                  FROM ventas v
                  JOIN usuarios u ON v.usuario_id = u.id
                  JOIN productos p ON v.producto_id = p.id
                  ORDER BY v.id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

 
    public function actualizarStock($data) {
        if (isset($data['id']) && isset($data['stock'])) {
            $stmt = $this->db->prepare("UPDATE productos SET stock = :stock WHERE id = :id");
            $stmt->execute([
                ':stock' => $data['stock'],
                ':id' => $data['id']
            ]);
            echo json_encode(["status" => "success", "message" => "Inventario renovado."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
        }
    }


    public function registrarProducto($data) {
        if (isset($data['nombre']) && isset($data['marca']) && isset($data['precio']) && isset($data['stock'])) {
            $query = "INSERT INTO productos (nombre, marca, precio, descripcion, imagen, stock) 
                      VALUES (:nombre, :marca, :precio, :descripcion, :imagen, :stock)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':nombre'      => $data['nombre'],
                ':marca'       => $data['marca'],
                ':precio'      => $data['precio'],
                ':descripcion' => $data['descripcion'] ?? '',
                ':imagen'      => $data['imagen'] ?? 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', // Imagen genérica si no sube una
                ':stock'       => $data['stock']
            ]);
            echo json_encode(["status" => "success", "message" => "Dispositivo dado de alta con éxito."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Faltan campos obligatorios para registrar el producto."]);
        }
    }


    public function registrarVenta($data) {
        if (isset($data['usuario_id']) && isset($data['carrito'])) {
            $this->db->beginTransaction();
            try {
                foreach ($data['carrito'] as $item) {

                    $stmtCheck = $this->db->prepare("SELECT stock FROM productos WHERE id = :pid");
                    $stmtCheck->execute([':pid' => $item['id']]);
                    $producto = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                    $cantidadComprada = $item['cantidad'] ?? 1;

                    if (!$producto || $producto['stock'] < $cantidadComprada) {
                        throw new Exception("Stock insuficiente o producto no encontrado para ID: " . $item['id']);
                    }


                    $totalPorItem = $item['precio'] * $cantidadComprada;
                    $stmtVenta = $this->db->prepare("INSERT INTO ventas (usuario_id, producto_id, cantidad, total, fecha) VALUES (:uid, :pid, :cantidad, :total, NOW())");
                    $stmtVenta->execute([
                        ':uid'      => $data['usuario_id'],
                        ':pid'      => $item['id'],
                        ':cantidad' => $cantidadComprada,
                        ':total'    => $totalPorItem
                    ]);

  
                    $stmtStock = $this->db->prepare("UPDATE productos SET stock = stock - :cantidad WHERE id = :pid");
                    $stmtStock->execute([
                        ':cantidad' => $cantidadComprada,
                        ':pid'      => $item['id']
                    ]);
                }
                
                $this->db->commit();
                echo json_encode(["status" => "success", "message" => "Venta procesada con éxito."]);
            } catch (Exception $e) {
                $this->db->rollBack();
                echo json_encode(["status" => "error", "message" => "Fallo en la transacción: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Datos de compra inválidos."]);
        }
    }
}