<template>
  <q-page class="q-pb-md">
    <div class="row q-col-gutter-sm q-pb-sm">
      <div class="col-12 col-sm-4">
        <q-btn class="full-width" color="accent" :to="{ name: 'EventCreate' }"
          >Novo evento</q-btn
        >
      </div>
      <div class="col-12 col-sm-4">
        <q-btn
          class="full-width"
          color="primary"
          :to="{ name: 'EventCreateMassive' }"
          >Novos eventos (lote)</q-btn
        >
      </div>
      <div class="col-12 col-sm-4">
        <q-btn class="full-width" color="grey" outline :to="{ name: 'Home' }"
          >Cancelar</q-btn
        >
      </div>
    </div>
    <div class="q-pb-sm">
      <q-select
        v-model="calendar"
        :options="optionsCalendars"
        option-label="name"
        option-value="id"
        label="Calendários"
        @update:model-value="updateEvents"
        filled
      />
    </div>

    <q-table
      title="Eventos"
      wrap-cells
      :rows="events"
      :columns="columns"
      row-key="name"
      no-data-label="Nenhum evento encontrado"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="start" :props="props">
            {{ new Date(props.row.start).toLocaleString() }}
          </q-td>
          <q-td key="end" :props="props">
            {{ new Date(props.row.end).toLocaleString() }}
          </q-td>
          <q-td key="subject" :props="props">
            <p>{{ props.row.subject }}</p>
          </q-td>
          <q-td key="body" :props="props">
            {{ props.row.bodyPreview }}
          </q-td>
          <q-td key="action" :props="props">
            <q-btn
              icon="delete"
              flat
              color="negative"
              round
              @click="removeEvent(props.row)"
            >
              <q-tooltip> Excluir o evento </q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { onMounted, ref } from "vue";
import { eventService } from "src/services/EventService";
import { useQuasar } from "quasar";

export default {
  name: "EventList",

  setup() {
    const $q = useQuasar();
    const events = ref([]);
    const calendar = ref(null);
    const optionsCalendars = ref([]);

    const columns = [
      {
        name: "start",
        align: "center",
        label: "Início",
        field: "start",
      },
      { name: "end", align: "center", label: "Fim", field: "end" },
      {
        name: "subject",
        align: "left",
        label: "Título",
        field: "subject",
        style: "width: 300px",
        classes: "td_subject",
      },
      {
        name: "body",
        align: "left",
        label: "Descrição",
        field: "bodyPreview",
        classes: "td_body",
      },
      { name: "action", align: "center", label: "Ação", field: "action" },
    ];

    // Normalização dos dados oriundos da API Graph
    const normalizeEvents = (events) => {
      return events.map((item) => {
        return {
          calendar: calendar.value,
          id: item.id,
          subject: item.subject,
          start: item.start.dateTime,
          end: item.end.dateTime,
          bodyHtml: item.body.content,
          bodyPreview: item.bodyPreview,
        };
      });
    };

    const getEventsByCalendarNormalize = async (idCalendar, options) => {
      const { value } = await eventService.getEvents(idCalendar, options);
      return normalizeEvents(value);
    };

    const updateEvents = async () => {
      try {
        $q.loading.show();
        events.value = await getEventsByCalendarNormalize(calendar.value.id);
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || error.message,
        });
      } finally {
        $q.loading.hide();
      }
    };

    const removeEvent = async (event) => {
      try {
        $q.loading.show();
        $q.dialog({
          title: "Confirmação",
          message: "Tem certeza que deseja excluir o evento?",
          cancel: true,
        }).onOk(async () => {
          const { calendar, id } = event;
          await eventService.deleteEvent(calendar.id, id);
          await updateEvents();
          $q.notify({
            type: "positive",
            message: "Evento excluído com sucesso!",
          });
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

    onMounted(async () => {
      try {
        $q.loading.show();
        const responseCalendars = await eventService.getAllCalendars();
        optionsCalendars.value = responseCalendars.value;

        calendar.value = optionsCalendars.value.filter(
          (calendar) => calendar.isDefaultCalendar
        )[0];

        events.value = await getEventsByCalendarNormalize();
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || error.message,
        });
      } finally {
        $q.loading.hide();
      }
    });

    return {
      events,
      calendar,
      optionsCalendars,
      columns,
      updateEvents,
      removeEvent,
    };
  },
};
</script>

<style lang="scss" scoped>
.td_subject {
  max-height: 200px;
}
.td_body {
  max-height: 200px;
}
</style>
