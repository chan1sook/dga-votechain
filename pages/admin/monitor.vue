<template>
  <div>
    <DgaHead>{{ $t("app.admin.monitor.title") }}</DgaHead>
    <div class="mx-auto flex max-w-5xl flex-col gap-y-2 py-2">
      <div>{{ $t("app.admin.monitor.timeframe.title") }}</div>
      <div class="flex flex-row items-center gap-x-2">
        <DgaVueSelect
          v-model="timeframeDuration"
          :options="timeframeOptions"
          :reduce="(val) => val.value"
          class="flex-1"
        >
        </DgaVueSelect>
        <DgaButton
          class="inline-flex flex-row items-center justify-center gap-x-2 truncate !p-2"
          color="dga-orange"
          :title="$t('app.admin.monitor.refresh')"
          :disabled="loading"
          @click="fetchMetricValue"
        >
          <RefreshIcon />
        </DgaButton>
      </div>
      <div v-if="loading" class="text-center text-xl italic">
        {{ $t("app.loading", "Loading") }}...
      </div>
      <template v-else>
        <div class="mb-2">{{ $t("app.admin.monitor.graph") }}</div>
        <div class="flex flex-col gap-2">
          <div class="h-[300px]">
            <LineChart
              :data="chartPercentData"
              :options="chartPercentOptions"
            />
          </div>
          <div class="h-[300px]">
            <LineChart :data="chartRamData" :options="chartByteOptions" />
          </div>
          <div class="h-[300px]">
            <LineChart :data="chartDiskData" :options="chartByteOptions" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  TimeSeriesScale,
  LinearScale,
} from "chart.js";
import { Line as LineChart } from "vue-chartjs";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import prettyBytes from "pretty-bytes";

import RefreshIcon from "vue-material-design-icons/Refresh.vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  TimeSeriesScale,
  LinearScale
);

dayjs.extend(duration);

const i18n = useI18n();

definePageMeta({
  middleware: ["auth-dev"],
});
useHead({
  title: `${i18n.t("appName", "DGA E-Voting")} - ${i18n.t(
    "app.admin.monitor.title"
  )}`,
});

const timeframeOptions = [
  {
    label: i18n.t("app.admin.monitor.timeframe.mins10"),
    value: dayjs.duration({ minutes: 10 }).asMilliseconds(),
  },
  {
    label: i18n.t("app.admin.monitor.timeframe.hour1"),
    value: dayjs.duration({ hours: 1 }).asMilliseconds(),
  },
  {
    label: i18n.t("app.admin.monitor.timeframe.day1"),
    value: dayjs.duration({ days: 1 }).asMilliseconds(),
  },
  {
    label: i18n.t("app.admin.monitor.timeframe.days7"),
    value: dayjs.duration({ days: 7 }).asMilliseconds(),
  },
  {
    label: i18n.t("app.admin.monitor.timeframe.month1"),
    value: dayjs.duration({ months: 1 }).asMilliseconds(),
  },
];

const metrics: Ref<ServerMetricsResponse | undefined> = ref(undefined);
const loading = ref(false);
const timeframeDuration: Ref<number> = ref(timeframeOptions[0].value);

watch(timeframeDuration, fetchMetricValue);

const chartPercentData = computed(() => {
  return {
    datasets: [
      {
        label: i18n.t("app.admin.monitor.metrics.cpuUsagePercent"),
        borderColor: "rgb(20 184 166)",
        backgroundColor: "rgba(20,184,166,0.5)",
        data: metrics.value?.cpuLogs || [],
      },
      {
        label: i18n.t("app.admin.monitor.metrics.ramUsagePercent"),
        borderColor: "rgb(7,89,133)",
        backgroundColor: "rgba(7,89,133,0.5)",
        data: metrics.value?.ramLogs.map((ele) => [ele[0], ele[1]]) || [],
      },
      {
        label: i18n.t("app.admin.monitor.metrics.diskUsagePercent"),
        borderColor: "rgb(161,98,7)",
        backgroundColor: "rgba(161,98,7,0.5)",
        data: metrics.value?.diskLogs.map((ele) => [ele[0], ele[1]]) || [],
      },
    ],
  };
});

