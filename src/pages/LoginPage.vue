<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md row justify-center bg-grey-12">
        <q-card class="my-card self-center">
          <q-card-section>
            <div class="text-h6">
              <q-icon name="login" />
              Login
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            Bem vindo ao sistema facilitador de tarefas jurídicas. Para utilizar
            adequadamente o sistema é necessário que você acesse com sua conta
            institucional.
          </q-card-section>

          <q-card-actions vertical>
            <q-btn
              dense
              color="primary"
              label="Acessar com Microsoft"
              @click="SignIn"
            >
              <object
                type="image/svg+xml"
                data="https://s3-eu-west-1.amazonaws.com/cdn-testing.web.bas.ac.uk/scratch/bas-style-kit/ms-pictogram/ms-pictogram.svg"
                class="x-icon q-ml-sm"
              ></object>
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/useAuthStore";
import { useRouter } from "vue-router";

const $q = useQuasar();
const store = useAuthStore();
const router = useRouter();

async function SignIn() {
  try {
    $q.loading.show();

    await store.signin();

    router.push({ name: "Home" });
  } catch (error) {
    if (error.name === "BrowserAuthError")
      window.alert("Você precisa fechar esta aba para conectar novamente.");
    console.error(`error during authentication: ${error}`);
  } finally {
    $q.loading.hide();
  }
}
</script>
<style scoped>
.my-card {
  padding: 0.6rem;
  width: 100%;
  max-width: 350px;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
}
</style>
