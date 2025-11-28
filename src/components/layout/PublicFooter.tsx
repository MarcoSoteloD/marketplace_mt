import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-400 py-12 md:py-12 mt-auto">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

        {/* --- COLUMNA 1: IDENTIDAD MUNICIPAL --- */}
        <div className="flex flex-col items-center md:items-start gap-5">
           <div className="flex items-center gap-3 text-white">
              <div className="relative h-20 w-20 shrink-0">
                  <Image 
                    src="/images/TonilaLogo.svg" 
                    alt="Escudo de Tonila" 
                    width={100} 
                    height={100}
                    className="object-contain h-full w-full"
                  />
              </div>
              <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none">H. Ayuntamiento</span>
                  <span className="font-light text-sm text-stone-400">de Tonila, Jalisco</span>
              </div>
           </div>
           
           <p className="text-sm text-center md:text-left leading-relaxed max-w-xs text-stone-500">
             Impulsando el comercio local y fortaleciendo la economía de nuestra comunidad. <br/>
             <span className="italic text-stone-400">"Un Gobierno para Todos".</span>
           </p>
        </div>

        {/* --- COLUMNA 2: CONTACTO AYUNTAMIENTO --- */}
        <div className="flex flex-col items-center md:items-start gap-4">
            <h3 className="text-white font-semibold text-base tracking-tight">Contacto Oficial</h3>
            
            <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-orange-600 shrink-0" />
                    <span>
                        Juárez S/N, Centro<br/>
                        Tonila, Jalisco. CP 49840
                    </span>
                </div>
                
                <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-orange-600 shrink-0" />
                    <a href="tel:3121234567" className="hover:text-white transition-colors">
                        (312) 321-5200
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-orange-600 shrink-0" />
                    <a href="mailto:contacto@tonila.gob.mx" className="hover:text-white transition-colors">
                        contacto@tonila.gob.mx
                    </a>
                </div>
            </div>
        </div>

        {/* --- COLUMNA 3: NAVEGACIÓN Y LEGAL --- */}
        <div className="flex flex-col items-center md:items-end justify-between gap-6">
            <nav className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm font-medium">
                 <Link href="/terminos" className="hover:text-white hover:underline transition-all">
                    Términos de Servicio
                 </Link>
                 <Link href="/privacidad" className="hover:text-white hover:underline transition-all">
                    Política de Privacidad
                 </Link>
            </nav>
            
            <div className="flex flex-col items-center md:items-end gap-2">
                {/* Enlace externo al sitio web del gobierno si existe */}
                <a 
                    href="https://www.facebook.com/tonilamunicipio/?locale=es_LA" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-full transition-colors"
                >
                    Visita nuestra página de Facebook
                    <ExternalLink className="h-3 w-3" />
                </a>

                <div className="text-xs text-stone-600 text-center md:text-right mt-2">
                    <p>© {currentYear} Manos Tonilenses.</p>
                    <p>Desarrollado para el Gobierno Municipal.</p>
                </div>
            </div>
        </div>

      </div>
    </footer>
  );
}