/* eslint-disable import/order */
import "@/@iconify/icons-bundle";
import App from "@/App.vue";
import layoutsPlugin from "@/plugins/layouts";
import vuetify from "@/plugins/vuetify";
import { loadFonts } from "@/plugins/webfontloader";
import router from "@/router";
import { cargaRutasPermitidas } from "@/router/route-guard";
import "@core/scss/template/index.scss";
import "@styles/styles.scss";
import axios from "axios";
import Keycloak from "keycloak-js";
import { createPinia } from "pinia";
import { createApp } from "vue";

loadFonts();

async function initKeycloak() {
  const keycloak = new Keycloak({
    realm: "efe",
    url: "https://sso.efe.cl/auth",
    clientId: "checklist_web",
  });

  try {
    const authenticated = await keycloak.init({ onLoad: "login-required" });
    if (!authenticated) {
      throw new Error("La autenticación de Keycloak ha fallado");
    }
    return keycloak;
  } catch (error) {
    console.error("Error al inicializar Keycloak", error);
    throw error;
  }
}

async function setupAxiosInterceptors(keycloakInstance) {
  axios.interceptors.request.use((config) => {
    if (keycloakInstance.token) {
      config.headers.Authorization = `Bearer ${keycloakInstance.token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await keycloakInstance.updateToken(30);
          originalRequest.headers.Authorization = `Bearer ${keycloakInstance.token}`;
          return axios(originalRequest);
        } catch (e) {
          //console.log("Error al refrescar el token", e);
        }
      }
      return Promise.reject(error);
    }
  );
}

async function initApp() {
  const keycloak = await initKeycloak();
  await setupAxiosInterceptors(keycloak);

  if (keycloak.authenticated) {
    let payload = {
      correo_usuario: keycloak.tokenParsed.email,
      rol_usuario: keycloak.tokenParsed.realm_access?.roles[0] || "Checklist",
      nombre_usuario: keycloak.tokenParsed.preferred_username,
      refresh_token: keycloak.refreshToken,
      nombre: keycloak.tokenParsed.given_name,
    };
    localStorage.setItem("userData", JSON.stringify(payload));
    await keycloak.loadUserInfo();
    localStorage.setItem("userInfo", JSON.stringify(keycloak.userInfo));
  }

  await cargaRutasPermitidas(keycloak.token);

  const app = createApp(App);
  app.use(layoutsPlugin);

  app.use(vuetify);
  app.use(createPinia());
  app.use(router);

  app.provide("keycloak", keycloak);

  app.mount("#app");
}
initApp();
