<script setup lang="ts">
import MessageItem from "./components/MessageItem.vue";
import { useChatStore } from "./stores/chat";
import { ref, watch, nextTick } from "vue";

const chatStore = useChatStore();
// 输入框内容。
const inputText = ref("");
// 消息区域DOM元素。
const messageArea = ref<HTMLElement | null>(null);

/**
 * 发送消息。
 */
async function submitMessage() {
  const content = inputText.value.trim();
  if (!content || chatStore.isSending) {
    return;
  }
  inputText.value = "";
  await chatStore.sendMessage(content);
}

watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick();
    const element = messageArea.value;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  },
);
</script>

<template>
  <div class="chat">
    <header class="chat__bar">
      <div class="brand">
        <span class="brand__mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="brand__text">
          <h1 class="brand__title">校园AI助手</h1>
          <small class="brand__sub">CAMPUS AI ASSISTANT</small>
        </span>
      </div>
      <!-- 顶部读数只由 store 已有状态推导，未新增任何逻辑。 -->
      <div class="readout">
        <span class="readout__item">
          <span class="readout__label">状态</span>
          <span
            class="readout__value"
            :data-state="chatStore.errorMessage ? 'error' : chatStore.isSending ? 'busy' : 'idle'"
          >
            {{ chatStore.errorMessage ? "连接异常" : chatStore.isSending ? "生成中" : "就绪" }}
          </span>
        </span>
        <span class="readout__item readout__item--count">
          <span class="readout__label">消息</span>
          <span class="readout__value">{{ chatStore.messages.length }}</span>
        </span>
      </div>
    </header>

    <section class="message" ref="messageArea">
      <div class="message__inner">
        <section v-if="chatStore.messages.length === 0" class="intro">
          <p class="intro__eyebrow">校园服务台</p>
          <h2 class="intro__title">今天想先问哪一件？</h2>
          <p class="intro__body">
            课程、教务、图书馆和校园生活的问题都可以直接问，回答会按时间顺序记在这张对话记录里。
          </p>
          <ul class="intro__list">
            <li
              v-for="question in [
                '图书馆周六几点闭馆？',
                '怎么申请在读证明？',
                '帮我安排今晚的复习顺序。',
              ]"
              :key="question"
            >
              <button type="button" class="chip" @click="inputText = question">
                {{ question }}
              </button>
            </li>
          </ul>
        </section>

        <div class="log" role="log" aria-live="polite">
          <MessageItem v-for="message in chatStore.messages" :key="message.id" :message="message" />
          <p v-if="chatStore.isSending" class="pending">
            正在回复<span class="pending__dots" aria-hidden="true"><i></i><i></i><i></i></span>
          </p>
        </div>

        <p v-if="chatStore.errorMessage" class="alert">{{ chatStore.errorMessage }}</p>
      </div>
    </section>

    <footer class="composer">
      <div class="composer__inner">
        <form class="composer__box" @submit.prevent="submitMessage">
          <span class="composer__prompt" aria-hidden="true">&gt;</span>
          <input
            class="composer__input"
            type="text"
            v-model="inputText"
            placeholder="请输入问题"
            aria-label="请输入问题"
          />
          <button type="submit" class="composer__send" :disabled="chatStore.isSending">
            <span>发送</span>
            <svg class="composer__arrow" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2.5 8h10M8.5 4l4 4-4 4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="square"
              />
            </svg>
          </button>
        </form>
        <p class="composer__hint">Enter 发送</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
:global(:root) {
  --ink: #0a1b33;
  --ink-soft: #5b7292;
  --blue: #1552c8;
  --blue-deep: #0b3a8c;
  --blue-soft: #eaf1fd;
  --paper: #eef3fa;
  --surface: #ffffff;
  --sheet: #fbfdff;
  --line: #ccdaef;
  --line-strong: #9db8e0;
  --alert: #b3261e;
  --alert-soft: #fdf1f0;
  --alert-line: #eec7c3;
  --ok: #11875d;
  --grid: rgba(21, 82, 200, 0.07);
  --font-sans:
    "PingFang SC", "HarmonyOS Sans SC", "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei",
    system-ui, sans-serif;
  --font-mono:
    "JetBrains Mono", "SFMono-Regular", "Cascadia Mono", Consolas, "Liberation Mono", monospace;
}

:global(*),
:global(*::before),
:global(*::after) {
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  height: 100%;
}

:global(body) {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

.chat {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  max-width: 1000px;
  margin: 0 auto;
  background: var(--surface);
  border-top: 3px solid var(--blue);
  border-left: 1px solid var(--line);
  border-right: 1px solid var(--line);
}

/* ---------- 顶栏：仪表读数风格的会话状态 ---------- */

.chat__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex: 0 0 auto;
  padding: 12px 22px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.brand__mark {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 5px;
  border: 1px solid var(--blue);
  border-radius: 2px;
  background: var(--blue-soft);
}

.brand__mark i {
  border-radius: 1px;
  background: var(--blue);
}

.brand__mark i:last-child {
  background: transparent;
  border: 1px solid var(--blue-deep);
}

.brand__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.brand__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--ink);
}

