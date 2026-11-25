// Catálogo de disfraces: los datos están en datos/*.json
const categorias = ["cabezones", "halloween", "inflables", "atuendos"];
const botones = document.querySelectorAll(".lista-categorias button");
const secciones = document.querySelectorAll(".catalogo");
const visor = document.getElementById("visor-imagen");
const imagenAmpliada = document.getElementById("imagen-ampliada");
const buscador = document.getElementById("buscar");
const botonBuscar = document.getElementById("boton-buscar");
let categoriaActual = "todos";

function crearTarjeta(disfraz) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-disfraz";
    const img = document.createElement("img");
    img.src = disfraz.imagen;
    img.alt = disfraz.nombre;
    img.loading = "lazy";
    const nombre = document.createElement("h3");
    nombre.textContent = disfraz.nombre;
    const tipo = document.createElement("span");
    tipo.className = "tipo-disfraz";
    tipo.textContent = disfraz.tipo;
    const enlace = document.createElement("a");
    enlace.className = "boton-whatsapp";
    enlace.href = disfraz.whatsapp || `https://wa.me/?text=${encodeURIComponent('Hola, quiero consultar por el disfraz de ' + disfraz.nombre)}`;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.textContent = "Consultar por WhatsApp";
    tarjeta.append(img, nombre, tipo, enlace);
    return tarjeta;
}

function actualizarVista() {
    const texto = (buscador?.value || "").trim().toLocaleLowerCase("es");
    secciones.forEach(seccion => {
        const coincideCategoria = categoriaActual === "todos" || seccion.id === categoriaActual;
        let visibles = 0;
        seccion.querySelectorAll(".tarjeta-disfraz").forEach(tarjeta => {
            const coincideNombre = tarjeta.querySelector("h3").textContent.toLocaleLowerCase("es").includes(texto);
            tarjeta.style.display = coincideNombre ? "" : "none";
            if (coincideNombre) visibles++;
        });
        seccion.style.display = coincideCategoria && visibles > 0 ? "" : "none";
    });
}

async function cargarCatalogo() {
    for (const categoria of categorias) {
        const contenedor = document.querySelector(`#${categoria} .contenedor-disfraces`);
        if (!contenedor) continue;
        try {
            const respuesta = await fetch(`datos/${categoria}.json`);
            if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
            const disfraces = await respuesta.json();
            contenedor.replaceChildren(...disfraces.map(crearTarjeta));
        } catch (error) {
            console.error(`No se pudo cargar ${categoria}:`, error);
            const aviso = document.createElement("p");
            aviso.textContent = `No se pudo cargar la categoría ${categoria}.`;
            contenedor.replaceChildren(aviso);
        }
    }
    actualizarVista();
}

botones.forEach(boton => boton.addEventListener("click", () => {
    categoriaActual = boton.dataset.categoria;
    buscador.value= "";
	actualizarVista();
}));
botonBuscar?.addEventListener("click", actualizarVista);
buscador?.addEventListener("input", actualizarVista);

// Delegación: funciona también con tarjetas creadas después de cargar el JSON.
document.addEventListener("click", evento => {
    const img = evento.target.closest(".tarjeta-disfraz img");
    if (!img) return;
    imagenAmpliada.src = img.src;
    imagenAmpliada.alt = img.alt;
    visor.style.display = "flex";
});
function cerrarVisor() { visor.style.display = "none"; imagenAmpliada.removeAttribute("src"); }
document.querySelector(".cerrar-visor")?.addEventListener("click", cerrarVisor);
visor?.addEventListener("click", evento => { if (evento.target === visor) cerrarVisor(); });
document.addEventListener("keydown", evento => { if (evento.key === "Escape") cerrarVisor(); });

cargarCatalogo();
