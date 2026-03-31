import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import ServerTagBadge from '../components/servers/ServerTagBadge.vue'
import BulkActionsBar from '../components/servers/BulkActionsBar.vue'
import GaugeCard from '../components/health/GaugeCard.vue'
import SparkLine from '../components/health/SparkLine.vue'
import HealthMiniCard from '../components/health/HealthMiniCard.vue'

beforeEach(() => {
  setActivePinia(createPinia())
})

// ---------------------------------------------------------------------------
// ServerTagBadge
// ---------------------------------------------------------------------------
describe('ServerTagBadge', () => {
  const baseTag = { name: 'critical', color: '#f25f5c' }

  it('renders tag name', () => {
    const wrapper = mount(ServerTagBadge, {
      props: { tag: baseTag },
    })
    expect(wrapper.text()).toContain('critical')
  })

  it('applies tag color as text color style', () => {
    const wrapper = mount(ServerTagBadge, {
      props: { tag: baseTag },
    })
    const span = wrapper.find('.tag-badge')
    expect(span.attributes('style')).toContain('color: #f25f5c')
  })

  it('shows remove button when removable is true', () => {
    const wrapper = mount(ServerTagBadge, {
      props: { tag: baseTag, removable: true },
    })
    expect(wrapper.find('.tag-remove').exists()).toBe(true)
  })

  it('hides remove button when removable is false', () => {
    const wrapper = mount(ServerTagBadge, {
      props: { tag: baseTag, removable: false },
    })
    expect(wrapper.find('.tag-remove').exists()).toBe(false)
  })

  it('emits remove event when X button clicked', async () => {
    const wrapper = mount(ServerTagBadge, {
      props: { tag: baseTag, removable: true },
    })
    await wrapper.find('.tag-remove').trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('applies correct color-based background (color with 15% opacity)', () => {
    const wrapper = mount(ServerTagBadge, {
      props: { tag: baseTag },
    })
    const style = wrapper.find('.tag-badge').attributes('style')
    // #f25f5c + '26' => 26 hex is ~15% opacity
    expect(style).toContain('background: #f25f5c26')
  })
})

// ---------------------------------------------------------------------------
// BulkActionsBar
// ---------------------------------------------------------------------------
describe('BulkActionsBar', () => {
  const defaultProps = { selectedCount: 5, selectedIds: [1, 2, 3, 4, 5] }

  it('renders selected count text', () => {
    const wrapper = mount(BulkActionsBar, { props: defaultProps })
    expect(wrapper.text()).toContain('selected')
  })

  it('shows correct count from props', () => {
    const wrapper = mount(BulkActionsBar, { props: defaultProps })
    expect(wrapper.find('.bulk-count').text()).toBe('5 selected')
  })

  it('emits ping on "Ping Selected" click', async () => {
    const wrapper = mount(BulkActionsBar, { props: defaultProps })
    await wrapper.find('.bulk-btn.ping').trigger('click')
    expect(wrapper.emitted('ping')).toHaveLength(1)
  })

  it('emits delete on "Delete Selected" click', async () => {
    const wrapper = mount(BulkActionsBar, { props: defaultProps })
    await wrapper.find('.bulk-btn.delete').trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('emits clear-selection on "Clear" click', async () => {
    const wrapper = mount(BulkActionsBar, { props: defaultProps })
    await wrapper.find('.bulk-btn.clear').trigger('click')
    expect(wrapper.emitted('clear-selection')).toHaveLength(1)
  })

  it('all buttons are visible with correct text', () => {
    const wrapper = mount(BulkActionsBar, { props: defaultProps })
    const buttons = wrapper.findAll('.bulk-btn')
    expect(buttons).toHaveLength(3)

    const texts = buttons.map((b) => b.text())
    expect(texts).toContain('Ping Selected')
    expect(texts).toContain('Delete Selected')
    expect(texts).toContain('Clear')
  })
})

// ---------------------------------------------------------------------------
// GaugeCard
// ---------------------------------------------------------------------------
describe('GaugeCard', () => {
  const circumference = 2 * Math.PI * 50

  it('renders SVG with correct viewBox', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 50, label: 'CPU' },
    })
    const svg = wrapper.find('.gauge-svg')
    const viewBox = svg.attributes('viewbox') || svg.attributes('viewBox')
    expect(viewBox).toBe('0 0 120 120')
  })

  it('shows value percentage text', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 73.6, label: 'CPU' },
    })
    expect(wrapper.text()).toContain('74%')
  })

  it('shows label text', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 50, label: 'Memory' },
    })
    expect(wrapper.find('.gauge-label').text()).toBe('Memory')
  })

  it('applies green color when value < thresholdWarn (70)', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 45, label: 'CPU' },
    })
    const arc = wrapper.find('.gauge-arc')
    expect(arc.attributes('stroke')).toBe('var(--green)')
  })

  it('applies yellow color when value between warn and crit', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 75, label: 'CPU' },
    })
    const arc = wrapper.find('.gauge-arc')
    expect(arc.attributes('stroke')).toBe('var(--yellow)')
  })

  it('applies red color when value >= thresholdCrit (90)', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 95, label: 'CPU' },
    })
    const arc = wrapper.find('.gauge-arc')
    expect(arc.attributes('stroke')).toBe('var(--red)')
  })

  it('renders subLabel when provided', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 50, label: 'CPU', subLabel: '4 cores' },
    })
    expect(wrapper.find('.gauge-sub-label').text()).toBe('4 cores')
  })

  it('does not render subLabel when not provided', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 50, label: 'CPU' },
    })
    expect(wrapper.find('.gauge-sub-label').exists()).toBe(false)
  })

  it('computes correct stroke-dashoffset for given value', () => {
    const wrapper = mount(GaugeCard, {
      props: { value: 60, label: 'CPU' },
    })
    const arc = wrapper.find('.gauge-arc')
    const expectedOffset = circumference * (1 - 60 / 100)
    const actual = parseFloat(arc.attributes('stroke-dashoffset'))
    expect(actual).toBeCloseTo(expectedOffset, 1)
  })

  it('defaults thresholdWarn to 70 and thresholdCrit to 90', () => {
    // value 69 => green (below default warn of 70)
    const wrapperGreen = mount(GaugeCard, {
      props: { value: 69, label: 'CPU' },
    })
    expect(wrapperGreen.find('.gauge-arc').attributes('stroke')).toBe('var(--green)')

    // value 70 => yellow (at default warn)
    const wrapperYellow = mount(GaugeCard, {
      props: { value: 70, label: 'CPU' },
    })
    expect(wrapperYellow.find('.gauge-arc').attributes('stroke')).toBe('var(--yellow)')

    // value 90 => red (at default crit)
    const wrapperRed = mount(GaugeCard, {
      props: { value: 90, label: 'CPU' },
    })
    expect(wrapperRed.find('.gauge-arc').attributes('stroke')).toBe('var(--red)')
  })
})

