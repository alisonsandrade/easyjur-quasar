<template>
  <div class="q-pa-sm">
    <q-list bordered class="rounded-borders">
      <q-expansion-item
        v-model="expanded"
        icon="perm_identity"
        label="Configurações Rápidas"
        header-class="bg-grey-11"
        dense
      >
        <q-card>
          <q-card-section>
            <q-input
              v-model="minutesDefaultDate"
              type="number"
              label="Intervalo"
              dense
            />
            <p class="text-grey">
              <small
                >Tempo (em minutos) padrão entre a data inicial e final. Leve em
                consideração que esse tempo será considerado pelo sistema para,
                automaticamente, ajustar a hora inicial e final do
                compromisso.</small
              >
            </p>

            <div>
              <q-checkbox
                v-model="showQEditor"
                label="Exibir o editor de texto completo"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

    <q-form @submit.prevent="onSubmit()" ref="form">
      <q-select
        v-model="event.calendar"
        :options="optionsCalendars"
        option-label="name"
        option-value="id"
        label="Calendários"
      />

      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <q-input
            v-model="event.start"
            label="Início"
            mask="##/##/#### ##:##"
            :rules="[(val) => dateIsValid(val) || 'Data inicial inválida']"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="event.start" mask="DD/MM/YYYY HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time
                    v-model="event.start"
                    mask="DD/MM/YYYY HH:mm"
                    format24h
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6">
          <q-input
            v-model="event.end"
            label="Fim"
            mask="##/##/#### ##:##"
            :rules="[(val) => dateIsValid(val) || 'Data final  inválida']"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="event.end" mask="DD/MM/YYYY HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time v-model="event.end" mask="DD/MM/YYYY HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div :class="`col-12 ${!showQEditor && 'col-sm-6'}`">
          <q-input
            v-model="event.subject"
            label="Título"
            autofocus
            ref="inputSubject"
            lazy-rules
            :rules="[
              (val) =>
                (val && val.length >= 3) ||
                'O título é obrigatório e deve conter ao menos 3 caracteres',
            ]"
          />
        </div>
        <div v-if="!showQEditor" class="col-12 col-sm-6">
          <q-input v-model="event.body" label="Descrição" ref="inputBody" />
        </div>
      </div>

      <div v-if="showQEditor">
        <p class="text-grey-8">Descrição</p>
        <q-editor class="q-my-md" v-model="event.body" min-height="4rem" />
      </div>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-sm-6">
          <q-btn
            type="submit"
            color="primary"
            class="full-width"
            label="Incluir"
            :disable="eventsInMemory.length >= 10"
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-btn
            color="gray"
            class="full-width"
            label="Limpar dados"
            outline
            @click="clearEventsInMemory()"
            :disable="eventsInMemory.length === 0"
          />
        </div>
      </div>
    </q-form>

    <q-banner
      v-if="eventsInMemory.length >= 10"
      inline-actions
      rounded
      class="q-mt-sm bg-orange text-white"
    >
      <template v-slot:avatar>
        <q-icon name="info" color="white" />
      </template>
      Você atingiu o limite máximo de 10 registros para envio em lote. Por
      favor, salve o registro para incluir mais registros em lote.
    </q-banner>

    <q-table
      class="q-mt-md q-mb-md"
      wrap-cells
      :rows="eventsInMemory"
      :columns="columns"
      row-key="name"
      no-data-label="Nenhum evento encontrado"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="start" :props="props">
            {{ props.row.start }}
          </q-td>
          <q-td key="end" :props="props">
            {{ props.row.end }}
          </q-td>
          <q-td key="subject" :props="props">
            {{ props.row.subject }}
          </q-td>
          <q-td key="body" :props="props">
            {{ props.row.body }}
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

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <q-btn
          color="positive"
          class="full-width"
          label="Salvar"
          @click="onSave()"
          :disable="eventsInMemory.length <= 0"
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-btn
          color="gray"
          class="full-width"
          label="Cancelar"
          outline
          :to="{
            name: 'EventList',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { eventService } from "src/services/EventService";
import { CustomDate } from "src/utils/CustomDate";
import { onMounted, ref } from "vue";

