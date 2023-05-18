<template>
  <div class="dga-user-card" :class="[props.role]">
    <div class="inner">
      <div class="userid"><slot name="userid"></slot></div>
      <div class="role"><slot name="role"></slot></div>
      <div class="content"><slot></slot></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  role?: string,
}>();

</script>

<style scoped>
.dga-user-card {
  @apply rounded-lg shadow-lg bg-green-800 pl-4 md:pl-6 overflow-hidden
}
.dga-user-card.admin {
  @apply bg-blue-700
}
.dga-user-card.developer {
  @apply bg-amber-700
}

.dga-user-card > .inner {
  @apply rounded-lg bg-white grid items-center p-2 md:p-4 gap-2 md:gap-y-0 overflow-auto;
  grid-template-areas: "userid" "role" "content";
  grid-template-columns: auto;
}

@media (min-width: 768px) {
  .dga-user-card > .inner {
    grid-template-areas: "userid userid userid"  "role content content" "role content content";
    grid-template-columns: 150px auto 120px;
  }
}

.dga-user-card > .inner > .private {
  grid-area: public;
  @apply text-xl text-red-700;
}
.dga-user-card > .inner > .public {
  @apply text-green-700;
}

.dga-user-card > .inner > .userid {
  grid-area: userid;
  @apply text-sm;
}
.dga-user-card > .inner > .role {
  grid-area: role;
  @apply text-lg;
}

.dga-user-card > .inner > .content {
  grid-area: content;
  @apply flex flex-col gap-y-2 gap-x-4
}
</style>