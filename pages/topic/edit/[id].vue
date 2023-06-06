<template>
  <div v-if="editable">
    <DgaHead>{{ $t('app.topic.edit.title')  }}</DgaHead>
    <template v-if="!useTemplate">
      <DgaTopicForm v-if="!isTopicStartVote" v-model="topicData" :voter-allows="voterAllows" :coadmins="coadmins" @template="useTemplate = true"></DgaTopicForm>
      <DgaTopicFormCoadminOnly v-else v-model="topicData" :coadmins="coadmins"></DgaTopicFormCoadminOnly>
      <DgaButtonGroup class="col-span-12 mt-4">
        <DgaButton class="!flex flex-row gap-x-2 items-center justify-center truncate"
          color="dga-orange" :title="$t('app.topic.edit.action')" :disabled="!isFormValid" @click="showConfirmModal = true"
        >
          <PencilIcon />
          <span class="truncate">{{ $t('app.topic.edit.action') }}</span>
        </DgaButton>
      </DgaButtonGroup>
    </template>
    <template v-else>
      <DgaTopicTemplate @use-template="applyTemplate" @cancel="useTemplate = false"></DgaTopicTemplate>
    </template>
    <DgaModal :show="showConfirmModal" cancel-backdrop
      @confirm="editTopic"
      @close="showConfirmModal = false"
      @cancel="showConfirmModal = false"
    >
      {{ $t('app.topic.edit.confirm') }}
    </DgaModal>
    <DgaLoadingModal :show="waitEdit"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import PencilIcon from 'vue-material-design-icons/Pencil.vue';

import dayjs from "dayjs";
import { isTopicReadyToVote, isTopicFormValid } from '~/src/services/validations/topic';
import { getDefaultChoices, getPresetTemplate } from '~/src/services/form/topic';

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.topic.edit.title')}`
});

const { id: topicid } = useRoute().params;

const editable = ref(false);
const useTemplate = ref(false);
const showConfirmModal = ref(false);
const waitEdit = ref(false);

const startDate = dayjs(useComputedServerTime()).minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

const voterAllows : Ref<VoterAllowFormData[]> = ref([]);
const coadmins : Ref<CoadminFormData[]> = ref([]);

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  multipleVotes: false,
  choices: getDefaultChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  publicVote: true,
  notifyVoter: true,
  defaultVotes: 1,
  coadmins: [],
  voterAllows: [],
  recoredToBlockchain: true,
});

const isTopicStartVote = ref(false);

const { data } = await useFetch(`/api/topic/info-admin/${topicid}`);
if (!data.value) {
  showError(i18n.t('app.topic.error.notFound'));
} else {
  const { topic, voterAllows: _voteAllows, coadmins: _coadmins, pauseData } = data.value;
  
  const admins = topic.coadmins.slice()
  admins.push(topic.admin);

  if(admins.findIndex((ele) => useSessionData().value.userid === ele) === -1) {
    showError(i18n.t('app.topic.error.notEditable'));
  } else if(pauseData.every((ele) => ele.resumeAt) && dayjs(useComputedServerTime()).diff(topic.voteExpiredAt) > 0) {
    showError(i18n.t('app.topic.error.notEditable'));
  } else {
    isTopicStartVote.value = isTopicReadyToVote(topic);

    topicData.value.name = topic.name;
    topicData.value.description = topic.description;
    topicData.value.choices = topic.choices;
    topicData.value.durationMode = topic.durationMode;
    topicData.value.voteStartAt = dayjs(topic.voteStartAt).toDate();
    topicData.value.voteExpiredAt = dayjs(topic.voteExpiredAt).toDate();
    topicData.value.publicVote = topic.publicVote;
    topicData.value.notifyVoter = topic.notifyVoter;
    topicData.value.multipleVotes = topic.multipleVotes;

    voterAllows.value = _voteAllows;
    coadmins.value = _coadmins;
    editable.value = true;
  }
}

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

async function editTopic() {
  if(!isFormValid.value) {
    return;
  }

  showConfirmModal.value = false;
  waitEdit.value = true;

  const { error } = await useFetch(`/api/topic/edit/${topicid}`, {
    method: "POST",
    body: topicData.value,
  });

  if(error.value) {
    useShowToast({
      title: i18n.t('app.topic.edit.action'),
      content: i18n.t('app.topic.edit.failed'),
      autoCloseDelay: 5000,
    });
  
    waitEdit.value = false;
  } else {
    useShowToast({
      title: i18n.t('app.topic.edit.action'),
      content: i18n.t('app.topic.edit.success') ,
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