<template>
  <div class="q-pa-sm">
    <q-btn-dropdown flat class="" color="white" label="Conta" v-if="account">
      <div class="row no-wrap q-pa-md">
        <div class="column">
          <div class="text-h6 q-mb-md">Perfil</div>
          <strong>E-mail:</strong>
          <p>{{ account.username }}</p>

          <q-btn color="primary" label="Sair" push size="sm" @click="SignOut" />
        </div>

        <q-separator vertical inset class="q-mx-lg" />

        <div class="column items-center">
          <q-avatar size="72px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>

          <div class="text-subtitle3 text-center q-mt-md q-mb-xs">
            {{ account.name }}
          </div>
        </div>
      </div>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAuthStore } from "src/stores/useAuthStore";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

export default {
  setup() {
    const $q = useQuasar();
    const store = useAuthStore();
    const router = useRouter();
    const account = store.account;

    async function SignOut() {
      $q.dialog({
        title: "Sair",
        message: "Tem certeza que deseja sair do sistema?",
        cancel: true,
      }).onOk(() => {
        store.signOut();
        router.push({ name: "Login" });
        $q.notify({
          type: "positive",
          message: "Desconectado com sucesso!",
        });
      });
    }

    return {
      account,
      mobileData: ref(false),
      bluetooth: ref(false),
      SignOut,
    };
  },
};
</script>
