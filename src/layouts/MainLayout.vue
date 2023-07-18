<template>
  <q-layout view="lHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="$q.screen.lt.md"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <router-link class="logo" :to="{ name: 'Home' }"
            >EasyJur</router-link
          ></q-toolbar-title
        >

        <DropdownProfile />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above elevated>
      <div class="column justify-between full-height">
        <div class="col-11">
          <q-list>
            <q-item-label header class="q-pb-none q-mb-none">
              <div class="q-pa-sm q-gutter-sm text-center">
                <q-avatar size="98px">
                  <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                </q-avatar>
                <p>
                  @{{
                    authStore.account &&
                    authStore.account.username &&
                    authStore.account.username.split("@")[0]
                  }}
                </p>
              </div>
            </q-item-label>

            <EssentialLink
              v-for="link in essentialLinks"
              :key="link.title"
              v-bind="link"
              :className="link.class"
            />
          </q-list>
        </div>
        <div class="col-1 self-center">
          <q-btn color="black" label="Desconectar" @click="disconnect()" />
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import DropdownProfile from "components/DropdownProfile.vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/useAuthStore";
import { useRouter } from "vue-router";

const linksList = [
  {
    title: "Página Inicial",
    icon: "home",
    link: "/",
  },
  {
    title: "Calendário",
    caption: "Microsoft Calendar",
    icon: "event",
    link: "/events",
  },
  {
    title: "Sobre",
    caption: "Informações sobre EasyJur",
    icon: "favorite",
    link: "/about",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    DropdownProfile,
  },

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const authStore = useAuthStore();
    const leftDrawerOpen = ref(false);

    const disconnect = async () => {
      $q.dialog({
        title: "Desconectar",
        message: "Tem certeza que deseja desconectar sua conta da aplicação?",
        cancel: true,
      }).onOk(async () => {
        try {
          $q.loading.show();
          await authStore.disconnect();
          router.push({ name: "Home" });
        } catch (error) {
          $q.notify({
            type: "negative",
            message: error?.message || error?.response?.data?.error?.message,
          });
        } finally {
          $q.loading.hide();
        }
      });
    };

    return {
      authStore,
      disconnect,
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
<style lang="scss" scoped>
.logo {
  text-decoration: none;
  color: white;
}
</style>
