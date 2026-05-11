import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '../../')
const contactDashboard = readFileSync(resolve(root, 'src/components/ContactDashboard.tsx'), 'utf-8')

describe('contact dashboard activity rendering', () => {
  it('uses a mobile-only recent activity summary while preserving the desktop full log', () => {
    expect(contactDashboard).toContain('const mobileActivityLog = activityLog.slice(-30)')
    expect(contactDashboard).toContain('const activeDays = mobileActivityLog.filter((entry) => entry.count > 0).length')
    expect(contactDashboard).toContain('className="space-y-3 md:hidden"')
    expect(contactDashboard).toContain('className="hidden md:block"')
  })
})
