<template>
  <div>
    <DgaHead>{{ $t('app.topic.create.title')  }}</DgaHead>
    <DgaTopicForm v-model="topicData"></DgaTopicForm>
    <DgaButtonGroup class="mt-4">
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        color="dga-orange" :title="$t('app.topic.create.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
      >
        <BallotIcon />
        <span class="truncate">{{ $t('app.topic.create.action') }}</span>
      </DgaButton>
    </DgaButtonGroup>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="createTopic"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('app.topic.create.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import BallotIcon from 'vue-material-design-icons/Ballot.vue';

import dayjs from "dayjs";
import { isTopicFormValid } from '~/src/services/validations/topic';
import { getPresetChoices } from '~/src/services/form/topic';

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.topic.create.title')}`
});

const showConfirmModal = ref(false);
const waitCreate = ref(false);

const startDate = dayjs(useComputedServerTime()).minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  choices: getPresetChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  coadmins: [],
  multipleVotes: false,
  publicVote: true,
  notifyVoter: true,
  defaultVotes: 1,
  voterAllows: [],
  recoredToBlockchain: true,
});

const isFormValid = computed(() => isTopicFormValid(topicData.value))

async function createTopic() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitCreate.value = true;

  const { error } = await useFetch("/api/topic/create", {
    method: "POST",
    body: topicData.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('app.topic.create.action'),
      content: i18n.t('app.topic.create.failed'),
      autoCloseDelay: 5000,
    });
  
    waitCreate.value = false;
  } else {
    useShowToast({
      title: i18n.t('app.topic.create.action'),
      content: i18n.t('app.topic.create.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/topics"))
  }
}
</script>

<style scoped>
</style>