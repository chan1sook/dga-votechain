<template>
  <div class="dga-evote-basic-card group/basic-card">
    <div class="header group-hover/basic-card:bg-slate-700">
      <slot name="header"></slot>
    </div>
    <slot>
      <div class="p-2"></div>
    </slot>
  </div>
</template>

<style scoped>
.dga-evote-basic-card {
  @apply transition duration-200 border border-gray-200 rounded-md shadow hover:shadow-md;
}
.dga-evote-basic-card > .header {
  @apply transition duration-200 p-2 font-bold text-lg border-b-2 border-gray-200 bg-slate-500 text-white rounded-t-md;
}
</style>