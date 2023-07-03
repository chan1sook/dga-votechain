<template>
  <div>
    <DgaHead>{{ $t('app.topic.create.title')  }}</DgaHead>
    <template v-if="!useTemplate">
      <DgaTopicForm v-model="topicData" @template="useTemplate = true"></DgaTopicForm>
      <DgaButtonGroup class="mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('app.topic.create.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <BallotIcon />
          <span class="truncate">{{ $t('app.topic.create.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </template>
    <template v-else>
      <DgaTopicTemplate @use-template="applyTemplate" @cancel="useTemplate = false"></DgaTopicTemplate>
    </template>
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
import { getDefaultChoices, getDefaultInternalTopicFilter, getPresetTemplate } from '~/src/services/form/topic';

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.topic.create.title')}`
});

const useTemplate = ref(false);
const showConfirmModal = ref(false);
const waitCreate = ref(false);

const startDate = dayjs(useComputedServerTime()).minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  type: "private",
  internalFilter: getDefaultInternalTopicFilter(),
  choices: getDefaultChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  coadmins: [],
  multipleVotes: false,
  distinctVotes: false,
  anonymousVotes: false,
  notifyVoter: true,
  defaultVotes: 1,
  voterAllows: [],
  showCreator: false,
  recoredToBlockchain: true,
  images: [],
});

const isFormValid = computed(() => isTopicFormValid(topicData.value))

function applyTemplate(name: string) {
  const template = getPresetTemplate(name);
  if(template.name) {
    topicData.value.name = i18n.t(template.name, template.name);
  }
  if(template.choices) {
    topicData.value.choices = {
      choices: template.choices.choices.map((ele) => {
        return {
          name: i18n.t(ele.name, ele.name),
          image: ele.image,
        }
      }),
      customable: template.choices.customable,
    } ;
  }
  
  useTemplate.value = false;
}


async function createTopic() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitCreate.value = true;

  for(const i in topicData.value.images) {
    const file = topicData.value.images[i];
    if(file === undefined) {
      continue;
    } else if(file === false) {
      topicData.value.choices.choices[i].image = undefined;
      continue;
    }

    const formData = new FormData();
    formData.append("image", file);

    const { data } = await useFetch("/api/image/upload", {
      method: "POST",
      body: formData,
      headers: {"cache-control": "no-cache"},
    });

    if(data.value) {
      topicData.value.choices.choices[i].image = data.value.fileName;
    }
  }

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