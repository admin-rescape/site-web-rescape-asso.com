import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import ActionsSection from "@/components/sections/ActionsSection";
import NewsSection from "@/components/sections/NewsSection";
import { LocationMap } from "@/components/ui/LocationMap";

export default function Home() {
  return (
    <div id="homepage" className="flex flex-col w-full">
      <HeroSection />

      <StatsSection />

      <ActionsSection />

      {/* Hours & Access Section */}
      <section id="opening-hours" className="py-20 bg-primary/5 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-pacifico text-4xl text-primary mb-6">Venez nous rencontrer</h2>
          <p className="font-lato text-xl text-dark/80 mb-8 max-w-2xl mx-auto">
            Nous sommes ouverts à tous, sans condition.
            4 Place Fogt, 59580 Aniche.
          </p>

          <div id="hours-card" className="bg-white p-8 rounded-2xl shadow-lg inline-block text-left max-w-md w-full border border-primary/10 relative">
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden="true">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-6xl">📍</span>
              </div>
            </div>
            <h3 className="font-playfair text-2xl font-bold mb-6 text-dark relative z-10">Nos horaires</h3>
            <ul id="hours-list" className="font-nunito text-lg mb-8 relative z-10 flex flex-col gap-4">
              {/* Semaine */}
              <li className="hours-item flex justify-between items-center border-b border-gray-100 pb-4 text-dark/80">
                <div className="relative group cursor-help flex items-center gap-1">
                  <span className="font-bold">Lundi au Vendredi</span>
                  <span className="text-primary font-bold text-lg -mt-3" aria-hidden="true">*</span>
                  <div className="hours-tooltip absolute bottom-full left-0 mb-2 w-max px-3 py-1.5 bg-dark text-white text-xs font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50" role="tooltip">
                    Fermé le Mercredi
                    <div className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-dark" aria-hidden="true"></div>
                  </div>
                </div>
                <span className="font-bold text-dark whitespace-nowrap">9h-11h <span className="text-primary/30 px-0.5" aria-hidden="true">/</span> 14h-16h</span>
              </li>

              {/* Samedi */}
              <li className="hours-item flex justify-between items-center text-primary">
                <div className="relative group cursor-help flex items-center gap-1">
                  <span className="font-bold">Samedi</span>
                  <span className="text-dark font-bold text-lg -mt-3" aria-hidden="true">*</span>
                  <div className="hours-tooltip absolute bottom-full left-0 mb-2 w-max px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50" role="tooltip">
                    Semaines paires uniquement
                    <div className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-primary" aria-hidden="true"></div>
                  </div>
                </div>
                <span className="font-bold whitespace-nowrap">10h-12h <span className="opacity-30 px-0.5" aria-hidden="true">/</span> 14h-17h</span>
              </li>
            </ul>
            <LocationMap />
          </div>
        </div>
      </section>

      <NewsSection />
    </div>
  );
}
