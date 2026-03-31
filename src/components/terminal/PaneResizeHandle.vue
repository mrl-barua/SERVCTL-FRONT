<template>
  <div
    class="pane-resize-handle"
    :class="[`handle-${direction}`]"
    @mousedown="onMouseDown"
  ></div>
</template>

<script setup>
const props = defineProps({
  direction: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical'].includes(v),
  },
})

const emit = defineEmits(['resize'])

function onMouseDown(e) {
  e.preventDefault()

  const startX = e.clientX
  const startY = e.clientY

  function onMouseMove(moveEvent) {
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY
    const delta = props.direction === 'horizontal' ? deltaX : deltaY
    emit('resize', delta)
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.body.style.cursor =
    props.direction === 'horizontal' ? 'col-resize' : 'row-resize'
  document.body.style.userSelect = 'none'
}
</script>

<style scoped>
.pane-resize-handle {
  flex-shrink: 0;
  background: transparent;
  transition: background 0.15s ease;
  z-index: 1;
}

.pane-resize-handle:hover {
  background: var(--accent);
}

.handle-horizontal {
  width: 4px;
  cursor: col-resize;
}

.handle-vertical {
  height: 4px;
  cursor: row-resize;
}
</style>
