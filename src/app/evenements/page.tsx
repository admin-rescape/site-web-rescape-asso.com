"use client";

import dynamic from "next/dynamic";
import type { CalendarEvent } from "@/components/features/events/EventsCalendar";
import { Calendar, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicEvents } from "@/actions/events";
import { Event } from "@prisma/client";

const EventsCalendar = dynamic(
    () => import("@/components/features/events/EventsCalendar"),
    { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-primary/60 font-semibold">Chargement du calendrier...</div> }
);

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await getPublicEvents();
                if (data) {
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const now = new Date();
    // Use midnight of current day so events happening today are included
    now.setHours(0, 0, 0, 0);
    const upcomingEvents = events.filter((e) => new Date(e.start) >= now).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const featuredEvent = upcomingEvents[0];

    const calendarEvents: CalendarEvent[] = events.map(event => ({
        title: event.title,
        start: event.start,
        end: event.end || undefined,
        backgroundColor: "#C85A1E",
        borderColor: "#C85A1E",
        extendedProps: {
            location: event.location || "",
            description: event.description || "",
        }
    }));

    return (
        <div id="evenements-page" className="bg-background min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header id="evenements-header" className="text-center mb-16">
                    <h1 className="text-5xl font-pacifico text-primary mb-6">Nos Événements</h1>
                    <p className="text-xl font-lato text-dark/80 max-w-2xl mx-auto">
                        Retrouvez toutes les dates importantes : distributions, ateliers, événements solidaires...
                    </p>
                </header>

                {/* Featured Next Event */}
                <section id="featured-event" className="mb-20">
                    {featuredEvent ? (
                        <article id="featured-event-card" className="bg-white rounded-2xl shadow-lg border border-primary/10 overflow-hidden flex flex-col md:flex-row">
                            <figure id="featured-event-cover" className="md:w-1/3 bg-primary/10 h-64 md:h-auto flex items-center justify-center text-primary text-6xl">
                                <figcaption className="sr-only">Illustration de l&apos;événement</figcaption>
                                📅
                            </figure>
                            <div className="p-8 md:p-12 md:w-2/3 flex flex-col justify-center">
                                <span className="text-secondary font-bold font-nunito uppercase tracking-wider mb-2">Prochain événement</span>
                                <h2 className="text-3xl font-playfair font-bold text-dark mb-4">{featuredEvent.title}</h2>
                                <p className="text-dark/70 mb-6 font-lato text-lg">
                                    {featuredEvent.description || "Rejoignez-nous pour notre prochain événement."}
                                </p>
                                <ul id="featured-event-meta" className="flex flex-wrap gap-6 text-dark/80 font-nunito mb-8">
                                    <li className="event-meta-item flex items-center gap-2">
                                        <Calendar className="text-primary" aria-hidden="true" />
                                        <time dateTime={new Date(featuredEvent.start).toISOString().split('T')[0]}>
                                            {new Date(featuredEvent.start).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                                        </time>
                                    </li>
                                    <li className="event-meta-item flex items-center gap-2">
                                        <Clock className="text-primary" aria-hidden="true" />
                                        <span>
                                            {new Date(featuredEvent.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                            {featuredEvent.end && ` - ${new Date(featuredEvent.end).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                                        </span>
                                    </li>
                                    {featuredEvent.location && (
                                        <li className="event-meta-item flex items-center gap-2">
                                            <MapPin className="text-primary" aria-hidden="true" />
                                            <address className="not-italic">{featuredEvent.location}</address>
                                        </li>
                                    )}
                                </ul>
                                <button id="featured-event-cta" className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-secondary transition-colors self-start shadow-md hover:shadow-lg">
                                    Je participe !
                                </button>
                            </div>
                        </article>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-12 text-center text-dark/70 font-lato text-lg">
                            {loading ? "Chargement du prochain événement..." : "Aucun événement à venir pour le moment."}
                        </div>
                    )}
                </section>

                {/* Calendar */}
                <section id="events-calendar">
                    <h2 className="text-3xl font-pacifico text-primary mb-8 text-center md:text-left">Calendrier</h2>
                    <EventsCalendar events={calendarEvents} />
                </section>

            </div>
        </div>
    );
}
