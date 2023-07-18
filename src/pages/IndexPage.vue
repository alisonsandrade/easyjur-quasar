<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md q-mb-md bg-grey-12">
      <p class="text-h6">
        Seja bem vindo, <strong>{{ account.name || account.username }}</strong>
      </p>
      <p>
        Conte com o <strong>EasyJur</strong> como facilitador das suas tarefas
        diárias.
      </p>
    </div>
    <div class="row">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="my-card">
          <q-img
            src="~assets/calendar.png"
            style="height: 100%; max-height: 224.5px; max-width: 100%"
          >
            <!--<q-img src="src/assets/calendar.svg">-->
            <div class="absolute-bottom text-subtitle2 text-center">
              <q-btn flat :to="{ name: 'EventList' }">Calendários</q-btn>
            </div>
          </q-img>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useAuthStore } from "src/stores/useAuthStore";
import { defineComponent } from "vue";

export default defineComponent({
  name: "IndexPage",

  setup() {
    const authStore = useAuthStore();
    const account = authStore.account;

    return { account };
  },
});
</script>
