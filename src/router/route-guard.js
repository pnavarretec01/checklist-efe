import axios from "axios";

const rutasPermitidas = ref([]);
const rutasCargando = ref(true);

export async function cargaRutasPermitidas(token) {
  const apiURL = import.meta.env.VITE_API_URL;
  rutasCargando.value = true;
  try {
    const response = await axios.get(`${apiURL}/menu`);
    const menuItems = response.data.data;

    //se extraen todas las rutas y rutas de pestañas
    const extraerRutas = (items, rutas = []) => {
      items.forEach((item) => {
        if (item.to) rutas.push(item.to);
        if (item.to == "checklist-page") {
          rutas.push("checklist");
          rutas.push("checklist/*");
        }
        if (item.children) extraerRutas(item.children, rutas);
        if (item.pestanas) {
          item.pestanas.forEach((pestana) => {
            if (pestana.to) rutas.push(pestana.to);
          });
        }
      });
      return rutas;
    };

    rutasPermitidas.value = extraerRutas(menuItems);
    rutasCargando.value = false;
  } catch (err) {
    console.error("Error cargando rutas permitidas:", err);
    rutasCargando.value = false;
  }
}

export function routeGuard(to, from, next) {
  if (to.name === "404") {
    return next();
  }
  const pathSinSlash = to.path.startsWith("/") ? to.path.slice(1) : to.path;

  const basePathIsAllowed = rutasPermitidas.value.some((pathPermitido) => {
    if (pathPermitido.endsWith("/*")) {
      const basePermittedPath = pathPermitido.replace("/*", "");
      return pathSinSlash.startsWith(basePermittedPath);
    }
    return pathPermitido === pathSinSlash;
  });

  if (rutasCargando.value) {
    next(false);
  } else if (basePathIsAllowed) {
    next();
  } else {
    return next({ name: "404" });
  }
}
