<template>
  <div class="dga-list-group overflow-x-hidden">
    <template v-for="(item, i) of props.items">
      <NuxtLink v-if="props.to" class="header" :to="props.to(item, i)"
        :class="getClassesOfItem(2 * i)"
        @mouseenter="pushEleIndex(2 * i)"
        @mouseleave="popEleIndex(2 * i)"
        @click="emit('selectrow', i)"
      >
        <slot name="header" :item="item" :row="i">
          {{ item.key }}
        </slot>
      </NuxtLink>
      <div v-else class="header"
        :class="getClassesOfItem(2 * i)"
        @mouseenter="pushEleIndex(2 * i)"
        @mouseleave="popEleIndex(2 * i)"
        @click="emit('selectrow', i)"
      >
        <slot name="header" :item="item" :row="i">
          {{ item.value }}
        </slot>
      </div>
      <NuxtLink v-if="props.to" class="content" :to="props.to(item, i)"
        :class="getClassesOfItem(2 * i + 1)"
        @mouseenter="pushEleIndex(2 * i + 1)"
        @mouseleave="popEleIndex(2 * i + 1)"
        @click="emit('selectrow', i)"
      >
        <slot name="content" :item="item" :row="i">
          {{ item.key }}
        </slot>
      </NuxtLink>
      <div v-else class="content"
        :class="getClassesOfItem(2 * i + 1)"
        @mouseenter="pushEleIndex(2 * i + 1)"
        @mouseleave="popEleIndex(2 * i + 1)"
        @click="emit('selectrow', i)"
      >
        <slot name="content" :item="item" :row="i">
          {{ item.value }}
        </slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  items?: Array<BasicListableItem>,
  noAnimation?: boolean,
  to?: BasicListableLinkFuntion,
}>(), {
  items: () => [],
  noAnimation: false,
})

function getClassesOfItem(n: number) {
  return [
    isElementContainRow(n) ? 'selected' : '',
    props.noAnimation ? 'no-animation' : ''
  ].filter(Boolean)
}

const emit = defineEmits<{
  (e: 'selectrow', row: number) : void,
}>();


const selectedEleIndex : Ref<Array<number>> = ref([]);

function getRowTh(n: number) {
  const rowth = n - (n % 2);
  return rowth
}
function pushEleIndex(n: number) {
  if(!selectedEleIndex.value.includes(n)) {
    selectedEleIndex.value.push(n);
  }
}
function popEleIndex(n: number) {
  const index = selectedEleIndex.value.indexOf(n);
  if(index !== -1) {
    selectedEleIndex.value.splice(index, 1);
  }
}
function isElementContainRow(n: number) {
  return selectedEleIndex.value.some((ele) => getRowTh(n) === getRowTh(ele))
}

</script>

<style scoped>
.dga-list-group {
  @apply grid;
  grid-template-columns: min-content auto;
}
.dga-list-group > .header {
  @apply px-4 py-1 truncate
}
.dga-list-group > .content {
  @apply px-2 py-1 border-l-2 border-dga-orange-lighter
}
.dga-list-group > .header.selected,
.dga-list-group > .content.selected
{
  @apply transition duration-200 bg-slate-400/25;
}

.dga-list-group > .header.selected:not(.no-animation),
.dga-list-group > .content.selected:not(.no-animation)
{
  @apply translate-x-1;
}
</style>