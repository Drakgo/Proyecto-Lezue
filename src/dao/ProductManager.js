const fs = require("fs");

class ProductManager {
  static path = "./productos.json";

  static async agregarProducto({ titulo, descripcion, codigo, precio, estado, stock, categoria }) {
    // Validaciones
    if (!titulo || !descripcion || !codigo || precio == null || stock == null || !categoria) {
      throw new Error("Faltan campos obligatorios: título, descripción, código, precio, stock, categoría");
    }

    let productos = await this.obtenerProductos();

    // Validación de código único
    let existe = productos.find(p => p.codigo.toLowerCase() === codigo.toLowerCase());
    if (existe) {
      throw new Error(`Ya existe un producto con código ${codigo}: es ${existe.titulo}`);
    }

    // Generación de ID único
    let id = 1;
    if (productos.length > 0) {
      id = Math.max(...productos.map(p => p.id)) + 1;
    }

    let nuevoProducto = {
      id,
      titulo,
      descripcion,
      codigo,
      precio,
      estado: estado ?? true,
      stock,
      categoria,
    };

    productos.push(nuevoProducto);
    await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 5));

    return nuevoProducto;
  }

  static async obtenerProductos() {
    if (fs.existsSync(this.path)) {
      let productos = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
      productos = productos.map(p => ({
        ...p,
        titulo: p.titulo.toUpperCase() // transformación visual
      }));
      return productos;
    } else {
      return [];
    }
  }

  static async obtenerProductoPorId(id) {
    let productos = await this.obtenerProductos();
    return productos.find(p => p.id === id);
  }

  static async actualizarProducto(id, actualizaciones) {
    let productos = await this.obtenerProductos();
    let index = productos.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }

    productos[index] = { ...productos[index], ...actualizaciones, id };
    await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 5));
    return productos[index];
  }

  static async eliminarProducto(id) {
    let productos = await this.obtenerProductos();
    let nuevoListado = productos.filter(p => p.id !== id);
    await fs.promises.writeFile(this.path, JSON.stringify(nuevoListado, null, 5));
    return true;
  }
}

module.exports = { ProductManager };