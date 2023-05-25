<template>
  <div>
    <DgaHead>{{ $t('topic.request.title')  }}</DgaHead>
    <DgaTopicForm v-model="topicData" no-coadmin></DgaTopicForm>
    <DgaButtonGroup class="col-span-12 mt-4">
      <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
        color="dga-orange" :title="$t('topic.request.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
      >
        <BallotOutlineIcon />
        <span class="truncate">{{ $t('topic.request.action') }}</span>
      </DgaButton>
    </DgaButtonGroup>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="requestTopic"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('topic.request.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>
  
<script setup lang="ts">
import BallotOutlineIcon from 'vue-material-design-icons/BallotOutline.vue';

import dayjs from "dayjs";
import { getComputedServerTime as serverTime } from "~~/src/utils/datetime";
import { getPresetChoices, isTopicFormValid } from "~~/src/utils/topic";

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-voter", () => {
    if(useSessionData().value.roleMode !== "voter") {
      return navigateTo('/topic/create')
    }
  }]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('topic.request.title')}`
});

const showConfirmModal = ref(false);
const waitCreate = ref(false);

const startDate = dayjs(serverTime()).minute(0).second(0).millisecond(0).add(1, "hour").toDate();
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
  showVotersChoicesPublic: false,
  showScores: true,
  voterAllows: [],
  recoredToBlockchain: true,
});

const isFormValid = computed(() => isTopicFormValid(topicData.value))

async function requestTopic() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitCreate.value = true;

  const { error } = await useFetch("/api/topic/request", {
    method: "POST",
    body: topicData.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('topic.request.action'),
      content: i18n.t('topic.request.failed'),
      autoCloseDelay: 5000,
    });
  
    waitCreate.value = false;
  } else {
    useShowToast({
      title: i18n.t('topic.request.action'),
      content: i18n.t('topic.request.success') ,
      autoCloseDelay: 5000,
    });
    navigateTo(localePathOf("/topics"))
  }
}
</script>

<style scoped>
.user-grid {
  @apply grid w-full items-center gap-x-4 pb-2 gap-y-2 whitespace-nowrap;
  grid-template-columns: 36px 2fr 4fr 3fr 36px;
}
.user-grid.multichoice {
  grid-template-columns: 36px 2fr 4fr 3fr 2fr 36px;
}
</style>