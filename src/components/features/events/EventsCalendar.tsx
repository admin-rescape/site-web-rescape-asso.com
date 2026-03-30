"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";

export interface CalendarEvent {
    title: string;
    start: Date | string;
    end?: Date | string;
    backgroundColor?: string;
    borderColor?: string;
    extendedProps?: {
        location?: string;
        description?: string;
    };
}

interface EventsCalendarProps {
    events: CalendarEvent[];
}

export default function EventsCalendar({ events }: EventsCalendarProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 font-nunito">
            <style jsx global>{`
                .fc-button-primary {
                    background-color: var(--color-primary) !important;
                    border-color: var(--color-primary) !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .fc-button-primary:hover {
                    background-color: var(--color-secondary) !important;
                    border-color: var(--color-secondary) !important;
                }
                .fc-toolbar-title {
                    font-family: var(--font-playfair);
                }
                .fc-event {
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .fc .fc-toolbar.fc-header-toolbar {
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .fc .fc-toolbar-chunk {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .fc .fc-toolbar-chunk:first-child {
                        flex-wrap: nowrap;
                    }
                    .fc .fc-toolbar-chunk:last-child {
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                    .fc .fc-toolbar-chunk:last-child > .fc-button-group {
                        margin-left: 0;
                    }
                }
            `}</style>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={frLocale}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                height="auto"
                aspectRatio={1.5}
                eventDidMount={(info) => {
                    const { event } = info;
                    const props = event.extendedProps;

                    let tooltipContent = event.title;
                    if (props.location) tooltipContent += `\n📍 ${props.location}`;
                    if (props.description) tooltipContent += `\n📝 ${props.description}`;

                    info.el.setAttribute("title", tooltipContent);
                }}
            />
        </div>
    );
}
