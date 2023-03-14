<template>
  <div class="p-4 w-full mx-auto">
    <div v-if="topic" class="border-2 border-gray-200 rounded-lg shadow p-4">
      <h1 class="text-3xl font-bold text-center mb-4">
        {{ webAppName }}
      </h1>
      <h2 class="text-2xl font-bold text-center mb-0">
        {{ topic.name }}
      </h2>
      <div class="text-sm text-center text-gray-700 mb-4">#{{ topicid }}</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
        <DetailCard class="self-start">
          <template #header>รายละเอียด</template>
          <div class="p-2">{{ topic.description }}</div>
        </DetailCard>
        <div class="md:col-span-2">
          <div class="flex flex-row flex-wrap justify-center gap-2">
            <button v-if="withImage" v-for="choice of topic.choices.choices" type="button"
              class="dga-evote-btn with-img w-36 inline-flex flex-wrap gap-2 items-center justify-center relative"
              :disabled="!canVote" :title="choice.name" @click="chooseOption(choice.name)">
              <img :src="choice.image">
              <span class="truncate">{{ choice.name }}</span>
              <MaterialIcon v-if="!isChooseAbstention && choice.name === currentChoice" icon="check"
                class="absolute right-2 bottom-2" />
            </button>
            <button v-else v-for="choice of topic.choices.choices" type="button"
              class="dga-evote-btn without-img w-full max-w-3xl inline-flex gap-2 items-center justify-center relative"
              :disabled="!canVote" :title="choice.name" @click="chooseOption(choice.name)">
              <span class="truncate">{{ choice.name }}</span>
              <MaterialIcon v-if="!isChooseAbstention && choice.name === currentChoice" icon="check"
                class="absolute right-2" />
            </button>
          </div>
          <div class="my-2 flex flex-col flex-wrap items-center gap-2">
            <button v-if="topic.choices.customable" class="dga-evote-btn without-img w-full max-w-3xl inline-flex gap-2 items-center justify-center relative"
              :disabled="!canVote" :title="customOption || 'Custom Option'" @click.self="chooseCustomOption">
              <span class="truncate">Custom: </span>
              <input v-model="customOption" type="text" class="dga-evote-input text-gray-700" placeholder="Custom Option" :disabled="!canVote"/>
              <MaterialIcon v-if="!isChooseAbstention && isChooseCustom" icon="check"
                class="absolute right-2" />
            </button>
            <button type="button"
              class="dga-evote-btn vote-abstention w-full max-w-3xl inline-flex gap-2 items-center justify-center relative"
              :disabled="!canVote" title="Vote No" @click="chooseAbstention">
              <span class="truncate">Vote No</span>
              <MaterialIcon v-if="isChooseAbstention" icon="check" class="absolute right-2" />
            </button>
          </div>
          <div class="my-2 mt-8 flex flex-col flex-wrap items-center gap-2">
            <button type="button"
              class="dga-evote-btn vote-confirm w-full max-w-3xl inline-flex gap-2 items-center justify-center relative"
              :class="{ 'invisible': !canVote }" :disabled="!isFormValid" title="Confirm Vote"
              @click="confirmVote">
              <span class="truncate">
                <template v-if="isChooseAbstention">Confirm No Vote</template>
                <template v-else-if="isChooseCustom && customOption">Confirm Vote [{{ customOption }}]</template>
                <template v-else-if="currentChoice">Confirm Vote [{{ currentChoice }}]</template>
                <template v-else>Confirm Vote</template>
              </span>
            </button>
            <button type="button" 
              class="dga-evote-btn vote-later w-full max-w-3xl inline-flex gap-2 items-center justify-center relative"
              :title="canVote ? 'Vote Later' : 'Back'" @click="goBack"
            >
              <span class="truncate">
                <template v-if="canVote">Vote Later</template>
                <template v-else>Back</template>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { goBack, webAppName } from "~~/src/utils/utils"

definePageMeta({
  middleware: ["auth-voter"]
})

const { id } = useRoute().params;
const topicid = Array.isArray(id) ? id[id.length - 1] : id;

useHead({
  title: `${webAppName} - Vote #${topicid}`
});

const { data } = await useFetch(`/api/topic/info/${topicid}`, {
  query: { withVote: "1" },
});

const topic: Ref<TopicResponseData | undefined> = ref(undefined);
const yourVote: Ref<VoteResponseData | undefined> = ref(undefined);
const withImage = computed(() => topic.value && topic.value.choices.choices.some((ele) => ele.image));
const canVote = computed(() => {
  const topicCondition = topic.value && Date.now() <= dayjs(topic.value.voteExpiredAt).valueOf();
  const voteCondition = !yourVote.value;
  return voteCondition && topicCondition;
});
const currentChoice: globalThis.Ref<string | null> = ref(null);
const customOption = ref("");
const isChooseAbstention = ref(false);
const isChooseCustom = ref(false);

const isFormValid = computed(() => {
  return canVote && (isChooseAbstention.value || (isChooseCustom.value && customOption.value !== "") || currentChoice.value !== null)
})
if (!data.value) {
  showError("Topic not found");
} else {
  const { topic: _topic, yourVote: _yourVote } = data.value;
  topic.value = _topic;
  yourVote.value = _yourVote;

  if (yourVote.value) {
    currentChoice.value = yourVote.value.choice ? yourVote.value.choice : null;
    isChooseAbstention.value = !yourVote.value.choice;
  }
}

function chooseOption(choice: string) {
  if (!canVote.value) { return; }
  isChooseAbstention.value = false;
  isChooseCustom.value = false;
  currentChoice.value = choice;
}

function chooseAbstention() {
  if (!canVote.value) { return; }
  isChooseAbstention.value = true;
  isChooseCustom.value = false;
  currentChoice.value = null;
}

function chooseCustomOption() {
  if (!canVote.value || !customOption.value) { return; }
  isChooseAbstention.value = false;
  isChooseCustom.value = true;
  currentChoice.value = null;
}

async function confirmVote(event: MouseEvent) {
  if (!isFormValid.value) {
    return;
  }

  let choice : string | null = currentChoice.value;
  if(isChooseAbstention.value) {
    choice = null;
  } else if(isChooseCustom.value) {
    choice = customOption.value;
  }

  const voteFormData: VoteFormData = {
    topicid,
    choice,
  }
  const { data } = await useFetch("/api/vote", {
    method: "POST",
    body: voteFormData
  })
  
  goBack();
}

</script>

<style scoped>
.dga-evote-btn.with-img {
  @apply rounded-lg disabled:bg-slate-500 disabled:text-white;
}

.dga-evote-btn.without-img {
  @apply disabled:bg-slate-500 disabled:text-white;
}

.dga-evote-btn.vote-abstention {
  @apply bg-red-500 text-white hover:bg-red-700 focus:ring-red-400 disabled:bg-red-500;
}

.dga-evote-btn.vote-confirm {
  @apply bg-green-500 text-gray-700 hover:text-white hover:bg-green-700 focus:ring-green-400 disabled:bg-green-200 disabled:text-slate-500;
}

.dga-evote-btn.vote-later {
  @apply bg-yellow-500 text-gray-700 hover:text-white hover:bg-yellow-700 focus:ring-yellow-400;
}</style>