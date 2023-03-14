<template>
  <details class="dga-evote-detail-detail group/detail-card">
    <summary class="header group-open/detail-card:rounded-b-none group-hover/detail-card:bg-slate-700">
      <slot name="header"></slot>
    </summary>
    <slot>
      <div class="p-2"></div>
    </slot>
  </details>
</template>

<style scoped>
.dga-evote-detail-detail {
  @apply transition duration-200 border border-gray-200 rounded-md shadow hover:shadow-md;
}
.dga-evote-detail-detail > .header {
  @apply transition duration-200 p-2 font-bold text-lg border-b-2 border-gray-200 bg-slate-500 text-white rounded-md;
}
</style>