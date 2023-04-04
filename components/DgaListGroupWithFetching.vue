<template>
  <div>
    <DgaListGroup
      :items="props.items"
      :to="props.to"
      @selectrow="emit('selectrow', $event)"
    >
      <template #header="{item, row}">
        <slot name="header" :item="item" :row="row">
          {{ item.key }}
        </slot>
      </template>
      <template #content="{item, row}">
        <slot name="content" :item="item" :row="row">
          {{ item.value }}
        </slot>
      </template>
    </DgaListGroup>
    <slot v-if="props.items.length === 0" name="empty">
      <div class="italic text-center">
        {{ props.emptyText }}
      </div>
    </slot>
    <div v-if="props.moreload && !props.loading" class="w-full sm:w-64 mx-auto mt-4">
      <DgaButton class="w-full flex flex-row gap-x-2 items-center justify-center truncate" :title="props.moreloadText"
        @click="emit('moreload')"
      >
        <MaterialIcon icon="autorenew" />
        <span class="truncate">{{ props.moreloadText }}</span>
      </DgaButton>
    </div>
    <slot v-if="props.moreload && props.loading" name="loading">
      <div class="italic text-center">
        {{ props.loadingText }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  items?: Array<BasicListableItem>,
  emptyText?: string,
  moreload?: boolean,
  moreloadText?: string,
  loading?: boolean,
  loadingText?: string,
  to?: BasicListableLinkFuntion,
}>(), {
  items: () => [],
  emptyText: "No More Items",
  moreload: false,
  moreloadText: "Load More Items",
  loading: false,
  loadingText: "Loading..."
})

const emit = defineEmits<{
  (e: 'moreload') : void,
  (e: 'selectrow', row: number) : void,
}>();
</script>