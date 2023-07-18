<template>
  <div class="q-pa-sm">
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
          <q-input v-model="event.start" label="Início">
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

            <template v-slot:append v-if="!event.isAllDay">
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
          <q-input v-model="event.end" label="Fim">
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

            <template v-slot:append v-if="!event.isAllDay">
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

      <!--
      <CustomFieldDate
        v-model="event.start"
        label="Teste"
        name="Teste"
        :onlyDateField="event.isAllDay"
      />
      -->

      <q-input
        class="q-pb-sm"
        v-model="event.subject"
        label="Título"
        autofocus
        :rules="[
          (val) =>
            (val && val.length >= 3) ||
            'O título é obrigatório e deve conter ao menos 3 caracteres',
        ]"
      />

      <q-input
        class="q-pb-md"
        v-model="event.attendees"
        label="Participantes"
        hint="Adicione os e-mails dos participantes separando-os por vírgula. Ex: email1@email.com, email2@email.com"
      />

      <q-editor class="q-my-md" v-model="event.body" min-height="5rem" />

      <q-checkbox
        v-model="event.isAllDay"
        label="Evento o dia inteiro"
        @update:model-value="updateDates()"
      />

      <div class="row q-pt-md">
        <div class="col">
          <q-btn
            :class="$q.screen.lt.sm && 'full-width q-mb-sm'"
            :style="!$q.screen.lt.sm && 'min-width: 10rem; margin-right: 1rem;'"
            color="grey"
            outline
            label="Cancelar"
            @click="$router.push({ name: 'EventList' })"
          />
          <q-btn
            type="submit"
            :class="$q.screen.lt.sm && 'full-width'"
            :style="!$q.screen.lt.sm && 'min-width: 10rem;'"
            color="positive"
            label="Salvar"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { eventService } from "src/services/EventService";
import { date, useQuasar } from "quasar";
import { CustomDate } from "src/utils/CustomDate";
//import CustomFieldDate from "src/components/CustomFieldDate.vue";

export default {
  name: "EventForm",

  emits: ["submit"],

  //components: { CustomFieldDate },

  setup(_, { emit }) {
    const $q = useQuasar();

    const { formatDate, extractDate } = date;

    const form = ref();
    const mask = ref("DD/MM/YYYY HH:mm");

    const customDate = new CustomDate(mask.value);

    let event = ref({
      calendar: null,
      start: null,
      end: null,
      attendees: null,
      isAllDay: false,
      subject: null,
      body: "",
    });
    const optionsCalendars = ref([]);

    const onSubmit = async () => {
      form.value.validate().then((success) => {
        if (success) {
          emit(
            "submit",
            Object.assign(
              {},
              {
                ...event.value,
                start: formatDate(
                  extractDate(event.value.start, mask.value),
                  "YYYY-MM-DDTHH:mm:ss"
                ),
                end: formatDate(
                  extractDate(event.value.end, mask.value),
                  "YYYY-MM-DDTHH:mm:ss"
                ),
              }
            )
          );
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
          event.value.start
        );
      } catch (error) {
        console.error(error);
      }
    });

    const updateDates = () => {
      if (event.value.isAllDay) {
        mask.value = "DD/MM/YYYY";
        event.value.start = customDate.setFormatDateToBR(
          event.value.start,
          mask.value
        );
        event.value.end = customDate.setFormatDateToBRAndAddMinutes(
          event.value.end,
          1440,
          mask.value
        );
      }
      if (event.value.isAllDay === false) {
        mask.value = "DD/MM/YYYY HH:mm";

        event.value.start = customDate.setFormatDateToBR(
          extractDate(event.value.start, "DD/MM/YYYY"),
          mask.value
        );
        event.value.end = customDate.setFormatDateToBR(
          extractDate(event.value.end, "DD/MM/YYYY"),
          mask.value
        );
      }
    };

    return {
      event,
      optionsCalendars,
      form,
      onSubmit,
      mask,
      updateDates,
    };
  },
};
</script>

<style lang="scss" scoped></style>
