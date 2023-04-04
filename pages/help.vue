<template>
  <div>
    <DgaHead>วิธีการใช้งาน</DgaHead>
    <SimpleContentFormatter :content="content"></SimpleContentFormatter>
  </div>
</template>

<script setup lang="ts">
import { webAppName } from "~~/src/utils/utils"
import { LoremIpsum } from "lorem-ipsum";

definePageMeta({
  middleware: ["auth"]
})

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

const content = ref(lorem.generateParagraphs(2));

useHead({
  title: `${webAppName} - วิธีการใช้งาน`
});

</script>