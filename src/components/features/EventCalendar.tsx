"use client";

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import { EventClickArg, EventContentArg } from "@fullcalendar/core";

interface Event {
    id: string;
    title: string;
    start: string | Date;
    end?: string | Date;
    location?: string; // extendedProps
    description?: string; // extendedProps
}

interface EventCalendarProps {
    events: Event[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 font-nunito">
            <style jsx global>{`
        .fc {
          --fc-button-bg-color: #C85A1E;
          --fc-button-border-color: #C85A1E;
          --fc-button-hover-bg-color: #E8935A;
          --fc-button-hover-border-color: #E8935A;
          --fc-button-active-bg-color: #2C1A0E;
          --fc-button-active-border-color: #2C1A0E;
          --fc-event-bg-color: #C85A1E;
          --fc-event-border-color: #C85A1E;
          --fc-today-bg-color: #F5ECD7;
        }
        .fc-toolbar-title {
          font-family: 'Pacifico', cursive !important;
          color: #C85A1E;
        }
        .fc-event {
          cursor: pointer;
        }
      `}</style>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,listMonth",
                }}
                locale={frLocale}
                events={events}
                height="auto"
                eventClick={(info: EventClickArg) => {
                    alert(`Event: ${info.event.title}\nLieu: ${info.event.extendedProps.location || ''}`);
                }}
                eventContent={(eventInfo: EventContentArg) => (
                    <div className="overflow-hidden text-ellipsis px-1">
                        <b>{eventInfo.timeText}</b> <i>{eventInfo.event.title}</i>
                    </div>
                )}
            />
        </div>
    );
}
