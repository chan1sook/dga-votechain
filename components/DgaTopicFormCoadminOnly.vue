<template>
  <div class="grid grid-cols-12 items-center gap-x-4 gap-y-2 max-w-4xl mx-auto my-4">
    <h3 class="col-span-12 font-bold mt-2">{{ $t('app.topic.topicQuestion')}}</h3>
    <div class="col-span-12">
      <DgaInput
        :value="topicData.name" type="text" 
        readonly
        class="dga-evote-input w-full" :placeholder="$t('app.topic.topicQuestion')" 
        required
      >
      </DgaInput>
    </div>
    <h3 class="col-span-12 font-bold mt-2">{{ $t('app.topic.coadminList.title') }}</h3>
    <div class="col-span-12 flex flex-col gap-2">
      <div class="overflow-auto max-h-[50vh]">
        <div class="user-grid">
          <div class="font-bold"></div>
          <div class="font-bold">{{ $t('app.userid') }}</div>
          <div class="font-bold">{{ $t('app.userName') }}</div>
          <div class="font-bold">{{ $t('app.email') }}</div>
          <div></div>
          <div class="border-b-2 border-dga-blue" style="grid-column: 1/-1;"></div>
          <template v-for="admin of coadmins">
            <div>
              <ExclamationIcon
                :class="[isCoadminValid(coadmins, admin) ? 'invisible' : '']"
                class="text-red-500" 
                :title="getCoadminErrorReason(admin)"
              />
            </div>
            <div>{{ admin.userid }}</div>
            <div>{{ admin.firstName ? getPrettyFullName(admin) : "-" }}</div>
            <div>{{ admin.email || "-" }}</div>
            <div>
              <button class="align-middle px-2 py-1 inline-flex items-center justify-center"
                :title="`${$t('app.topic.coadminList.remove')} [${getPrettyFullName(admin)}]`"  @click="removeCoadmin(admin)"
              >
                <MinusIcon />
              </button>
            </div>
          </template>
        </div>
      </div>
      <div class="w-full flex flex-row gap-2 items-center justify-center my-1">
        <DgaUserSearch admin-only not-self class="flex-1 max-w-xl" :placeholder="$t('app.topic.coadminList.searchUser')" @select="addCoadmin"></DgaUserSearch>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExclamationIcon from 'vue-material-design-icons/Exclamation.vue';
import MinusIcon from 'vue-material-design-icons/Minus.vue';

import dayjs from 'dayjs';
import { getPrettyFullName } from '~/src/services/formatter/user';
import { getDefaultChoices } from '~/src/services/form/topic';
import { isCoadminValid } from '~/src/services/validations/topic';

const props = withDefaults(defineProps<{
  modelValue?: TopicFormData,
  coadmins?: CoadminFormData[],
}>(), {});

const emit = defineEmits<{
  (e: "update:modelValue", v: TopicFormData) : void,
}>();

const i18n = useI18n();

const startDate = dayjs().minute(0).second(0).millisecond(0).add(1, "hour").toDate();
const expiredDate = dayjs(startDate).add(1, "hour").minute(0).second(0).millisecond(0).toDate();

const coadmins : Ref<CoadminFormData[]> = ref([]);

const topicData = ref<TopicFormData>({
  name: "",
  description: "",
  choices: getDefaultChoices(),
  durationMode: "startDuration",
  voteStartAt: startDate,
  voteExpiredAt: expiredDate,
  coadmins: [],
  multipleVotes: false,
  distinctVotes: false,
  publicVote: true,
  notifyVoter: true,
  defaultVotes: 1,
  voterAllows: [],
  recoredToBlockchain: true,
  images: [],
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
  const result : string[] = [];
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


function getCoadminErrorReason(coadmin: CoadminFormData) {
  return i18n.t('app.topic.coadminList.error.duplicated');
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