.brand__sub {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  color: var(--ink-soft);
}

.readout {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
  font-family: var(--font-mono);
}

.readout__item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.readout__item--count {
  padding-left: 16px;
  border-left: 1px solid var(--line);
}

.readout__label {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--ink-soft);
}

.readout__value {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.readout__value[data-state="idle"] {
  color: var(--ok);
}

.readout__value[data-state="busy"] {
  color: var(--blue);
}

.readout__value[data-state="error"] {
  color: var(--alert);
}

/* ---------- 消息区：独立滚动 + 蓝图网格 ---------- */

.message {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  background-color: var(--sheet);
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 26px 26px;
}

.message__inner {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 24px 30px;
}

.log {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log:empty {
  display: none;
}

/* ---------- 空状态 ---------- */

.intro {
  padding: 22px 20px;
  border: 1px dashed var(--line-strong);
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.75);
}

.intro__eyebrow {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--blue);
}

.intro__title {
  margin: 10px 0 8px;
  font-size: 21px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--ink);
}

.intro__body {
  margin: 0 0 16px;
  max-width: 46ch;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--ink-soft);
}

.intro__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 2px;
  background: var(--surface);
  color: var(--ink);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    color 0.16s ease;
}

.chip::after {
  content: "→";
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--line-strong);
  transition: transform 0.16s ease;
}

.chip:hover {
  border-color: var(--blue);
  background: var(--blue-soft);
  color: var(--blue-deep);
}

.chip:hover::after {
  color: var(--blue);
  transform: translateX(2px);
}

/* ---------- 生成中 / 错误 ---------- */

.pending {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  margin: 0;
  padding: 11px 15px;
  border: 1px solid var(--line);
  border-radius: 2px;
  background: var(--surface);
  font-size: 15px;
  color: var(--ink-soft);
}

.pending__dots {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.pending__dots i {
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: var(--blue);
  animation: chat-pulse 1.15s ease-in-out infinite;
}

.pending__dots i:nth-child(2) {
  animation-delay: 0.15s;
}

.pending__dots i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes chat-pulse {
  0%,
  70%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  35% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--alert-line);
  border-left: 3px solid var(--alert);
  border-radius: 2px;
  background: var(--alert-soft);
  font-size: 13px;
  line-height: 1.6;
  color: #7d211b;
}

/* ---------- 输入区：固定在底部 ---------- */

.composer {
  flex: 0 0 auto;
  padding: 14px 0 calc(14px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--line);
  background: var(--surface);
}

/* 与消息列同宽同内边距：输入框和气泡的左右边界对齐。 */
.composer__inner {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.composer__box {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 6px 6px 6px 12px;
  border: 1px solid var(--line-strong);
  border-radius: 2px;
  background: var(--surface);
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.composer__box:focus-within {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(21, 82, 200, 0.12);
}

.composer__prompt {
  flex: 0 0 auto;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 30px;
  color: var(--blue);
}

.composer__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 5px 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--ink);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
}

.composer__input::placeholder {
  color: #93a8c4;
}

.composer__send {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 8px 14px;
  border: 1px solid var(--blue-deep);
  border-radius: 2px;
  background: var(--blue);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.composer__send:hover:not(:disabled) {
  background: var(--blue-deep);
}

.composer__send:disabled {
  border-color: var(--line);
  background: var(--blue-soft);
  color: #8aa3c6;
  cursor: not-allowed;
}

.composer__arrow {
  width: 14px;
  height: 14px;
}

.composer__hint {
  margin: 8px 2px 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--ink-soft);
}

:global(:focus-visible) {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

/* ---------- 移动端 ---------- */

@media (max-width: 640px) {
  .chat {
    border-left: 0;
    border-right: 0;
  }

  .chat__bar {
    padding: 10px 14px;
  }

  .brand__sub {
    display: none;
  }

  .readout__item--count {
    display: none;
  }

  .message__inner {
    gap: 16px;
    padding: 16px 14px 22px;
  }

  .log {
    gap: 14px;
  }

  .intro {
    padding: 18px 16px;
  }

  .intro__title {
    font-size: 19px;
  }

  .intro__list {
    flex-direction: column;
    align-items: stretch;
  }

  .chip {
    justify-content: space-between;
    width: 100%;
  }

  .composer {
    padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  }

  .composer__inner {
    padding: 0 14px;
  }

  /* 16px 可避免 iOS 聚焦时自动放大页面。 */
  .composer__input {
    font-size: 16px;
  }

  .composer__hint {
    font-size: 9.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chip,
  .chip::after,
  .pending__dots i,
  .composer__box,
  .composer__send {
    transition: none;
    animation: none;
  }
}
</style>
