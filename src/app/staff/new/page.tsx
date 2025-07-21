'use client'

import Calendar from '@/components/ui-components/calendar'

export default function StaffNewPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">New</h1>
            </div>
            
            <Calendar />
        </div>
    )
}
