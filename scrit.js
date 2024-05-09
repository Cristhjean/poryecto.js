
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos()
        .then(() => {
            const modoOscuroActivado = JSON.parse(localStorage.getItem('modoOscuro'));
            const body = document.body;
            if (modoOscuroActivado) {
                body.classList.add('dark-mode');
            }
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
        });
        
    const nombreGuardado = localStorage.getItem('nombreUsuario');
    if (nombreGuardado) {
        mostrarSaludoNavbar(nombreGuardado);
    } else {
        pedirNombreUsuario();
    }
});

function cargarProductos() {
    return new Promise((resolve, reject) => {
        fetch('productos.json')
            .then(response => response.json())
            .then(data => {
                productos = data;
                actualizarHTMLProductos(); 
                cargarCarrito();

                resolve();
            })
            .catch(error => {
                reject(error);
            });
    });
}

function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        mostrarCarrito(); 
    }
}

function agregarAlCarrito(id) {
    const cantidadSeleccionada = document.getElementById(`cantidad-producto-${id}`).value;
    const productoElegido = productos.find(producto => producto.id === id);
    
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += parseInt(cantidadSeleccionada);
        productoExistente.total = productoExistente.cantidad * productoElegido.precio;
    } else {
        carrito.push({ ...productoElegido, cantidad: parseInt(cantidadSeleccionada), total: productoElegido.precio * parseInt(cantidadSeleccionada) });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));

    Swal.fire({
        title: 'Producto(s) agregado(s) al carrito',
        text: `${cantidadSeleccionada} ${productoElegido.nombre}(s) se ha(n) agregado al carrito.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
    
    mostrarCarrito();
}


function mostrarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    let totalGeneral = 0;
    listaCarrito.innerHTML = '';

    carrito.forEach(producto => {
        const itemCarrito = document.createElement('li');
        const totalProducto = producto.total; 
        
        itemCarrito.textContent = `${producto.nombre} - Cantidad: ${producto.cantidad} - Precio unitario: $${producto.precio} - Total: $${totalProducto}`;
        
        const botonBorrar = document.createElement('button');
        botonBorrar.textContent = 'BORRAR';
        botonBorrar.onclick = () => borrarProducto(producto.id);
        itemCarrito.appendChild(botonBorrar);

        listaCarrito.appendChild(itemCarrito);
        totalGeneral += totalProducto; 
    });

    const totalCarrito = document.getElementById('total-carrito');
    totalCarrito.textContent = totalGeneral;
}

function borrarProducto(id) {
    console.log("Borrando producto del carrito con ID:", id);
    const index = carrito.findIndex(producto => producto.id === id);
    if (index !== -1) {
        carrito[index].cantidad--;
        carrito[index].total -= carrito[index].precio;
        if (carrito[index].cantidad === 0) {
            carrito.splice(index, 1);
        }
        if (carrito.length === 0) {
            Swal.fire({
                title: 'Carrito vacío',
                text: 'El carrito ha sido vaciado.',
                icon: 'info',
                confirmButtonText: 'Aceptar'
            });
        }
        guardarCarrito(); 
        mostrarCarrito(); 
    }
}

function guardarCarrito() {
    console.log("Guardando carrito en localStorage...");
    localStorage.setItem('carrito', JSON.stringify(carrito));
    console.log("Carrito guardado en localStorage:", carrito);
}


function toggleModoOscuro() {
    const body = document.body;
    const botonModo = document.getElementById('toggleModo');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        botonModo.textContent = 'Modo Claro';
    } else {
        botonModo.textContent = 'Modo Oscuro';
    }

    const modoOscuroActivado = body.classList.contains('dark-mode');
    localStorage.setItem('modoOscuro', JSON.stringify(modoOscuroActivado));
}
function toggleCarrito() {
    const modal = document.getElementById('carrito-modal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        mostrarCarrito();
    }
}
function comprar() {
    if (carrito.length === 0) {
        Swal.fire({
            title: 'Carrito vacío',
            text: 'No puedes proceder con el pago porque tu carrito está vacío.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        });
    } else {
        document.getElementById('formulario-pago').style.display = 'block';
    }
}

function realizarPago() {
    const nombre = localStorage.getItem('nombreUsuario');
    const email = document.getElementById('email').value;
    const tarjeta = document.getElementById('tarjeta').value;
    const fechaExp = document.getElementById('fecha-exp').value;
    const cvv = document.getElementById('cvv').value;
    if (!nombre) {
        pedirNombreUsuario();
    } else {
        document.getElementById('nombre').value = nombre;

        Swal.fire({
            title: 'Compra realizada',
            text: `¡Gracias por tu compra, ${nombre}! Se ha procesado el pago.`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });

        carrito = [];
        guardarCarrito();
        mostrarCarrito();

        reiniciarFormulario();
    }
}

function reiniciarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('email').value = '';
    document.getElementById('tarjeta').value = '';
    document.getElementById('fecha-exp').value = '';
    document.getElementById('cvv').value = '';

    document.getElementById('formulario-pago').style.display = 'none';
}
function cerrarCarrito() {
    const modal = document.getElementById('carrito-modal');
    modal.style.display = 'none';
}
function pedirNombreUsuario() {
    Swal.fire({
        title: 'Ingrese su nombre',
        input: 'text',
        inputPlaceholder: 'Nombre',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        preConfirm: (nombre) => {
            if (!nombre) {
                Swal.showValidationMessage('Por favor, ingrese su nombre');
            } else {
                localStorage.setItem('nombreUsuario', nombre);
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            realizarPago(); 
        }
    });
}
function mostrarSaludoNavbar(nombre) {
    const saludoNavbar = document.getElementById('saludo-navbar');
    saludoNavbar.textContent = `¡Hola, ${nombre}!`;
}
function actualizarHTMLProductos() {
    const productosContainer = document.getElementById('productos');
    productosContainer.innerHTML = ''; 

    productos.forEach(producto => {
        const productoHTML = `
            <div class="producto">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <p>${producto.nombre} - $${producto.precio}</p>
                <select id="cantidad-producto-${producto.id}">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
            </div>
        `;
        productosContainer.innerHTML += productoHTML; 
    });
}
function borrarTodo() {
    carrito = [];
    mostrarCarrito();
    document.getElementById("total-carrito").textContent = "0";
    guardarCarrito();
}