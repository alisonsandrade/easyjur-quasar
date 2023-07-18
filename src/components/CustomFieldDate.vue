<template>
  <q-input
    :value="props.value"
    :label="props.label"
    :name="props.name"
    @update:model-value="updateValue"
  >
    <template v-slot:prepend>
      <q-icon :name="nameIconDate" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date :v-model="props.model" :mask="props.mask">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>

    <template v-slot:append v-if="onlyDateField">
      <q-icon :name="nameIconTime" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time :v-model="props.model" :mask="props.mask" format24h>
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { computed } from "vue";

const emit = defineEmits(["update:value"]);

const props = defineProps({
  name: String,
  label: String,
  value: [Object, String],
  nameIconDate: {
    type: String,
    default: "event",
  },
  nameIconTime: {
    type: String,
    default: "access_time",
  },
  mask: {
    type: String,
    default: "DD/MM/YYYY HH:mm",
  },
  onlyDateField: {
    type: Boolean,
    Default: false,
  },
});

const onlyDateField = computed(() => !props.onlyDateField);

const updateValue = (value) => {
  console.log("update", value);
  emit("update:value", value);
};
</script>

<style lang="scss" scoped></style>
