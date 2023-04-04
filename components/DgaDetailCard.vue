<template>
  <details class="dga-detail-card group/detail-card">
    <summary class="header group-open/detail-card:rounded-b-none">
      <slot name="header"></slot>
    </summary>
    <slot>
      <div class="p-2"></div>
    </slot>
  </details>
</template>

<style scoped>
.dga-detail-card {
  @apply transition duration-200 border border-gray-200 rounded-md shadow hover:shadow-md;
}
.dga-detail-card > .header {
  @apply transition duration-200 cursor-pointer p-2 font-bold text-lg border-b-2 border-dga-orange-lighter bg-dga-blue text-white rounded-t-md;
}
</style>