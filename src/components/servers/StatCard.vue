<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div :class="['stat-value', colorClass]">{{ numericValue }}</div>
    <div class="stat-sub">{{ subLabel }}</div>
    <div v-if="showProgress" class="stat-progress">
      <div
        :class="['stat-progress-fill', progressFillClass]"
        :style="{ width: progressWidth }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useServersStore } from "../../stores/servers";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  color: {
    type: String,
    default: null, // null, 'green', 'red', 'yellow'
  },
})

const serversStore = useServersStore();

const numericValue = computed(() => Number(props.value) || 0);
const total = computed(() => Number(serversStore.totalServers) || 0);
const online = computed(() => Number(serversStore.onlineServers) || 0);
const offline = computed(() => Number(serversStore.offlineServers) || 0);
const unknown = computed(() => Number(serversStore.unknownServers) || 0);
const environmentCount = computed(() => {
  const envs = new Set(serversStore.servers.map((server) => server.env));
  return envs.size;
});

const lowerLabel = computed(() => props.label.toLowerCase());
const isTotal = computed(() => lowerLabel.value.includes("total"));
const isOnline = computed(() => lowerLabel.value.includes("online"));
const isOffline = computed(() => lowerLabel.value.includes("offline"));
const isUnknown = computed(() => lowerLabel.value.includes("unknown"));

const colorClass = computed(() => {
  if (isTotal.value) return "total";
  if (isOnline.value) return "green";
  if (isOffline.value) return "red";
  if (isUnknown.value) return "yellow";
  return props.color ? props.color : "";
});

const percentOfFleet = (count) => {
  if (total.value <= 0) return 0;
  return Math.round((count / total.value) * 100);
};

const subLabel = computed(() => {
  if (isTotal.value) {
    return `across ${environmentCount.value} environments`;
  }

  if (isOnline.value) {
    return `${percentOfFleet(online.value)}% of fleet`;
  }

  if (isOffline.value) {
    if (offline.value === 0) {
      return "all clear";
    }
    return `${offline.value} need attention`;
  }

  if (isUnknown.value) {
    return unknown.value === 0 ? "all resolved" : "ping to resolve";
  }

  return "";
});

const showProgress = computed(
  () => !isTotal.value && (isOnline.value || isOffline.value || isUnknown.value),
);

const progressWidth = computed(() => {
  if (isOnline.value) {
    return `${percentOfFleet(online.value)}%`;
  }

  if (isOffline.value) {
    if (offline.value === 0) {
      return "100%";
    }
    return `${percentOfFleet(offline.value)}%`;
  }

  if (isUnknown.value) {
    return `${percentOfFleet(unknown.value)}%`;
  }

  return "0%";
});

const progressFillClass = computed(() => {
  if (isOnline.value) {
    return "fill-green";
  }

  if (isOffline.value) {
    return offline.value === 0 ? "fill-green" : "fill-red";
  }

  if (isUnknown.value) {
    return "fill-yellow";
  }

  return "";
});
</script>

<style scoped>
.stat-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
}

.stat-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.stat-value.total {
  color: var(--text);
}

.stat-value.green {
  color: var(--green);
}

.stat-value.red {
  color: var(--red);
}

.stat-value.yellow {
  color: var(--yellow);
}

.stat-sub {
  font-size: 10px;
  color: var(--text3);
  margin-top: 5px;
  font-family: var(--font-mono);
}

.stat-progress {
  height: 3px;
  background: var(--bg4);
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}

.stat-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.stat-progress-fill.fill-green {
  background: var(--green);
}

.stat-progress-fill.fill-red {
  background: var(--red);
}

.stat-progress-fill.fill-yellow {
  background: var(--yellow);
}
</style>
