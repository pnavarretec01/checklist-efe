/* eslint-disable import/order */
import "@/@iconify/icons-bundle";
import App from "@/App.vue";
import layoutsPlugin from "@/plugins/layouts";
import vuetify from "@/plugins/vuetify";
import { loadFonts } from "@/plugins/webfontloader";
import router from "@/router";
import "@core/scss/template/index.scss";
import "@styles/styles.scss";
import axios from "axios";
import Keycloak from "keycloak-js";
import { createPinia } from "pinia";
import { createApp } from "vue";

loadFonts();

const app = createApp(App);

app.use(vuetify);
app.use(createPinia());
app.use(router);
app.use(layoutsPlugin);

let options = {
  realm: "efe",
  //url: "http://172.30.100.201:28080/auth",
  url: "https://sso.efe.cl/auth",
  clientId: "checklist_web",
};

let keycloak = new Keycloak(options);

async function refreshToken() {
  return await keycloak.updateToken(30);
}

axios.interceptors.request.use(async (config) => {
  config.headers.Authorization = `Bearer ${keycloak.token}`;
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axios(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

keycloak
  .init({ onLoad: "login-required" })
  .then((auth) => {
    if (!auth) {
      localStorage.clear();
      sessionStorage.clear();
      return false;
    }

    app.config.globalProperties.$keycloak = keycloak;
    if (keycloak.token && keycloak.idToken) {
      let payload = {
        correo_usuario: keycloak.tokenParsed.email,
        rol_usuario: keycloak.tokenParsed.realm_access
          ? keycloak.tokenParsed.realm_access.roles[0]
          : "Checklist",
        nombre_usuario: keycloak.tokenParsed.preferred_username,
        refresh_token: keycloak.refreshToken,
        nombre: keycloak.tokenParsed.given_name,
      };

      localStorage.setItem("userData", JSON.stringify(payload));
      localStorage.setItem("tokenKK", JSON.stringify(keycloak.token));
      keycloak.loadUserInfo().then((userInfo) => {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      });
    }
    app.mount("#app");
  })
  .catch((err) => {
    // console.log("Err", err);
  });

export const keycloakInstance = keycloak;