// ---------------------------------------------------------------------------
// SparkLine
// ---------------------------------------------------------------------------
describe('SparkLine', () => {
  it('renders SVG element', () => {
    const wrapper = mount(SparkLine, {
      props: { data: [10, 20, 30] },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders polyline with data points', () => {
    const wrapper = mount(SparkLine, {
      props: { data: [10, 20, 30, 40] },
    })
    const polyline = wrapper.find('polyline')
    expect(polyline.exists()).toBe(true)
    // points attribute should contain comma-separated coordinate pairs
    const points = polyline.attributes('points')
    expect(points).toBeTruthy()
    expect(points.split(' ').length).toBe(4)
  })

  it('renders polygon (fill area) beneath the line', () => {
    const wrapper = mount(SparkLine, {
      props: { data: [10, 20, 30, 40] },
    })
    const polygon = wrapper.find('polygon')
    expect(polygon.exists()).toBe(true)
    // polygon should have extra closing points for fill area
    const points = polygon.attributes('points')
    expect(points).toBeTruthy()
    // 4 data points + 2 bottom corner points
    expect(points.split(' ').length).toBe(6)
  })

  it('renders threshold line when thresholdLine prop is set', () => {
    const wrapper = mount(SparkLine, {
      props: { data: [10, 50, 80], thresholdLine: 60 },
    })
    const line = wrapper.find('line')
    expect(line.exists()).toBe(true)
    expect(line.attributes('stroke')).toBe('var(--red)')
    expect(line.attributes('stroke-dasharray')).toBe('4 2')
  })

  it('does not render threshold line when null', () => {
    const wrapper = mount(SparkLine, {
      props: { data: [10, 50, 80], thresholdLine: null },
    })
    expect(wrapper.find('line').exists()).toBe(false)
  })

  it('handles empty data array gracefully', () => {
    const wrapper = mount(SparkLine, {
      props: { data: [] },
    })
    // Should render SVG but no polyline or polygon
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('polyline').exists()).toBe(false)
    expect(wrapper.find('polygon').exists()).toBe(false)
  })

  it('handles single data point', () => {
    const wrapper = mount(SparkLine, {
      props: { data: [42] },
    })
    // A single point means points.length === 1 which is not > 1,
    // so polyline and polygon should not render
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('polyline').exists()).toBe(false)
    expect(wrapper.find('polygon').exists()).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// HealthMiniCard
// ---------------------------------------------------------------------------
describe('HealthMiniCard', () => {
  it('renders 3 bars (CPU, Memory, Disk)', () => {
    const wrapper = mount(HealthMiniCard, {
      props: { cpu: 30, mem: 50, disk: 70 },
    })
    const rows = wrapper.findAll('.mini-bar-row')
    expect(rows).toHaveLength(3)
  })

  it('applies green color when value < 70', () => {
    const wrapper = mount(HealthMiniCard, {
      props: { cpu: 40, mem: 40, disk: 40 },
    })
    const fills = wrapper.findAll('.mini-fill')
    fills.forEach((fill) => {
      expect(fill.attributes('style')).toContain('var(--green)')
    })
  })

  it('applies yellow color when value 70-90', () => {
    const wrapper = mount(HealthMiniCard, {
      props: { cpu: 75, mem: 80, disk: 85 },
    })
    const fills = wrapper.findAll('.mini-fill')
    fills.forEach((fill) => {
      expect(fill.attributes('style')).toContain('var(--yellow)')
    })
  })

  it('applies red color when value > 90', () => {
    const wrapper = mount(HealthMiniCard, {
      props: { cpu: 95, mem: 92, disk: 98 },
    })
    const fills = wrapper.findAll('.mini-fill')
    fills.forEach((fill) => {
      expect(fill.attributes('style')).toContain('var(--red)')
    })
  })

  it('bar width corresponds to value percentage', () => {
    const wrapper = mount(HealthMiniCard, {
      props: { cpu: 45, mem: 72, disk: 10 },
    })
    const fills = wrapper.findAll('.mini-fill')
    expect(fills[0].attributes('style')).toContain('width: 45%')
    expect(fills[1].attributes('style')).toContain('width: 72%')
    expect(fills[2].attributes('style')).toContain('width: 10%')
  })

  it('shows C/M/D labels', () => {
    const wrapper = mount(HealthMiniCard, {
      props: { cpu: 30, mem: 50, disk: 70 },
    })
    const labels = wrapper.findAll('.mini-label')
    expect(labels[0].text()).toBe('C')
    expect(labels[1].text()).toBe('M')
    expect(labels[2].text()).toBe('D')
  })
})
