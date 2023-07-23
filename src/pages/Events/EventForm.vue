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
          <CustomFieldDate
            v-model="event.start"
            label="Início"
            name="start"
            :onlyDateField="event.isAllDay"
            :mask="mask"
            :maskInput="maskInput"
            :rules="[(val) => dateIsValid(val) || 'Data inicial inválida']"
          />
        </div>
        <div class="col-12 col-sm-6">
          <CustomFieldDate
            v-model="event.end"
            label="Fim"
            name="end"
            :onlyDateField="event.isAllDay"
            :mask="mask"
            :maskInput="maskInput"
            :rules="[(val) => dateIsValid(val) || 'Data final inválida']"
          />
        </div>
      </div>

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
import CustomFieldDate from "src/components/CustomFieldDate.vue";

export default {
  name: "EventForm",

  emits: ["submit"],

  components: { CustomFieldDate },

  setup(_, { emit }) {
    const $q = useQuasar();

    const { formatDate, extractDate } = date;

    const form = ref();
    const mask = ref("DD/MM/YYYY HH:mm");
    const maskInput = ref("##/##/#### ##:##");

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

    const dateIsValid = (value) =>
      mask.value === "DD/MM/YYYY"
        ? customDate.validateDateFormatBR(value)
        : customDate.validateDateTimeFormatBR(value);

    const onSubmit = async () => {
      form.value.validate().then((success) => {
        let message = "";
        const datesIsValid = customDate.checkDatesValidFormatBR(
          event.value.start,
          event.value.end,
          event.value.isAllDay
        );

        if (!datesIsValid) {
          success = false;
          message =
            "Data inválida. Favor verifique os campos data inicial e final.";
        }

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
            message: message || "Formulário inválido",
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
        maskInput.value = "##/##/####";

        event.value.start = customDate.setFormatDateToBR(
          event.value.start,
          mask.value
        );
        event.value.end = customDate.setFormatDateToBRAndAddMinutes(
          event.value.end,
          1440,
          mask.value
        );
      } else {
        mask.value = "DD/MM/YYYY HH:mm";
        maskInput.value = "##/##/#### ##:##";

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
      dateIsValid,
      optionsCalendars,
      form,
      onSubmit,
      mask,
      maskInput,
      updateDates,
    };
  },
};
</script>

<style lang="scss" scoped></style>
