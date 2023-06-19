<template>
  <div v-if="editable">
    <DgaHead>{{ $t('app.topic.recreate.title')  }}</DgaHead>
    <template v-if="!useTemplate">
      <DgaTopicForm v-model="topicData" :voter-allows="voterAllows" :coadmins="coadmins" 
        @template="useTemplate = true" @showImage="showImageFromURL"></DgaTopicForm>
      <DgaButtonGroup class="col-span-12 mt-4">
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
    <DgaModal :show="showImageModal" cancel-backdrop close-only @close="showImageModal = false">
      <img :src="imgURL" class="max-h-[77.5vh] object-contain" />
    </DgaModal>
    <DgaLoadingModal :show="waitCreate"></DgaLoadingModal>
  </div>
</template>

<script setup lang="ts">
import BallotIcon from 'vue-material-design-icons/Ballot.vue';

import dayjs from "dayjs";
import { isTopicFormValid } from '~/src/services/validations/topic';
import { getDefaultChoices, getPresetTemplate } from '~/src/services/form/topic';
import { GRAY_BASE64_IMAGE } from '~/src/services/formatter/image';

const localePathOf = useLocalePath();
const i18n = useI18n();

definePageMeta({
  middleware: ["auth-admin"]
})

useHead({
  title: `${i18n.t('appName', 'DGA E-Voting')} - ${i18n.t('app.topic.recreate.title')}`
});

const { id: topicid } = useRoute().params;

const useTemplate = ref(false);
const editable = ref(false);
const showConfirmModal = ref(false);
const waitCreate = ref(false);
const imgURL = ref(GRAY_BASE64_IMAGE);
const showImageModal = ref(false);

const startDate = dayjs(useComputedServerTime()).minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

const voterAllows : Ref<VoterAllowFormData[]> = ref([]);
const coadmins : Ref<CoadminFormData[]> = ref([]);

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  multipleVotes: false,
  distinctVotes: false,
  choices: getDefaultChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  publicVote: true,
  anonymousVotes: false,
  notifyVoter: true,
  defaultVotes: 1,
  coadmins: [],
  voterAllows: [],
  recoredToBlockchain: true,
  images: [],
});

const { data } = await useFetch(`/api/topic/info-admin/${topicid}`);
if (!data.value) {
  showError(i18n.t('app.topic.error.notFound'));
} else {
  const { topic, voterAllows: _voteAllows, coadmins: _coadmins } = data.value;
   
  topicData.value.name = topic.name;
  topicData.value.description = topic.description;
  topicData.value.choices = topic.choices;
  topicData.value.durationMode = topic.durationMode;
  topicData.value.publicVote = topic.publicVote;
  topicData.value.anonymousVotes = topic.anonymousVotes;
  topicData.value.notifyVoter = topic.notifyVoter;
  topicData.value.multipleVotes = topic.multipleVotes;
  topicData.value.distinctVotes = topic.distinctVotes;
  topicData.value.defaultVotes = topic.defaultVotes;

  voterAllows.value = _voteAllows;
  coadmins.value = _coadmins;
  editable.value = true;
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

function showImageFromURL(url: string | undefined) {
  imgURL.value = url || GRAY_BASE64_IMAGE;
  showImageModal.value = true;
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

  const { error } = await useFetch("/api/topic/create/", {
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
.user-grid {
  @apply grid w-full items-center gap-x-4 pb-2 gap-y-2 whitespace-nowrap;
  grid-template-columns: 36px 2fr 4fr 3fr 36px;
}
.user-grid.multichoice {
  grid-template-columns: 36px 2fr 4fr 3fr 2fr 36px;
}
</style>