const chartRamData = computed(() => {
  return {
    datasets: [
      {
        label: i18n.t("app.admin.monitor.metrics.ramUsage"),
        borderColor: "rgb(7,89,100)",
        backgroundColor: "rgba(7,89,100,0.5)",
        data: metrics.value?.ramLogs.map((ele) => [ele[0], ele[2]]) || [],
      },
      {
        label: i18n.t("app.admin.monitor.metrics.ramTotal"),
        borderColor: "rgb(7,80,133)",
        backgroundColor: "rgba(7,80,133,0.5)",
        data: metrics.value?.ramLogs.map((ele) => [ele[0], ele[3]]) || [],
        hidden: true,
      },
    ],
  };
});

const chartDiskData = computed(() => {
  return {
    datasets: [
      {
        label: i18n.t("app.admin.monitor.metrics.diskUsage"),
        borderColor: "rgb(161,80,7)",
        backgroundColor: "rgba(161,80,7,0.5)",
        data: metrics.value?.diskLogs.map((ele) => [ele[0], ele[2]]) || [],
      },
      {
        label: i18n.t("app.admin.monitor.metrics.diskTotal"),
        borderColor: "rgb(150,98,7)",
        backgroundColor: "rgba(150,98,7,0.5)",
        data: metrics.value?.diskLogs.map((ele) => [ele[0], ele[3]]) || [],
        hidden: true,
      },
    ],
  };
});

const chartPercentOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          title(context: any) {
            let title = "Data";
            if (context[0]?.parsed.x) {
              title = dayjs(context[0]?.parsed.x)
                .locale(i18n.locale.value || "en")
                .format("D MMMM YYYY HH:mm:ss");
            }
            return title;
          },
          label(context: any) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + " %";
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        type: "timeseries",
        time: {
          displayFormats: {
            second: "HH:mm:ss",
            minute: "HH:mm",
            hour: "HH:mm",
          },
        },
      },
      y: {
        title: "%",
        min: 0,
        max: 100,
      },
    },
  };
});

const chartByteOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          title(context: any) {
            let title = "Data";
            if (context[0]?.parsed.x) {
              title = dayjs(context[0]?.parsed.x)
                .locale(i18n.locale.value || "en")
                .format("D MMMM YYYY HH:mm:ss");
            }
            return title;
          },
          label(context: any) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += prettyBytes(context.parsed.y, {
                locale: i18n.locale.value || "en",
              });
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        type: "timeseries",
        time: {
          displayFormats: {
            second: "HH:mm:ss",
            minute: "HH:mm",
            hour: "HH:mm",
          },
        },
      },
      y: {
        ticks: {
          callback(val: number) {
            return prettyBytes(val, { locale: i18n.locale.value || "en" });
          },
        },
      },
    },
  };
});

async function fetchMetricValue() {
  if (loading.value) {
    return;
  }

  loading.value = true;
  clearTimeout(fetchId);

  const { data: _rawMetrics } = await useFetch("/api/metrics/logs", {
    query: {
      duration: timeframeDuration.value,
    },
  });

  if (_rawMetrics.value) {
    metrics.value = _rawMetrics.value.metrics as ServerMetricsResponse;
  } else {
    showError("Can't get metric data");
  }

  fetchId = setInterval(() => {
    softFetchMetricValue();
  }, 10000);
  loading.value = false;
}

async function softFetchMetricValue() {
  const { data: _rawMetrics } = await useFetch("/api/metrics/logs", {
    query: {
      duration: timeframeDuration.value,
    },
  });

  if (_rawMetrics.value) {
    metrics.value = _rawMetrics.value.metrics as ServerMetricsResponse;
  }
}

let fetchId: NodeJS.Timer | undefined;

onUnmounted(() => {
  clearTimeout(fetchId);
});

fetchMetricValue();
</script>
