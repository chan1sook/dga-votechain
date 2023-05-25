<template>
  <div class="grid grid-cols-12 items-center gap-x-4 gap-y-2 max-w-4xl mx-auto my-4">
    <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.topicQuestion')}}</h3>
    <div class="col-span-12">
      <DgaInput
        :value="topicData.name" type="text" 
        readonly
        class="dga-evote-input w-full" :placeholder="$t('topic.topicQuestion')" 
        required
      >
      </DgaInput>
    </div>
    <h3 class="col-span-12 font-bold mt-2">{{ $t('topic.coadminList.title') }}</h3>
    <div class="col-span-12 flex flex-col gap-2">
      <div class="overflow-auto max-h-[50vh]">
        <div class="user-grid">
          <div class="font-bold"></div>
          <div class="font-bold">{{ $t('topic.coadminList.userId') }}</div>
          <div class="font-bold">{{ $t('topic.coadminList.name') }}</div>
          <div class="font-bold">{{ $t('topic.coadminList.email') }}</div>
          <div></div>
          <div class="border-b-2 border-dga-blue" style="grid-column: 1/-1;"></div>
          <template v-for="admin of coadmins">
            <div>
              <ExclamationIcon
                :class="[isCoadminValid(admin) ? 'invisible' : '']"
                class="text-red-500" 
                :title="getCoadminErrorReason(admin)"
              />
            </div>
            <div>{{ admin.userid }}</div>
            <div>{{ admin.firstName ? getCoadminName(admin) : "-" }}</div>
            <div>{{ admin.email || "-" }}</div>
            <div>
              <button class="align-middle px-2 py-1 inline-flex items-center justify-center"
                :title="`${$t('topic.coadminList.remove')} [${getCoadminName(admin)}]`"  @click="removeCoadmin(admin)"
              >
                <MinusIcon />
              </button>
            </div>
          </template>
        </div>
      </div>
      <div class="w-full flex flex-row gap-2 items-center justify-center my-1">
        <DgaUserSearch admin-only not-self class="flex-1 max-w-xl" :placeholder="$t('topic.coadminList.searchUser')" @select="addCoadmin"></DgaUserSearch>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExclamationIcon from 'vue-material-design-icons/Exclamation.vue';
import MinusIcon from 'vue-material-design-icons/Minus.vue';

import dayjs from 'dayjs';
import { choiceCounts, coadminCounts, getPresetChoices, voterCounts } from '~~/src/utils/topic';
import { getCoadminName } from '~~/src/utils/utils';

const props = withDefaults(defineProps<{
  modelValue?: TopicFormData,
  coadmins?: Array<CoadminFormData>,
}>(), {});

const emit = defineEmits<{
  (e: "update:modelValue", v: TopicFormData) : void,
}>();

const i18n = useI18n();

const startDate = dayjs().minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

const coadmins : Ref<Array<CoadminFormData>> = ref([]);

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

const modelValue = computed(() => props.modelValue);
const coadminsRef = computed(() => props.coadmins);

watch(modelValue, (value) => {
  if(value) {
    topicData.value = value;
  }
}, { deep: true, immediate: true })

watch(coadminsRef, (value) => {
  if(value) {
    coadmins.value = value;
  }
}, { deep: true, immediate: true });

watch(coadmins, (value) => {
  const result : Array<string> = [];
  for(const ele of value) {
    if(ele.userid) {
      result.push(ele.userid)
    }
  }
  topicData.value.coadmins = result;
}, { immediate: true, deep: true })

watch(topicData, (value) => {
  emit('update:modelValue', value)
}, { deep: true });


function isCoadminValid(coadmin: CoadminFormData) {
  return coadminCounts(coadmins.value, coadmin) < 2;
}
function getCoadminErrorReason(coadmin: CoadminFormData) {
  return i18n.t('topic.coadminList.error.duplicated');
}

function removeCoadmin(user: CoadminFormData) {
  const compareData = JSON.stringify(user);
  coadmins.value = coadmins.value.filter((ele) => {
    return compareData !== JSON.stringify(ele);
  });
}

function addCoadmin(user: UserSearchResponseData) {
  if(coadmins.value.every((ele) => ele.userid !== user._id)) {
    coadmins.value.push({
      userid: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  }

  return true
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