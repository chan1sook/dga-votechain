<template>
  <div>
    <p v-for="token of tokens" class="my-2">
      <template v-for="(line, i) of token.textlines">
        <br v-if="i > 0" />
        <template v-for="text of line.texts">
          <a v-if="typeof text.href === 'string'" :href="text.href" class="underline">{{ text.content }}</a>
          <template v-else>{{  text.content  }}</template>
        </template>
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
  import { toSimpleForamtterTokenize } from "~~/src/simple-formatter/tokenizer";

  const props = withDefaults(defineProps<{
    content?: string,
  }>(), {
    content: "",
  });
  
  const tokens = computed(() => toSimpleForamtterTokenize(props.content))
</script>