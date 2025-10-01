const express = require("express");
const { ProductManager } = require("./dao/ProductManager.js");

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ProductManager.path = "./src/data/productos.json";

app.get("/", (req, res) => {
  let homeHtml = `
    <h1>Home Productos</h1>
    <hr>
    <p>Usá /productos para ver la lista o agregar ?cantidad= para limitar</p>
  `;
  res.send(homeHtml);
});

app.get("/productos", async (req, res) => {
  let { cantidad } = req.query;

  try {
    let productos = await ProductManager.obtenerProductos();

    if (cantidad) {
      if (isNaN(Number(cantidad)) || Number(cantidad) > productos.length) {
        res.send(`Error en la cantidad (no numérica o supera la cantidad de productos, igual a ${productos.length})`);
        return;
      }
      productos = productos.slice(0, cantidad);
    }

    res.send(productos);
  } catch (error) {
    res.send(`Error al obtener productos`);
  }
});

app.get("/productos/:id", async (req, res) => {
  try {
    let producto = await ProductManager.obtenerProductoPorId(Number(req.params.id));
    producto ? res.send(producto) : res.status(404).send("Producto no encontrado");
  } catch (error) {
    res.send("Error al buscar producto");
  }
});

app.post("/productos", async (req, res) => {
  try {
    let nuevo = await ProductManager.agregarProducto(req.body);
    res.status(201).send(nuevo);
  } catch (error) {
    res.send(`Error al agregar producto: ${error.message}`);
  }
});

app.put("/productos/:id", async (req, res) => {
  try {
    let actualizado = await ProductManager.actualizarProducto(Number(req.params.id), req.body);
    res.send(actualizado);
  } catch (error) {
    res.send(`Error al actualizar producto: ${error.message}`);
  }
});

app.delete("/productos/:id", async (req, res) => {
  try {
    await ProductManager.eliminarProducto(Number(req.params.id));
    res.send(`Producto ${req.params.id} eliminado`);
  } catch (error) {
    res.send(`Error al eliminar producto`);
  }
});

const server = app.listen(PORT, () => {
  console.log(`Servidor de productos activo en puerto ${PORT}`);
});