//https://devblogs.microsoft.com/azure-sdk/vue-js-user-authentication/
//https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-browser-samples/vue3-sample-app-
import { PublicClientApplication } from "@azure/msal-browser";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    msalConfig: {
      auth: {
        clientId: process.env.CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
        authority: process.env.CLOUD_INSTANCE + process.env.TENANT_ID, // Full directory URL, in the form of https://login.microsoftonline.com/<tenant>
        redirectUri: process.env.REDIRECT_URI,
        postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI,
        clientSecret: process.env.CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
      },
      cache: {
        cacheLocation: "localStorage",
      },
    },
    accessToken: null,
    account: null,
  }),
  persist: true,
  getters: {
    msalInstance: (state) => new PublicClientApplication(state.msalConfig),
  },
  actions: {
    async signin() {
      const request = {
        scopes: process.env.SCOPES.split(","),
      };
      const { accessToken, account } = await this.msalInstance.loginPopup(
        request
      );

      this.setAccessTokenAndAccount(accessToken, account);
    },
    setAccessTokenAndAccount(accessToken, account) {
      this.$patch({ accessToken, account });
    },
    async refreshToken() {
      const { accessToken, account } =
        await this.msalInstance.acquireTokenPopup({
          scopes: process.env.SCOPES.split(","),
        });

      this.setAccessTokenAndAccount(accessToken, account);
    },
    signOut() {
      localStorage.clear();
      this.$patch({ accessToken: null, account: null });
    },
    async disconnect() {
      this.signOut();
      await this.msalInstance.logoutRedirect({
        account: this.account,
        postLogoutRedirectUri: process.env.POST_LOGOUT_REDIRECT_URI,
      });
    },
  },
});
