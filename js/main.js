const inputNombre = document.querySelector("#nombreProducto");
const inputPrecio = document.querySelector("#precioProducto");
const inputStock = document.querySelector("#stockProducto");

const botonAgregar = document.querySelector("#btnAgregar");
const botonVaciar = document.querySelector("#btnVaciar");

const inputBusqueda = document.querySelector("#busquedaProducto");

const mensaje = document.querySelector("#mensaje");
const estadoCarga = document.querySelector("#estadoCarga");

const avisoBeneficio = document.querySelector("#avisoBeneficio");
const fondoOscuro = document.querySelector("#fondoOscuro");
setTimeout(() => {
    fondoOscuro.style.display = "block";
    avisoBeneficio.style.display = "block";
}, 3000);

const cerrarAviso = document.querySelector("#cerrarAviso");
cerrarAviso.addEventListener("click", () => {
    avisoBeneficio.style.display = "none";
    fondoOscuro.style.display = "none";
});

const productosGuardados = localStorage.getItem("productos");
let productos = productosGuardados ? JSON.parse(productosGuardados)
    : [
        { id: 1, nombre: "Remera", precio: 20000, stock: 12 },
        { id: 2, nombre: "Calza", precio: 40000, stock: 8 },
        { id: 3, nombre: "Campera", precio: 60000, stock: 5 }
    ];

function guardarProductos() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

const contenedorProductos = document.querySelector("#contenedorProductos");

let idProductoEditando = null;

function renderizarProductos() {
    const busqueda = inputBusqueda.value.toLowerCase();
    let html = "";

    for (const producto of productos) {
        const { nombre, precio, stock } = producto;
        if (nombre.toLowerCase().includes(busqueda)) {
            html += `
            <div>
                <h3>${nombre}</h3>
                <p>$${precio}</p>
                <p>Stock: ${stock}</p>
                <button data-id="${producto.id}" class="btnEditar">Editar</button>
                <button data-id="${producto.id}" class="btnEliminar">Eliminar</button>
            </div>
        `;

        }

    }
    contenedorProductos.innerHTML = html;
}

inputBusqueda.addEventListener("keyup", () => {
    renderizarProductos();
});

contenedorProductos.addEventListener("click", (evento) => {
    if (!evento.target.matches("button")) return;

    const idProducto = Number(evento.target.dataset.id);

    if (evento.target.classList.contains("btnEditar")) {
        const producto = productos.find(
            producto => producto.id === idProducto
        );

        idProductoEditando = idProducto;

        inputNombre.value = producto?.nombre ?? "";
        inputPrecio.value = producto?.precio ?? "";
        inputStock.value = producto?.stock ?? "";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        return;
    }

    const productoEncontrado = productos.findIndex(
        producto => producto.id === idProducto
    );

    if (productoEncontrado !== -1) {
        productos.splice(productoEncontrado, 1);
        guardarProductos();
        Toastify({
            text: "Producto eliminado correctamente",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #7F00FF, #E100FF)"
            }
        }).showToast();
        renderizarProductos();
    }

});

let siguienteId = productos.length > 0
    ? Math.max(...productos.map(producto => producto.id)) + 1
    : 1;

botonAgregar.addEventListener("click", () => {
    const estabaEditando = idProductoEditando !== null;
    try {
        const nombre = inputNombre.value.trim();
        const precio = Number(inputPrecio.value);
        const stock = Number(inputStock.value);
        if (nombre === "" || isNaN(precio) || precio <= 0 || isNaN(stock) || stock <= 0) {
            throw new Error("Datos inválidos");
        }

        if (idProductoEditando !== null) {

            const producto = productos.find(
                producto => producto.id === idProductoEditando
            );

            producto.nombre = nombre;
            producto.precio = precio;
            producto.stock = stock;

            idProductoEditando = null;

        } else {
            const nuevoProducto = {
                id: siguienteId,
                nombre: nombre,
                precio: precio,
                stock: stock
            };
            siguienteId++;
            productos.push(nuevoProducto);
        }
        guardarProductos();

        Toastify({
            text: estabaEditando
                ? "Producto modificado correctamente"
                : "Producto agregado correctamente",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #7F00FF, #E100FF)"
            }
        }).showToast();

        inputNombre.value = "";
        inputPrecio.value = "";
        inputStock.value = "";

        renderizarProductos();

    } catch (error) {
        Toastify({
            text: estabaEditando
                ? "No se pudo modificar el producto"
                : "No se pudo agregar el producto",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "linear-gradient(to right, #FF416C, #FF4B2B)"
            }
        }).showToast();

        setTimeout(() => {
            Toastify({
                text: "Completá nombre, precio y stock correctamente",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(to right, #FF416C, #FF4B2B)"
                }
            }).showToast();
        }, 1000);
    }
});

botonVaciar.addEventListener("click", () => {
    productos.length = 0;
    guardarProductos();
    renderizarProductos();
    Toastify({
        text: "Productos eliminados correctamente",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
            background: "linear-gradient(to right, #7F00FF, #E100FF)"
        }
    }).showToast();
});

async function getData() {
    try {
        estadoCarga.textContent = "Cargando productos...";
        const response = await fetch("./data.json");
        const data = await response.json();
        if (!productosGuardados) {
            productos = data;
        }

        renderizarProductos();

    } catch (error) {
        mensaje.textContent = "No se pudieron cargar los productos.";

    } finally {
        estadoCarga.textContent = "";
    }
}
getData();
