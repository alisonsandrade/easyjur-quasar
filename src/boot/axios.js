import { boot } from "quasar/wrappers";
import axios from "axios";
import { useAuthStore } from "src/stores/useAuthStore";
import router from "src/router";

const store = useAuthStore();

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

const request = axios.create({
  baseURL: process.env.GRAPH_API_ENDPOINT,
  headers: {
    Prefer: 'outlook.timezone="America/Sao_Paulo"',
  },
});

request.interceptors.request.use(
  function (config) {
    const token = store.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${store.accessToken}`;
      return config;
    } else {
      console.log("There is not token yet...");
      return config;
    }
  },
  function (error) {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const store = useAuthStore();

    if (error.response?.status === 401) {
      const codeError = error.response?.data?.error?.code;
      let message = "";

      if (codeError === "InvalidAuthenticationToken") {
        const confirm = window.confirm(
          "Token inválido ou expirado. Deseja renovar o seu token de acesso?"
        );
        if (confirm) {
          await store.refreshToken();
        } else {
          store.signOut();
        }
        router().go();
        message = error.response?.data?.message || error.message;
      } else {
        message =
          error.response?.data?.message ||
          error.message ||
          "Ocorreu um erro de autenticação";
      }

      throw new Error(message);
    }
    if (error.response?.status === 403) {
      console.error(error);
      throw new Error(
        "Você não possui permissão para esta ação. Contate o administrador"
      );
    }

    if (
      error.response?.data?.error?.code === "ErrorPropertyValidationFailure"
    ) {
      throw new Error(
        "Ocorreu um erro de validação. Verifique se todos os campos estão preenchidos corretamente"
      );
    }

    return Promise.reject(error.response?.data?.error || error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$request = request;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { request };
