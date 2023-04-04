<template>
  <div class="dga-basic-card group/basic-card">
    <div class="header group-hover/basic-card:bg-slate-700">
      <slot name="header"></slot>
    </div>
    <slot>
      <div class="p-2"></div>
    </slot>
  </div>
</template>

<style scoped>
.dga-basic-card {
  @apply transition duration-200 border border-gray-200 rounded-md shadow hover:shadow-md;
}
.dga-basic-card > .header {
  @apply transition duration-200 p-2 font-bold text-lg border-b-2 border-dga-orange-lighter bg-dga-blue text-white rounded-t-md;
}
</style>