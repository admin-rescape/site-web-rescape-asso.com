"use client";

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import { EventContentArg } from '@fullcalendar/core';
import { getGlobalCalendarEvents, CalendarEvent } from '@/actions/calendar';
import { toast } from 'sonner';

export function MegaCalendar() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getGlobalCalendarEvents();
                setEvents(data);
            } catch (error) {
                console.error("Erreur lors de la récupération du calendrier", error);
                toast.error("Impossible de charger les événements.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div role="status" aria-live="polite" className="flex flex-col items-center justify-center p-20 text-slate-400">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="font-medium animate-pulse">Chargement du calendrier en cours...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            {/* Dégradé visuel de fond */}
            <div className="absolute top-0 right-0 w-[31.25rem] h-[31.25rem] bg-gradient-to-br from-emerald-50/50 to-blue-50/50 rounded-full blur-3xl opacity-50 -mr-[12.5rem] -mt-[12.5rem] pointer-events-none"></div>

            <div className="relative z-10 w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-[50rem]">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .fc {
                            --fc-border-color: #f1f5f9;
                            --fc-button-text-color: #475569;
                            --fc-button-bg-color: #f8fafc;
                            --fc-button-border-color: #e2e8f0;
                            --fc-button-hover-bg-color: #f1f5f9;
                            --fc-button-hover-border-color: #cbd5e1;
                            --fc-button-active-bg-color: #e2e8f0;
                            --fc-button-active-border-color: #cbd5e1;
                            --fc-event-bg-color: #2563ea;
                            --fc-event-border-color: #1d4ed8;
                            --fc-event-text-color: #ffffff;
                            --fc-page-bg-color: transparent;
                            --fc-neutral-bg-color: #f8fafc;
                            --fc-neutral-text-color: #475569;
                            --fc-today-bg-color: #ecfdf5;
                            font-family: inherit;
                        }

                        .fc-theme-standard th {
                            padding: 12px 0;
                            font-weight: 800;
                            color: #334155;
                            background-color: #f8fafc;
                            text-transform: uppercase;
                            font-size: 0.75rem;
                            letter-spacing: 0.05em;
                        }

                        .fc .fc-toolbar.fc-header-toolbar {
                            margin-bottom: 1.5rem;
                        }

                        .fc .fc-toolbar-title {
                            font-size: 1.5rem;
                            font-weight: 800;
                            color: #1e293b;
                        }

                        .fc .fc-button {
                            border-radius: 0.5rem;
                            font-weight: 700;
                            padding: 0.5rem 1rem;
                            transition: all 0.2s;
                            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                        }

                        .fc .fc-button-primary:not(:disabled):active, 
                        .fc .fc-button-primary:not(:disabled).fc-button-active {
                            background-color: #10b981;
                            border-color: #059669;
                            color: white;
                        }

                        .fc-event {
                            border-radius: 4px;
                            padding: 2px 4px;
                            font-size: 0.75rem;
                            font-weight: 600;
                            border: none;
                            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                            transition: transform 0.1s, box-shadow 0.1s;
                            cursor: pointer;
                        }

                        .fc-event:hover {
                            transform: translateY(-1px);
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            z-index: 10;
                        }

                        .fc-daygrid-event-dot {
                            margin-right: 4px;
                        }

                        .fc .fc-daygrid-day.fc-day-today {
                            background-color: #f0fdf4 !important;
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
                    `}} />

                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,listWeek'
                        }}
                        locales={[frLocale]}
                        locale="fr"
                        events={events} // Nous passons le tableau complet renvoyé par le backend
                        height="auto"
                        contentHeight={600}
                        dayMaxEvents={3}
                        eventContent={renderEventContent}
                        // L'interaction pour un modal de détail (EventClick) pourrait être implémentée ici
                        eventClick={(info) => {
                            const { event } = info;
                            const props = event.extendedProps;
                            const typeStr = props.type === "EVENT" ? "Action Association" : "Organisation Partenaire";
                            const locationStr = props.location ? " - Lieu: " + props.location : "";

                            toast.info(event.title, {
                                description: typeStr + locationStr,
                                duration: 4000,
                            });
                        }}
                        eventDidMount={(info) => {
                            const { event } = info;
                            const props = event.extendedProps;

                            let tooltipContent = event.title;
                            if (props.type === "EVENT") {
                                tooltipContent += `\n📍 ${props.location || "Lieu non précisé"}`;
                            } else {
                                tooltipContent += `\n👤 ${props.userOrganization || props.userName || "Inconnu"}`;
                                tooltipContent += `\nStatut: ${props.status || "Inconnu"}`;
                            }

                            info.el.setAttribute("title", tooltipContent);
                        }}
                    />
                </div>
            </div>

            {/* Légende du Calendrier */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm font-semibold text-slate-600">Action Associative</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                    <span className="text-sm font-semibold text-slate-600">Dépôt/Collecte (Confirmé)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    <span className="text-sm font-semibold text-slate-600">Dépôt/Collecte (En Attente)</span>
                </div>
            </div>
        </div>
    );
}

// Rendu personnalisé pour le contenu de chaque capsule d'événement dans le calendrier
function renderEventContent(eventInfo: EventContentArg) {
    const { event } = eventInfo;

    return (
        <div className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis w-full">
            <span className="truncate">{event.title}</span>
        </div>
    );
}
