<template>
  <p class="text-subtitle1">Cadastro de novo evento</p>
  <EventForm v-if="$route.name === 'EventCreate'" @submit="onSubmit($event)" />
  <EventFormMassive
    v-if="$route.name === 'EventCreateMassive'"
    @submit="onSubmitMassive($event)"
  />
</template>

<script>
import EventForm from "pages/Events/EventForm.vue";
import EventFormMassive from "./EventFormMassive.vue";
import { eventService } from "src/services/EventService";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

export default {
  name: "EventCreate",

  components: { EventForm, EventFormMassive },

  setup() {
    const $q = useQuasar();
    const router = useRouter();

    const onSubmit = async (data) => {
      try {
        $q.loading.show();
        await eventService.create(data);
        router.push({ name: "EventList" });
        $q.notify({
          type: "positive",
          message: "Evento criado com sucesso.",
        });
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || error.message,
        });
      } finally {
        $q.loading.hide();
      }
    };

    const onSubmitMassive = async (data) => {
      try {
        $q.loading.show();
        await eventService.createMassive(data);
        router.push({ name: "EventList" });
        $q.notify({
          type: "positive",
          message: "Evento criado com sucesso.",
        });
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || error.message,
        });
      } finally {
        $q.loading.hide();
      }
    };

    return {
      onSubmit,
      onSubmitMassive,
    };
  },
};
</script>

<style lang="scss" scoped></style>