export default {
  name: "EventCreateMassive",

  emits: ["submit"],

  setup(_, { emit }) {
    const $q = useQuasar();
    const expanded = ref(false);
    const showQEditor = ref(false);

    const minutesDefaultDate = ref(15);
    const mask = ref("DD/MM/YYYY HH:mm");
    const form = ref(null);
    const eventsInMemory = ref([]);
    const columns = [
      { name: "start", align: "center", label: "Início", field: "start" },
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
        field: "body",
        classes: "td_body",
      },
      {
        name: "action",
        align: "center",
        label: "Ação",
        field: "action",
      },
    ];

    const customDate = new CustomDate(mask.value);

    let event = ref({
      calendar: null,
      start: null,
      end: null,
      subject: null,
      body: "",
    });
    const optionsCalendars = ref([]);

    const inputSubject = ref(null);
    const inputBody = ref(null);

    const addEventInMemory = (data) => {
      const dateIsValid = customDate.checkDatesValidFormatBR(
        event.value.start,
        event.value.end
      );

      if (dateIsValid) {
        eventsInMemory.value.push(Object.assign({}, data));

        //Limpa dados e retornar o curso para o título
        event.value.start = event.value.end;
        event.value.end = customDate.setFormatDateToBRAndAddMinutes(
          event.value.end,
          minutesDefaultDate.value
        );
        event.value.body = "";

        inputBody.value.focus();
      } else {
        throw new Error(
          "Data inválida. Favor verifique os campos data inicial e final."
        );
      }
    };

    const clearEventsInMemory = () => {
      $q.dialog({
        title: "Cancelamento",
        message: "Tem certeza que deseja excluir todos os registros?",
        cancel: true,
      }).onOk(() => {
        eventsInMemory.value = [];
        $q.notify({
          type: "positive",
          message: "Registros excluídos com sucesso",
        });
      });
    };

    const onSave = async () => {
      try {
        eventsInMemory.value.map((event, key) => {
          event.start = customDate.formatDateStringToUsa(event.start);
          event.end = customDate.formatDateStringToUsa(event.end);
          return Object.assign({}, event);
        });

        emit("submit", eventsInMemory.value);
      } catch (error) {
        $q.notify({
          type: "negative",
          message: error.response?.data?.message || error.message,
        });
      }
    };

    const removeEvent = (event) => {
      $q.dialog({
        title: "Confirmação de exclusão",
        message: "Tem certeza que deseja excluir o evento?",
        cancel: true,
      })
        .onOk(() => {
          const index = eventsInMemory.value.findIndex(
            (item) => item === event
          );
          eventsInMemory.value.splice(index, 1);
        })
        .onCancel(() => console.log("==> Ação de exclusão cancelada."));
    };

    const onSubmit = async () => {
      form.value.validate().then((success) => {
        addEventInMemory(event.value);
        if (success) {
          console.log("passou no success");
          $q.notify({
            type: "positive",
            message: "Evento adicionado ao lote com sucesso.",
          });
        } else {
          $q.notify({
            type: "negative",
            message: "Formulário inválido",
          });
        }
      });
    };

    onMounted(async () => {
      try {
        const responseCalendars = await eventService.getAllCalendars();
        optionsCalendars.value = responseCalendars.value;

        // Setando valores padrão
        event.value.calendar = optionsCalendars.value.filter(
          (calendar) => calendar.isDefaultCalendar
        )[0];
        event.value.start = customDate.setFormatDateToBR(new Date());
        event.value.end = customDate.setFormatDateToBRAndAddMinutes(
          event.value.start,
          minutesDefaultDate.value
        );
      } catch (error) {
        console.error(error);
      }
    });

    const dateIsValid = (value) => customDate.validateDateTimeFormatBR(value);

    return {
      expanded,
      showQEditor,
      minutesDefaultDate,
      event,
      eventsInMemory,
      columns,
      optionsCalendars,
      form,
      onSubmit,
      inputSubject,
      inputBody,
      clearEventsInMemory,
      onSave,
      removeEvent,
      dateIsValid,
    };
  },
};
</script>

<style lang="scss" scoped></style>
